from fastapi import APIRouter
from datetime import datetime
from ..config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
def get_health():
    """Returns application health and operational status."""
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "dataset_ready": settings.DATASET_PATH.exists(),
        "model_ready": settings.MODEL_PATH.exists()
    }
