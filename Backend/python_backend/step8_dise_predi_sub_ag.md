
# Step 8: Disease Prediction Sub-Agent Integration with FHIR (Beginner Friendly)

This guide walks you through the full workflow of integrating a Disease Prediction Agent with a public FHIR server, using beginner-friendly explanations and all the necessary curl commands.

---

## Overview of the Workflow

1. **Create a Patient in FHIR**: Add a new patient to the public HAPI FHIR demo server.
2. **Add Symptoms (Observations)**: Attach one or more symptoms to the patient as FHIR Observations.
3. **Orchestration Agent Request**: Use the patient ID to trigger disease prediction via your orchestration agent.
4. **How the Code Works**: Understand how the TaskHandler and DomainLogic fetch symptoms from FHIR and make predictions.
5. **See the Results**: View the prediction and the symptoms used.

---

## 1. Add a New Patient to the HAPI FHIR Demo Server

This step creates a new patient record. Run this in PowerShell:

```powershell
curl -X POST "https://hapi.fhir.org/baseR4/Patient" -H "Content-Type: application/fhir+json" -d "{\"resourceType\": \"Patient\", \"name\": [{\"use\": \"official\", \"family\": \"Doe\", \"given\": [\"John\"]}]}"
```
**What happens?**
- The server responds with a JSON object containing the new patient's `id` (e.g., `49494361`).

---

## 2. Add a Symptom (Observation) for the Patient

This step attaches a symptom (like "Fever") to the patient. Replace `NEW_PATIENT_ID` with the ID from the previous step:

```powershell
curl -X POST "https://hapi.fhir.org/baseR4/Observation" -H "Content-Type: application/fhir+json" -d "{\"resourceType\": \"Observation\", \"status\": \"final\", \"code\": {\"text\": \"Fever\"}, \"subject\": {\"reference\": \"Patient/NEW_PATIENT_ID\"}}"
```
**What happens?**
- The server responds with a JSON object confirming the Observation and showing the symptom (e.g., "Fever").

---

## 3. Orchestration Agent: Disease Prediction Request Using FHIR Patient ID

Now, use the patient ID to trigger disease prediction in your backend:

```powershell
curl -X POST "http://127.0.0.1:8000/orchestrate" -H "Content-Type: application/json" -d "{\"mcp\": {\"context\": {\"user_id\": \"123\", \"session_id\": \"abc\"}, \"workflow\": \"patient_journey_and_disease_prediction\", \"timestamp\": \"2025-10-01T12:00:00Z\"}, \"acl\": [{\"agent\": \"Disease Prediction Agent\", \"action\": \"predict_disease\", \"params\": {\"patient_id\": \"NEW_PATIENT_ID\"}}]}"
```
**What happens?**
- Your orchestration agent fetches the patient's symptoms from FHIR and uses them for disease prediction.

---

## 4. How the Disease Prediction Agent Works

### TaskHandler
- Receives the task from the orchestration agent (e.g., `{ "action": "predict_disease", ... }`).
- Calls the `DomainLogic` to process the task.

### DomainLogic
- Checks if a `patient_id` is provided.
- If yes, calls the FHIR API endpoint to fetch Observations (symptoms) for that patient:
	- **FHIR API endpoint used:**
		- `GET https://hapi.fhir.org/baseR4/Observation?patient=NEW_PATIENT_ID&_count=10`
- Extracts the symptom names from the FHIR response.
- Uses these symptoms to make a prediction (mock logic: if any symptom is "fever" (case-insensitive), predicts "Flu" and "Common Cold").
- Returns the prediction and the symptoms used.

---


## 5. Full End-to-End Test: Orchestration Agent and Disease Prediction Agent

### Example curl Command

```powershell
curl -X POST "http://127.0.0.1:8000/orchestrate" -H "Content-Type: application/json" -d "{\"mcp\": {\"context\": {\"user_id\": \"123\", \"session_id\": \"abc\"}, \"workflow\": \"patient_journey_and_disease_prediction\", \"timestamp\": \"2025-10-01T12:00:00Z\"}, \"acl\": [{\"agent\": \"Disease Prediction Agent\", \"action\": \"predict_disease\", \"params\": {\"patient_id\": \"49494361\"}}]}"
```

### Actual Result

```
{"dispatch_results":[{"agent":"Disease Prediction Agent","result":{"predicted_diseases":["Flu","Common Cold"],"confidence":0.87,"symptoms_used":["Fever"]},"error":null}]}
```

This demonstrates a successful end-to-end workflow: the orchestration agent receives the request, dispatches it to the Disease Prediction Agent, which fetches symptoms from FHIR and returns the prediction.

---



## 6. Running the Orchestration Endpoint (Single Port)

In this architecture, you only need to run the orchestration agent's FastAPI endpoint. The orchestration agent will directly call the sub-agent logic (like Disease Prediction or Patient Journey) as Python modules within the same process. All sub-agent logic (including the Disease Prediction Agent) is imported and called internally as Python modules. You do **not** need to run multiple servers or use multiple ports.

**To start the server:**

```powershell
uvicorn orchestration_agent.main:app --reload --port 8000
```

This will make all agent logic available through the `/orchestrate` endpoint on port 8000.

---

## 7. Tips and Troubleshooting

- **All curl JSON bodies must be on a single line and use escaped quotes (`\"`).**
- The HAPI FHIR demo server is public and data may be periodically wiped.
- If no symptoms are found, the agent returns "Unknown".
- You can add more Observations (symptoms) to the same patient to test multi-symptom scenarios.
- For persistent or private data, consider running your own FHIR server.

---

This workflow demonstrates a full, beginner-friendly, Pythonic, multi-agent integration with real-world healthcare data using FHIR and a modular Disease Prediction Agent. You can extend this pattern to more agents, more complex logic, or real clinical data as needed.
