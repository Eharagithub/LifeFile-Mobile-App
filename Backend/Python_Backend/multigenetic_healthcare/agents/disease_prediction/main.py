from fastapi import FastAPI
from ..common.schemas import DiseasePredictionRequest, DiseasePredictionResponse
from ..common.utils import setup_logger

app = FastAPI(title="Disease Prediction Agent API")
logger = setup_logger(__name__)

@app.post("/predict_disease", response_model=DiseasePredictionResponse)
async def predict_disease(request: DiseasePredictionRequest):
    """
    Predict diseases based on provided symptoms.
    
    Args:
        request: Disease prediction request with symptoms
        
    Returns:
        DiseasePredictionResponse with predictions or error
    """
    try:
        # TODO: Implement actual disease prediction logic
        if "fever" in request.symptoms:
            return DiseasePredictionResponse(
                predicted_diseases=["Flu", "Common Cold"],
                confidence=0.87
            )
        return DiseasePredictionResponse(
            predicted_diseases=["Unknown"],
            confidence=0.5
        )
    except Exception as e:
        logger.error(f"Error predicting disease: {str(e)}")
        return DiseasePredictionResponse(
            predicted_diseases=[],
            confidence=0.0,
            error=str(e)
        )