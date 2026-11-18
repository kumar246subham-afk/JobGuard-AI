import os
import pandas as pd
from fastapi import APIRouter
from ..config import settings
from ..schemas.metrics import DatasetStatusResponse
from ..utils.logger import logger

router = APIRouter(tags=["Dataset"])

@router.get("/dataset/status", response_model=DatasetStatusResponse)
def get_dataset_status():
    """
    Checks if the EMSCAD dataset CSV exists.
    Returns real statistics if present, or clear instructions if missing.
    Never fabricates sample data or fake records.
    """
    exists = settings.DATASET_PATH.exists() and settings.DATASET_PATH.is_file()
    
    if not exists:
        return DatasetStatusResponse(
            dataset_found=False,
            file_path=str(settings.DATASET_PATH),
            message=(
                "EMSCAD dataset 'fake_job_postings.csv' was not found. "
                "The system requires the real CSV file to train the ML pipeline."
            ),
            instructions=(
                "1. Download the EMSCAD dataset (fake_job_postings.csv).\n"
                "2. Place the file inside the project directory: dataset/fake_job_postings.csv\n"
                "3. Run training command: python -m backend.app.ml.train"
            )
        )

    try:
        df = pd.read_csv(settings.DATASET_PATH)
        row_count = len(df)
        col_count = len(df.columns)
        
        fraud_count = None
        legit_count = None
        fraud_pct = None
        
        if "fraudulent" in df.columns:
            counts = df["fraudulent"].value_counts().to_dict()
            legit_count = int(counts.get(0, 0))
            fraud_count = int(counts.get(1, 0))
            if row_count > 0:
                fraud_pct = round((fraud_count / row_count) * 100, 2)

        missing_vals = df.isnull().sum().to_dict()
        missing_dict = {k: int(v) for k, v in missing_vals.items()}

        return DatasetStatusResponse(
            dataset_found=True,
            file_path=str(settings.DATASET_PATH),
            row_count=row_count,
            column_count=col_count,
            fraudulent_count=fraud_count,
            legitimate_count=legit_count,
            fraudulent_percentage=fraud_pct,
            missing_values=missing_dict,
            message=f"Dataset verified successfully with {row_count:,} genuine records."
        )
    except Exception as e:
        logger.error(f"Error inspecting dataset: {e}")
        return DatasetStatusResponse(
            dataset_found=True,
            file_path=str(settings.DATASET_PATH),
            message=f"Dataset file is present but could not be parsed: {str(e)}"
        )
