from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class PatientJourneyRequest(BaseModel):
    """Request model for patient journey tracking."""
    patient_id: str
    action: str
    params: Dict[str, Any] = {}

class PatientJourneyResponse(BaseModel):
    """Response model for patient journey tracking."""
    visits: List[Dict[str, Any]] = []
    error: Optional[str] = None

class DiseasePredictionRequest(BaseModel):
    """Request model for disease prediction."""
    symptoms: List[str]
    patient_id: Optional[str] = None

class DiseasePredictionResponse(BaseModel):
    """Response model for disease prediction."""
    predicted_diseases: List[str]
    confidence: float
    error: Optional[str] = None