import os
import json
import time
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)

import matplotlib
matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

from .preprocessor import TextCombiner, StructuredFeatureExtractor, normalize_text
from ..config import settings
from ..utils.logger import logger

REQUIRED_COLUMNS = [
    "title",
    "company_profile",
    "description",
    "requirements",
    "benefits",
    "telecommuting",
    "has_company_logo",
    "has_questions",
    "employment_type",
    "required_experience",
    "required_education",
    "industry",
    "function",
    "fraudulent"
]

def check_dataset_exists() -> bool:
    """Checks whether the EMSCAD fake_job_postings.csv exists."""
    return settings.DATASET_PATH.exists() and settings.DATASET_PATH.is_file()

def load_and_validate_dataset() -> pd.DataFrame:
    """
    Step 1: Dataset loading and validation.
    Checks required columns, dimensions, data types, missing values, duplicates, and target distribution.
    """
    if not check_dataset_exists():
        err_msg = (
            f"\n[DATASET NOT FOUND]\n"
            f"The EMSCAD dataset was not found at expected path: {settings.DATASET_PATH.resolve()}\n"
            f"Please download 'fake_job_postings.csv' from Kaggle or official EMSCAD repository and place it in:\n"
            f"  {settings.DATASET_DIR.resolve()}/fake_job_postings.csv\n"
            f"See dataset/README.md for column specifications and instructions.\n"
        )
        logger.error(err_msg)
        raise FileNotFoundError(err_msg)

    logger.info(f"Loading dataset from: {settings.DATASET_PATH}")
    df = pd.read_csv(settings.DATASET_PATH)
    logger.info(f"Dataset successfully loaded. Dimensions: {df.shape[0]} rows, {df.shape[1]} columns.")

    # Check required columns
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset missing required columns: {missing_cols}")

    # Validate target column values
    df["fraudulent"] = pd.to_numeric(df["fraudulent"], errors="coerce")
    df = df.dropna(subset=["fraudulent"])
    df["fraudulent"] = df["fraudulent"].astype(int)

    # Check target distribution
    target_counts = df["fraudulent"].value_counts().to_dict()
    logger.info(f"Target distribution: Legitimate (0): {target_counts.get(0, 0)}, Fraudulent (1): {target_counts.get(1, 0)}")

    return df

def generate_eda_report(df: pd.DataFrame) -> dict:
    """
    Step 2: Exploratory Data Analysis summary.
    """
    total_rows = len(df)
    target_counts = df["fraudulent"].value_counts().to_dict()
    fraud_count = int(target_counts.get(1, 0))
    legit_count = int(target_counts.get(0, 0))
    fraud_pct = round((fraud_count / total_rows) * 100, 2) if total_rows > 0 else 0.0

    missing_counts = df.isnull().sum().to_dict()
    missing_dict = {k: int(v) for k, v in missing_counts.items()}

    # Employment type breakdown by class
    emp_type = df.groupby(["employment_type", "fraudulent"]).size().unstack(fill_value=0).to_dict(orient="index")
    # Logo breakdown
    logo_breakdown = df.groupby(["has_company_logo", "fraudulent"]).size().unstack(fill_value=0).to_dict(orient="index")

    eda_summary = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_rows": total_rows,
        "total_columns": len(df.columns),
        "legitimate_count": legit_count,
        "fraudulent_count": fraud_count,
        "fraudulent_percentage": fraud_pct,
        "class_imbalance_ratio": f"1 : {round(legit_count / max(fraud_count, 1), 1)}",
        "missing_values": missing_dict,
        "employment_type_distribution": emp_type,
        "logo_distribution": logo_breakdown
    }

    # Save summary json
    with open(settings.EDA_REPORT_PATH, "w") as f:
        json.dump(eda_summary, f, indent=2)

    logger.info(f"EDA summary saved to {settings.EDA_REPORT_PATH}")
    return eda_summary

