from typing import Dict, Any, Optional, List
from pydantic import BaseModel

class DatasetStatusResponse(BaseModel):
    dataset_found: bool
    file_path: str
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    fraudulent_count: Optional[int] = None
    legitimate_count: Optional[int] = None
    fraudulent_percentage: Optional[float] = None
    missing_values: Optional[Dict[str, int]] = None
    message: str
    instructions: Optional[str] = None

class ModelMetrics(BaseModel):
    model_name: str
    trained_at: str
    dataset_version: str
    total_samples: int
    train_samples: int
    test_samples: int
    accuracy: float
    precision_fraud: float
    recall_fraud: float
    f1_fraud: float
    roc_auc: Optional[float] = None
    pr_auc: Optional[float] = None
    confusion_matrix: Dict[str, int]
    classification_report: Dict[str, Any]
    model_comparisons: Optional[List[Dict[str, Any]]] = None

class ModelStatusResponse(BaseModel):
    is_trained: bool
    model_path: str
    model_name: Optional[str] = None
    trained_at: Optional[str] = None
    pipeline_version: Optional[str] = None
    metrics: Optional[ModelMetrics] = None
    message: str
    how_to_train: Optional[str] = None
