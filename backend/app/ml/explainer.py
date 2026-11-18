from typing import Dict, Any, List, Optional
import numpy as np

def explain_prediction(
    pipeline,
    job_dict: Dict[str, Any],
    rule_indicators: List[Dict[str, Any]],
    rule_warnings: List[str]
) -> Dict[str, Any]:
    """
    Computes explainable AI factors for both ML model feature contributions
    and rule-based suspicious indicators.
    """
    influential_keywords = []
    ml_confidence_note = ""

    # Check if pipeline contains TF-IDF and Logistic Regression
    try:
        # Check if the pipeline has named steps
        if hasattr(pipeline, "named_steps"):
            text_pipeline = pipeline.named_steps.get("features")
            classifier = pipeline.named_steps.get("classifier")
            
            # Extract tfidf from FeatureUnion or ColumnTransformer
            tfidf = None
            if text_pipeline:
                if hasattr(text_pipeline, "transformer_list"):
                    text_trans = dict(text_pipeline.transformer_list).get("text")
                    if text_trans and hasattr(text_trans, "named_steps"):
                        tfidf = text_trans.named_steps.get("tfidf")
                elif hasattr(text_pipeline, "named_transformers_"):
                    text_trans = text_pipeline.named_transformers_.get("text")
                    if text_trans and hasattr(text_trans, "named_steps"):
                        tfidf = text_trans.named_steps.get("tfidf")
            
            if tfidf and classifier and hasattr(classifier, "coef_"):
                # Extract text
                from .preprocessor import normalize_text
                text = " ".join([
                    str(job_dict.get("title") or ""),
                    str(job_dict.get("company_profile") or ""),
                    str(job_dict.get("description") or ""),
                    str(job_dict.get("requirements") or ""),
                    str(job_dict.get("benefits") or "")
                ])
                normalized = normalize_text(text)
                
                # Transform text with tfidf
                vec = tfidf.transform([normalized])
                feature_names = np.array(tfidf.get_feature_names_out())
                
                # Coefficients for fraudulent class (class 1)
                # First len(feature_names) coefficients correspond to text features
                text_dim = len(feature_names)
                if classifier.coef_.shape[1] >= text_dim:
                    coefs = classifier.coef_[0, :text_dim]
                    
                    # Compute feature contributions: coef * tfidf_val
                    cx = vec.tocoo()
                    word_contributions = []
                    for i, v in zip(cx.col, cx.data):
                        score = coefs[i] * v
                        word = feature_names[i]
                        word_contributions.append((word, float(score)))
                    
                    # Sort by absolute contribution or positive (fraud-pushing) contribution
                    word_contributions.sort(key=lambda item: item[1], reverse=True)
                    
                    # Top positive contributors (pushing towards fraudulent)
                    for word, score in word_contributions[:6]:
                        if score > 0.005:
                            influential_keywords.append({
                                "word": word,
                                "direction": "Suspicious / Fraud Risk",
                                "weight": round(score, 4),
                                "explanation": f"Term '{word}' historically correlates with higher fraud probability in training data."
                            })
                    
                    # Top negative contributors (pushing towards legitimate)
                    legit_contributions = [item for item in word_contributions if item[1] < -0.005]
                    legit_contributions.sort(key=lambda item: item[1])
                    for word, score in legit_contributions[:4]:
                        influential_keywords.append({
                            "word": word,
                            "direction": "Legitimacy Indicator",
                            "weight": round(score, 4),
                            "explanation": f"Term '{word}' frequently occurs in verified legitimate listings."
                        })
        
        ml_confidence_note = (
            "Model explanation derived from Logistic Regression TF-IDF weight vectors multiplied "
            "by input term frequencies, reflecting statistical correlation with historical EMSCAD job postings."
        )
    except Exception as e:
        ml_confidence_note = f"Detailed token contribution extraction bypassed: {str(e)}"

    summary_parts = []
    if rule_warnings:
        summary_parts.append(f"Triggered {len(rule_warnings)} heuristic security rules.")
    if influential_keywords:
        susp_count = sum(1 for kw in influential_keywords if kw["direction"].startswith("Suspicious"))
        summary_parts.append(f"Detected {susp_count} vocabulary patterns associated with fraudulent postings.")
    
    if not summary_parts:
        summary_text = "No severe red flags or suspicious lexical anomalies detected in this posting."
    else:
        summary_text = " ".join(summary_parts)

    return {
        "ml_confidence_note": ml_confidence_note,
        "influential_keywords": influential_keywords,
        "rule_triggers": rule_warnings,
        "summary": summary_text
    }