def build_model_pipeline() -> Pipeline:
    """
    Step 5: Build Scikit-Learn Pipeline combining Text and Structured features
    using ColumnTransformer/FeatureUnion.
    """
    text_pipeline = Pipeline([
        ("combiner", TextCombiner()),
        ("tfidf", TfidfVectorizer(
            max_features=10000,
            ngram_range=(1, 2),
            min_df=3,
            sublinear_tf=True
        ))
    ])

    structured_pipeline = Pipeline([
        ("extractor", StructuredFeatureExtractor())
    ])

    features = FeatureUnion([
        ("text", text_pipeline),
        ("structured", structured_pipeline)
    ])

    # Baseline Classifier: Logistic Regression with class-weight='balanced'
    classifier = LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        C=1.0,
        random_state=42,
        solver="liblinear"
    )

    full_pipeline = Pipeline([
        ("features", features),
        ("classifier", classifier)
    ])

    return full_pipeline

def train_and_evaluate():
    """
    Executes full training pipeline:
    1. Loads dataset
    2. Runs EDA
    3. Stratified Train/Test split
    4. Trains primary pipeline & compares candidate algorithms
    5. Evaluates metrics (Precision, Recall, F1, ROC-AUC, PR-AUC)
    6. Generates Confusion Matrix plot & reports
    7. Saves versioned pipeline artifact
    """
    start_time = time.time()
    df = load_and_validate_dataset()
    eda_summary = generate_eda_report(df)

    X = df[[c for c in df.columns if c != "fraudulent"]]
    y = df["fraudulent"].values

    # Stratified Train/Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    logger.info(f"Train samples: {len(X_train)} (Fraud: {sum(y_train)}), Test samples: {len(X_test)} (Fraud: {sum(y_test)})")

    # Fit Primary Production Pipeline (Logistic Regression with class_weight='balanced')
    logger.info("Training production pipeline (TF-IDF + Structured Features + Balanced Logistic Regression)...")
    pipeline = build_model_pipeline()
    
    # 5-Fold Stratified Cross Validation on Training set
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="f1")
    logger.info(f"5-Fold CV F1 Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    pipeline.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = pipeline.predict(X_test)
    y_prob = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else None

    acc = float(accuracy_score(y_test, y_pred))
    prec_fraud = float(precision_score(y_test, y_pred, pos_label=1, zero_division=0))
    rec_fraud = float(recall_score(y_test, y_pred, pos_label=1, zero_division=0))
    f1_fraud = float(f1_score(y_test, y_pred, pos_label=1, zero_division=0))
    roc_auc = float(roc_auc_score(y_test, y_prob)) if y_prob is not None else None
    pr_auc = float(average_precision_score(y_test, y_prob)) if y_prob is not None else None

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]
    cm_dict = {"true_negative": tn, "false_positive": fp, "false_negative": fn, "true_positive": tp}

    report = classification_report(y_test, y_pred, target_names=["Legitimate (0)", "Fraudulent (1)"], output_dict=True)

    logger.info(f"Test Accuracy: {acc:.4f} | Fraud Precision: {prec_fraud:.4f} | Fraud Recall: {rec_fraud:.4f} | Fraud F1: {f1_fraud:.4f}")
    if roc_auc:
        logger.info(f"ROC-AUC: {roc_auc:.4f} | PR-AUC: {pr_auc:.4f}")

    # Plot and save Confusion Matrix
    plt.figure(figsize=(6, 5))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="YlOrBr",
        xticklabels=["Legitimate (0)", "Fraudulent (1)"],
        yticklabels=["Legitimate (0)", "Fraudulent (1)"]
    )
    plt.title("Confusion Matrix - JobGuard AI (Test Set)")
    plt.ylabel("Actual Label")
    plt.xlabel("Predicted Label")
    plt.tight_layout()
    plt.savefig(settings.CONFUSION_MATRIX_PATH, dpi=150)
    plt.close()
    logger.info(f"Confusion matrix plot saved to {settings.CONFUSION_MATRIX_PATH}")

    # Step: Model Comparisons (Linear SVM & Multinomial Naive Bayes)
    logger.info("Evaluating model comparison benchmarks...")
    comparisons = [
        {
            "model_name": "Logistic Regression (Production)",
            "accuracy": round(acc, 4),
            "precision_fraud": round(prec_fraud, 4),
            "recall_fraud": round(rec_fraud, 4),
            "f1_fraud": round(f1_fraud, 4),
            "roc_auc": round(roc_auc, 4) if roc_auc else None
        }
    ]

    # Benchmark: Linear SVM (using CalibratedClassifierCV for probability estimation)
    try:
        svm_pipeline = Pipeline([
            ("features", build_model_pipeline().named_steps["features"]),
            ("classifier", CalibratedClassifierCV(estimator=LinearSVC(class_weight="balanced", random_state=42, max_iter=2000)))
        ])
        svm_pipeline.fit(X_train, y_train)
        svm_pred = svm_pipeline.predict(X_test)
        svm_prob = svm_pipeline.predict_proba(X_test)[:, 1]
        comparisons.append({
            "model_name": "Calibrated Linear SVM",
            "accuracy": round(float(accuracy_score(y_test, svm_pred)), 4),
            "precision_fraud": round(float(precision_score(y_test, svm_pred, pos_label=1, zero_division=0)), 4),
            "recall_fraud": round(float(recall_score(y_test, svm_pred, pos_label=1, zero_division=0)), 4),
            "f1_fraud": round(float(f1_score(y_test, svm_pred, pos_label=1, zero_division=0)), 4),
            "roc_auc": round(float(roc_auc_score(y_test, svm_prob)), 4)
        })
    except Exception as e:
        logger.warning(f"SVM comparison skipped: {e}")

    # Benchmark: Multinomial Naive Bayes (text only)
    try:
        nb_pipeline = Pipeline([
            ("combiner", TextCombiner()),
            ("tfidf", TfidfVectorizer(max_features=5000, ngram_range=(1, 2))),
            ("classifier", MultinomialNB())
        ])
        nb_pipeline.fit(X_train, y_train)
        nb_pred = nb_pipeline.predict(X_test)
        nb_prob = nb_pipeline.predict_proba(X_test)[:, 1]
        comparisons.append({
            "model_name": "Multinomial Naive Bayes",
            "accuracy": round(float(accuracy_score(y_test, nb_pred)), 4),
            "precision_fraud": round(float(precision_score(y_test, nb_pred, pos_label=1, zero_division=0)), 4),
            "recall_fraud": round(float(recall_score(y_test, nb_pred, pos_label=1, zero_division=0)), 4),
            "f1_fraud": round(float(f1_score(y_test, nb_pred, pos_label=1, zero_division=0)), 4),
            "roc_auc": round(float(roc_auc_score(y_test, nb_prob)), 4)
        })
    except Exception as e:
        logger.warning(f"NB comparison skipped: {e}")

    # Save metrics JSON
    metrics_data = {
        "model_name": "TF-IDF + Structured Features Logistic Regression (Balanced)",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_version": "EMSCAD Fake Job Postings",
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(acc, 4),
        "precision_fraud": round(prec_fraud, 4),
        "recall_fraud": round(rec_fraud, 4),
        "f1_fraud": round(f1_fraud, 4),
        "roc_auc": round(roc_auc, 4) if roc_auc else None,
        "pr_auc": round(pr_auc, 4) if pr_auc else None,
        "confusion_matrix": cm_dict,
        "classification_report": report,
        "model_comparisons": comparisons,
        "training_time_seconds": round(time.time() - start_time, 2)
    }

    with open(settings.METRICS_PATH, "w") as f:
        json.dump(metrics_data, f, indent=2)
    logger.info(f"Metrics saved to {settings.METRICS_PATH}")

    # Save fitted production pipeline
    joblib.dump(pipeline, settings.MODEL_PATH)
    logger.info(f"Fitted production pipeline artifact saved to {settings.MODEL_PATH}")

    return metrics_data

if __name__ == "__main__":
    train_and_evaluate()
