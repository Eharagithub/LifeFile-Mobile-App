from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List, Optional

app = FastAPI(title="Symptom Analyzer Agent API")

class SymptomAnalyzerRequest(BaseModel):
    symptoms_text: str

class SymptomAnalysisResult(BaseModel):
    identified_symptoms: List[str]
    confidence: float
    severity_level: str

class SymptomAnalyzerResponse(BaseModel):
    result: Optional[SymptomAnalysisResult] = None
    error: Optional[str] = None

@app.post("/analyze_symptoms", response_model=SymptomAnalyzerResponse)
def analyze_symptoms(request: SymptomAnalyzerRequest):
    """
    Takes raw symptom text and extracts structured symptoms.
    """
    try:
        # Sample symptom extraction logic
        text = request.symptoms_text.lower()
        identified_symptoms = []
        
        # Common symptom keywords - extend as needed
        symptom_map = {
            'headache': ['headache', 'head pain', 'head ache'],
            'nausea': ['nausea', 'nauseous', 'feeling sick'],
            'fever': ['fever', 'high temperature', 'temperature'],
            'cough': ['cough', 'coughing'],
            'fatigue': ['fatigue', 'tired', 'exhausted'],
            'pain': ['pain', 'ache', 'sore'],
            'dizziness': ['dizzy', 'dizziness', 'light-headed', 'light headed']
        }

        # Simple keyword matching
        for symptom, keywords in symptom_map.items():
            if any(keyword in text for keyword in keywords):
                identified_symptoms.append(symptom)

        # Determine severity based on symptom count
        if len(identified_symptoms) >= 4:
            severity = "high"
            confidence = 0.9
        elif len(identified_symptoms) >= 2:
            severity = "medium"
            confidence = 0.8
        else:
            severity = "low"
            confidence = 0.7

        result = SymptomAnalysisResult(
            identified_symptoms=identified_symptoms,
            confidence=confidence,
            severity_level=severity
        )

        return SymptomAnalyzerResponse(result=result)
    except Exception as e:
        return SymptomAnalyzerResponse(error=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy"}