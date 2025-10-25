import os
from dotenv import load_dotenv
load_dotenv()
print("GOOGLE_APPLICATION_CREDENTIALS:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
print("GOOGLE_CLOUD_PROJECT:", os.getenv("GOOGLE_CLOUD_PROJECT"))

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import os

# LangChain and Vertex AI imports
try:
    from langchain_google_vertexai import VertexAI
except ImportError:
    VertexAI = None

app = FastAPI(title="Disease Prediction Agent API")


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# MCP/ACL structures
class MCPACLPrompt(BaseModel):
    protocol: str = "MCP"
    agent: str = "disease_prediction"
    action: str = "predict_disease"
    context: Optional[str] = None
    symptoms: List[str]

class DiseasePredictionRequest(BaseModel):
    symptoms: List[str]

class DiseasePredictionResult(BaseModel):
    predicted_diseases: List[str]
    confidence: float

class DiseasePredictionResponse(BaseModel):
    result: Optional[DiseasePredictionResult] = None
    error: Optional[str] = None

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")

# Initialize Vertex AI LLM via LangChain (if available)
vertex_llm = None
if VertexAI and GOOGLE_CLOUD_PROJECT:
    vertex_llm = VertexAI(
        project=GOOGLE_CLOUD_PROJECT,
        model_name="gemini-2.5-pro"
    )


@app.post("/predict_disease", response_model=DiseasePredictionResponse)
def predict_disease(request: DiseasePredictionRequest):
    if not vertex_llm:
        return DiseasePredictionResponse(error="VertexAI or API keys not configured. Please install langchain-google-vertexai and set environment variables.")
    try:
        # Build a clear prompt for the medical diagnosis
        prompt = f"""You are a medical AI assistant. Based on the following symptoms, analyze and predict possible diseases:

Symptoms:
{', '.join(request.symptoms)}

Please provide your response in this format:
{{
    "predicted_diseases": ["Disease1", "Disease2", ...],
    "confidence": 0.XX,
    "explanation": "Brief explanation of the predictions",
    "severity": "low/medium/high",
    "recommendation": "Brief medical recommendation"
}}"""

        # Send to Gemini-Pro LLM
        llm_response = vertex_llm(prompt)

        # Try to extract structured disease predictions
        import json
        try:
            # Try to find JSON content in the response
            start_idx = llm_response.find('{')
            end_idx = llm_response.rfind('}') + 1
            if start_idx != -1 and end_idx != -1:
                json_str = llm_response[start_idx:end_idx]
                parsed_response = json.loads(json_str)
                diseases = parsed_response.get('predicted_diseases', [])
                confidence = parsed_response.get('confidence', 0.8)
            else:
                # Fallback: treat the whole response as a disease prediction
                diseases = [d.strip() for d in llm_response.split(',') if d.strip()]
                confidence = 0.7
        except json.JSONDecodeError:
            # If JSON parsing fails, use the raw response
            diseases = [llm_response.strip()]
            confidence = 0.6

        result = DiseasePredictionResult(
            predicted_diseases=diseases,
            confidence=confidence
        )
        return DiseasePredictionResponse(result=result)
    except Exception as e:
        return DiseasePredictionResponse(error=str(e))
