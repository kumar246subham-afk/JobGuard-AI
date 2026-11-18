import os
from pathlib import Path
from typing import List

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

class Settings:
    PROJECT_NAME: str = "JobGuard AI"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI-Powered Fake Job & Internship Detection Platform"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]
    
    # Dataset and Model Paths
    DATASET_DIR: Path = PROJECT_ROOT / "dataset"
    DATASET_PATH: Path = DATASET_DIR / "fake_job_postings.csv"
    
    MODELS_DIR: Path = BASE_DIR / "models"
    MODEL_PATH: Path = MODELS_DIR / "jobguard_pipeline_v1.joblib"
    
    REPORTS_DIR: Path = BASE_DIR / "reports"
    METRICS_PATH: Path = REPORTS_DIR / "training_metrics.json"
    CONFUSION_MATRIX_PATH: Path = REPORTS_DIR / "confusion_matrix.png"
    EDA_REPORT_PATH: Path = REPORTS_DIR / "eda_summary.json"
    
    # File limits
    MAX_PDF_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB

settings = Settings()

# Ensure directories exist
settings.DATASET_DIR.mkdir(parents=True, exist_ok=True)
settings.MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.REPORTS_DIR.mkdir(parents=True, exist_ok=True)
