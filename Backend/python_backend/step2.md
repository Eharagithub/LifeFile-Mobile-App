# Step 2: Integrating Vertex AI Gemini-Pro with LangChain (Beginner Friendly)

In this step, you'll connect your FastAPI endpoint to the Gemini-Pro LLM using LangChain and Vertex AI, with API keys for authentication.

## Prerequisites
- You need a Google Cloud account and Vertex AI API access.
- Enable Vertex AI API in your Google Cloud project.
- Create a service account and download its JSON key file.
- Set up your project ID (e.g., `GOOGLE_CLOUD_PROJECT=463029493131`).
- Install required Python packages:
    ```sh
    pip install langchain-google-vertexai google-auth python-dotenv
    ```

## Setting Up Environment Variables
1. Create a `.env` file in your `python_backend` folder with:
    ```
    GOOGLE_APPLICATION_CREDENTIALS=E:/ITTrends/Multiagenetic-Healthcare/Vertex-service/multi-agentic-473210-5750428b951b.json
    GOOGLE_CLOUD_PROJECT=463029493131
    ```
   (Use the absolute path to your service account JSON file.)
2. You do NOT need VERTEX_API_KEY for service account authentication.
3. Your code will load these variables automatically using `python-dotenv`.

## Folder Structure
Your code will be in:
```
python_backend/
  agents/
    disease_prediction/
      main.py
```

## Example Code
```python
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import os


# Load environment variables from .env
from dotenv import load_dotenv
load_dotenv()

# LangChain and Vertex AI imports
from langchain_google_vertexai import VertexAI

app = FastAPI(title="Disease Prediction Agent API")

class DiseasePredictionRequest(BaseModel):
    symptoms: List[str]

class DiseasePredictionResult(BaseModel):
    predicted_diseases: List[str]
    confidence: float

class DiseasePredictionResponse(BaseModel):
    result: DiseasePredictionResult
    error: Optional[str] = None



# Set your Vertex AI project ID (from environment variables)
GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")

# Initialize Vertex AI LLM via LangChain (service account authentication)
vertex_llm = VertexAI(
    project=GOOGLE_CLOUD_PROJECT,
    model_name="gemini-2.5-pro"
)

@app.post("/predict_disease", response_model=DiseasePredictionResponse)
def predict_disease(request: DiseasePredictionRequest):
    try:
        # Step 2: Send symptoms to Gemini-Pro LLM
        prompt = f"Given these symptoms: {', '.join(request.symptoms)}, what are the most likely diseases?"
        llm_response = vertex_llm(prompt)
        # Parse LLM response (customize as needed)
        predicted_diseases = [llm_response]  # Replace with actual parsing logic
        result = DiseasePredictionResult(predicted_diseases=predicted_diseases, confidence=0.9)
        return DiseasePredictionResponse(result=result)
    except Exception as e:
        return DiseasePredictionResponse(result=None, error=str(e))
```

## How It Works
- The endpoint receives symptoms and sends them as a prompt to Gemini-Pro via LangChain and Vertex AI.
- The LLM returns predictions, which are parsed and sent back in the API response.
- API keys and project ID are loaded from environment variables for security.

## How to Test
1. Make sure your `.env` file and service account JSON are set up as described above.
2. Start your FastAPI server:
    ```sh
    uvicorn agents.disease_prediction.main:app --reload --port 8000
    ```
3. Send a POST request as in Step 1. The response will now include predictions from Gemini-Pro.

---
This step connects your API to a powerful LLM for real disease prediction. In production, improve response parsing and error handling as needed.
