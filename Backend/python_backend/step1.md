# Setting Up Your Python Environment

Before running the FastAPI server, it's best practice to use a Python virtual environment. This keeps your project dependencies isolated and easy to manage.

### 1. Create a Virtual Environment
Open a terminal in your `python_backend` folder and run:
```sh
python -m venv venv
```

### 2. Activate the Virtual Environment (Windows)
```sh
.\venv\Scripts\activate
```

### 3. Upgrade pip and Install Dependencies
```sh
pip install --upgrade pip
pip install -r requirements.txt
```

Now you're ready to run your FastAPI server!
# Step 1: Capturing User Symptoms with FastAPI (Beginner Friendly)

This step shows how to create a FastAPI endpoint to capture a user's symptoms for disease prediction.

## What You'll Build
- A simple API endpoint that receives a list of symptoms from the user.

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

app = FastAPI(title="Disease Prediction Agent API")

class DiseasePredictionRequest(BaseModel):
  symptoms: List[str]

@app.post("/predict_disease")
def predict_disease(request: DiseasePredictionRequest):
  # Step 1: Capture user symptoms from prompt
  # Next step: Send symptoms to LLM for disease prediction
  return {"received_symptoms": request.symptoms}
```

## How It Works
- The user sends a POST request to `/predict_disease` with a JSON body like:
  ```json
  {
    "symptoms": ["fever", "cough", "headache"]
  }
  ```
- The API receives the symptoms and returns them in the response.

## How to Test
1. Start your FastAPI server:
  ```sh
  uvicorn agents.disease_prediction.main:app --reload --port 8000
  ```
2. Send a POST request using curl, Postman, or Swagger UI:
  ```sh
  curl -X POST http://127.0.0.1:8000/predict_disease -H "Content-Type: application/json" -d "{\"symptoms\": [\"fever\", \"cough\"]}"
  ```
3. You should see a response like:
  ```json
  {
    "received_symptoms": ["fever", "cough"]
  }
  ```

---
This sets up the foundation for capturing user input, which will be sent to the LLM for disease prediction in the next step.