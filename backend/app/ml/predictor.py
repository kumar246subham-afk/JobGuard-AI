import os
from datetime import datetime
from typing import Dict, Any, Optional
import pandas as pd
import joblib

from .preprocessor import TextCombiner, StructuredFeatureExtractor
from .rules import analyze_rules, generate_company_checklist, get_safety_recommendations
from .explainer import explain_prediction
from ..config import settings
from ..utils.logger import logger

_MODEL_CACHE = None

def get_model():
    """
    Retrieves the cached ML pipeline artifact or loads it from disk.
    If the model has not been trained, returns None.
    """
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE

    if settings.MODEL_PATH.exists() and settings.MODEL_PATH.is_file():
        try:
            logger.info(f"Loading trained model pipeline from {settings.MODEL_PATH}")
            _MODEL_CACHE = joblib.load(settings.MODEL_PATH)
            return _MODEL_CACHE
        except Exception as e:
            logger.error(f"Failed to load model pipeline: {e}")
            return None
    return None

def is_model_trained() -> bool:
    """Checks whether the fitted pipeline artifact is available."""
    return settings.MODEL_PATH.exists() and settings.MODEL_PATH.is_file()

def predict_job(job_data: Dict[str, Any], url_analysis_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Runs full inference on job listing:
    1. Checks if trained ML model is available. If not, raises RuntimeError with clear setup instructions.
    2. Runs rule-based heuristic scanner (internship scams, monetary requests, etc.).
    3. Runs Scikit-Learn pipeline to predict probability and class.
    4. Computes composite risk score and risk level (LOW, MEDIUM, HIGH).
    5. Computes Explainable AI factors (TF-IDF keyword weights and rule triggers).
    6. Generates Company transparency checklist.
    7. Provides student-focused safety recommendations and standard disclaimer.
    """
    model = get_model()
    if model is None:
        raise RuntimeError(
            "ML model pipeline has not been trained yet. "
            "Please place 'fake_job_postings.csv' into the 'dataset/' folder and run "
            "'python -m backend.app.ml.train' to train the production model."
        )

    # 1. Rule-based evaluation
    indicators, warning_signs, rule_risk_score = analyze_rules(job_data)

    # 2. ML Pipeline inference
    input_df = pd.DataFrame([{
        "title": str(job_data.get("title") or ""),
        "company_profile": str(job_data.get("company_profile") or ""),
        "description": str(job_data.get("description") or ""),
        "requirements": str(job_data.get("requirements") or ""),
        "benefits": str(job_data.get("benefits") or ""),
        "telecommuting": int(job_data.get("telecommuting") or 0),
        "has_company_logo": int(job_data.get("has_company_logo") or 0),
        "has_questions": int(job_data.get("has_questions") or 0),
        "employment_type": str(job_data.get("employment_type") or ""),
        "required_experience": str(job_data.get("required_experience") or ""),
        "required_education": str(job_data.get("required_education") or ""),
        "industry": str(job_data.get("industry") or ""),
        "function": str(job_data.get("function") or "")
    }])

    try:
        # Predict class and probabilities
        pred_class = int(model.predict(input_df)[0])
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(input_df)[0]
            fraud_prob = float(probs[1])  # probability of class 1 (fraudulent)
        else:
            fraud_prob = 1.0 if pred_class == 1 else 0.0
    except Exception as e:
        logger.error(f"Inference error in ML pipeline: {e}")
        raise RuntimeError(f"Error during ML prediction execution: {str(e)}")

    # 3. Composite Risk Calculation
    # ML probability contributes 60%, Rule-based risk contributes 40%
    ml_risk_component = fraud_prob * 100.0
    composite_risk = (0.60 * ml_risk_component) + (0.40 * rule_risk_score)
    composite_risk = round(min(max(composite_risk, 0.0), 100.0), 1)

    # Risk level thresholding
    if composite_risk >= 60.0 or fraud_prob >= 0.70 or rule_risk_score >= 60.0:
        risk_level = "HIGH"
        prediction_label = "Potentially Fraudulent"
        is_fraud = True
    elif composite_risk >= 30.0 or fraud_prob >= 0.35 or rule_risk_score >= 25.0:
        risk_level = "MEDIUM"
        prediction_label = "Potentially Fraudulent" if fraud_prob >= 0.50 else "Legitimate (Proceed with Caution)"
        is_fraud = fraud_prob >= 0.50
    else:
        risk_level = "LOW"
        prediction_label = "Legitimate"
        is_fraud = False

    # Model confidence score (percentage distance from 0.5 decision boundary scaled)
    confidence_score = round(abs(fraud_prob - 0.5) * 200, 1)  # 50% prob = 0% certainty, 100% prob = 100%
    confidence_score = max(confidence_score, 50.0)  # Baseline report confidence

    # 4. Explainable AI breakdown
    explanation = explain_prediction(model, job_data, indicators, warning_signs)

    # 5. Company Transparency Checklist
    company_checklist = generate_company_checklist(job_data)

    # 6. Safety recommendations
    title_str = str(job_data.get("title") or "")
    emp_type_str = str(job_data.get("employment_type") or "")
    is_internship = "intern" in (title_str + " " + emp_type_str).lower()
    recommendations = get_safety_recommendations(risk_level, is_internship)

    disclaimer = (
        "JobGuard AI is an automated decision-support tool designed for informational and educational purposes. "
        "Predictions indicate statistical correlation with historical scam patterns and do NOT provide a legally binding "
        "or absolute guarantee of legitimacy or fraud. Always perform independent verification before sharing personal "
        "data or accepting employment offers."
    )

    return {
        "prediction": prediction_label,
        "is_fraudulent": is_fraud,
        "fraud_probability": round(fraud_prob, 4),
        "confidence_score": confidence_score,
        "risk_level": risk_level,
        "risk_score": composite_risk,
        "detected_warning_signs": warning_signs,
        "suspicious_indicators": indicators,
        "company_checklist": company_checklist,
        "explanation": explanation,
        "safety_recommendations": recommendations,
        "url_analysis": url_analysis_result,
        "disclaimer": disclaimer,
        "analysis_date": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }
