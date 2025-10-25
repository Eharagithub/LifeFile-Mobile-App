# Step 5: Orchestration Agent Input Handler

This document explains how the orchestration agent receives and processes the MCP/ACL-enriched output from the LLM using the InputHandler component.

---

## Workflow Overview

1. **LLM Output Enrichment**
   - The LLM returns a response enriched with MCP (Model Context Protocol) and ACL (Agent Communication Language) structures.
   - Example MCP/ACL JSON:
     ```json
     {
       "mcp": {
         "context": {"user_id": "123", "session_id": "abc"},
         "workflow": "patient_journey_and_disease_prediction",
         "timestamp": "2025-09-14T12:00:00Z"
       },
       "acl": [
         {"agent": "Patient Journey Agent", "action": "track_journey", "params": {"patient_id": "123"}},
         {"agent": "Disease Prediction Agent", "action": "predict_disease", "params": {"symptoms": ["cough", "fever"]}}
       ]
     }
     ```

2. **InputHandler Component**
   - The orchestration agent receives the MCP/ACL JSON at its API endpoint.
   - The InputHandler validates the structure and extracts the plan/actions from the ACL section.

3. **Validation and Extraction**
   - If the MCP/ACL structure is invalid, the InputHandler returns an error.
   - If valid, it extracts the plan (list of agent actions) for further orchestration.

---

## Example FastAPI Endpoint Integration

```python
from fastapi import FastAPI
from orchestration.input_handler import InputHandler

app = FastAPI(title="Orchestration Agent API")
input_handler = InputHandler()

@app.post("/orchestrate")
def orchestrate(mcp_acl_json: dict):
    # Step 1: Validate MCP/ACL JSON
    if not input_handler.validate(mcp_acl_json):
        return {"error": "Invalid MCP/ACL structure"}

    # Step 2: Extract plan/actions
    plan = input_handler.extract_plan(mcp_acl_json)

    # Step 3: (Placeholder) Return extracted plan
    return {"plan": plan}
```

---


## Testing the Endpoint

- Start the FastAPI server:
  ```powershell
  uvicorn orchestration_agent.main:app --reload
  ```

- Send a POST request with a sample MCP/ACL payload (full tested command):
  ```powershell
  curl -X POST "http://127.0.0.1:8000/orchestrate" -H "Content-Type: application/json" -d "{\"mcp\": {\"context\": {\"user_id\": \"123\", \"session_id\": \"abc\"}, \"workflow\": \"patient_journey_and_disease_prediction\", \"timestamp\": \"2025-09-14T12:00:00Z\"}, \"acl\": [{\"agent\": \"Patient Journey Agent\", \"action\": \"track_journey\", \"params\": {\"patient_id\": \"123\"}}, {\"agent\": \"Disease Prediction Agent\", \"action\": \"predict_disease\", \"params\": {\"symptoms\": [\"cough\", \"fever\"]}}]}"
  ```

- The endpoint will return the extracted plan if the input is valid.

---

## Summary

The InputHandler is a key component that ensures only valid, structured LLM outputs are processed by the orchestration agent, enabling reliable multi-agent workflows.
