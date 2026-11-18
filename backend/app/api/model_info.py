import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from ..config import settings
from ..schemas.metrics import ModelStatusResponse, ModelMetrics
from ..ml.predictor import is_model_trained
from ..utils.logger import logger

router = APIRouter(tags=["Model Insights"])

@router.get("/model/status", response_model=ModelStatusResponse)
def get_model_status():
    """
    Checks if the model pipeline artifact exists and returns training status.
    Never claims a model is trained if the artifact is missing.
    """
    trained = is_model_trained()
    
    if not trained:
        return ModelStatusResponse(
            is_trained=False,
            model_path=str(settings.MODEL_PATH),
            message="Machine Learning model has not been trained yet. Training is pending dataset placement.",
            how_to_train=(
                "To train the model:\n"
                "1. Place 'fake_job_postings.csv' in the 'dataset/' folder.\n"
                "2. Run terminal command: python -m backend.app.ml.train\n"
                "3. Once finished, the pipeline artifact will be saved and ready for real-time predictions."
            )
        )

    # Load metrics from file if available
    metrics = None
    if settings.METRICS_PATH.exists():
        try:
            with open(settings.METRICS_PATH, "r") as f:
                data = json.load(f)
                metrics = ModelMetrics(**data)
        except Exception as e:
            logger.warning(f"Could not load metrics json: {e}")

    return ModelStatusResponse(
        is_trained=True,
        model_path=str(settings.MODEL_PATH),
        model_name="TF-IDF + Structured Features Logistic Regression (Balanced)",
        trained_at=metrics.trained_at if metrics else "Unknown",
        pipeline_version="v1.0",
        metrics=metrics,
        message="Production ML pipeline is trained and operational."
    )

@router.get("/model/metrics")
def get_model_metrics():
    """
    Returns actual evaluation metrics calculated during training.
    Does not invent metrics.
    """
    if not settings.METRICS_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Evaluation metrics not found. Model has not been trained on EMSCAD dataset yet."
        )

    try:
        with open(settings.METRICS_PATH, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read metrics: {str(e)}")

@router.get("/model/confusion-matrix")
def get_confusion_matrix_image():
    """Returns the confusion matrix PNG visualization generated during training."""
    if not settings.CONFUSION_MATRIX_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Confusion matrix image not found. Train the model to generate evaluation plots."
        )
    return FileResponse(settings.CONFUSION_MATRIX_PATH, media_type="image/png")
