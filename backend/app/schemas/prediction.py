from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class IndicatorItem(BaseModel):
    category: str
    indicator: str
    severity: str  # low, medium, high
    description: str

class CompanyChecklistItem(BaseModel):
    field: str
    status: str  # "provided", "missing", "unverified"
    details: str

class ExplanationDetail(BaseModel):
    ml_confidence_note: str
    influential_keywords: List[Dict[str, Any]]
    rule_triggers: List[str]
    summary: str

class PredictionResponse(BaseModel):
    prediction: str = Field(..., description="Legitimate or Potentially Fraudulent")
    is_fraudulent: bool
    fraud_probability: Optional[float] = Field(None, description="Model estimated fraud probability (0.0 to 1.0)")
    confidence_score: float = Field(..., description="Confidence percentage (0 to 100)")
    risk_level: str = Field(..., description="LOW, MEDIUM, or HIGH")
    risk_score: float = Field(..., description="Composite risk score from 0 to 100")
    detected_warning_signs: List[str]
    suspicious_indicators: List[IndicatorItem]
    company_checklist: Dict[str, CompanyChecklistItem]
    explanation: ExplanationDetail
    safety_recommendations: List[str]
    url_analysis: Optional[Dict[str, Any]] = None
    disclaimer: str
    analysis_date: str

class ErrorResponse(BaseModel):
    detail: str
    code: str
    suggestion: Optional[str] = None
