# Step 6: Task Planner Integration

This document explains the role and integration of the TaskPlanner component in the orchestration agent workflow.

---

## Workflow Context

After the orchestration agent receives and validates the MCP/ACL-enriched LLM output using the InputHandler, the next step is to sequence the extracted plan/actions using the TaskPlanner.

---

## TaskPlanner Responsibilities
- Breaks down the plan into actionable tasks.
- Determines dependencies and the correct order for agent activations (if needed).
- Prepares the tasks for dispatching to sub-agents.

---

## Example Integration in FastAPI Endpoint

```python
from orchestration.input_handler import InputHandler
from orchestration.task_planner import TaskPlanner

input_handler = InputHandler()
task_planner = TaskPlanner()

@app.post("/orchestrate")
def orchestrate(mcp_acl_json: dict):
    # Step 1: Validate MCP/ACL JSON
    if not input_handler.validate(mcp_acl_json):
        return {"error": "Invalid MCP/ACL structure"}

    # Step 2: Extract plan/actions
    plan = input_handler.extract_plan(mcp_acl_json)

    # Step 3: Sequence and enrich tasks
    sequenced_tasks = task_planner.sequence_tasks(plan)

    # Step 4: (Placeholder) Return sequenced tasks
    return {"sequenced_tasks": sequenced_tasks}
```

---

## Example curl Command for Testing

```powershell
curl -X POST "http://127.0.0.1:8000/orchestrate" -H "Content-Type: application/json" -d "{\"mcp\": {\"context\": {\"user_id\": \"123\", \"session_id\": \"abc\"}, \"workflow\": \"patient_journey_and_disease_prediction\", \"timestamp\": \"2025-09-14T12:00:00Z\"}, \"acl\": [{\"agent\": \"Patient Journey Agent\", \"action\": \"track_journey\", \"params\": {\"patient_id\": \"123\"}}, {\"agent\": \"Disease Prediction Agent\", \"action\": \"predict_disease\", \"params\": {\"symptoms\": [\"cough\", \"fever\"]}}]}"
```

---

## Example Response

```
{"sequenced_tasks":[{"agent":"Patient Journey Agent","action":"track_journey","params":{"patient_id":"123"}},{"agent":"Disease Prediction Agent","action":"predict_disease","params":{"symptoms":["cough","fever"]}}]}
```

---

## Summary

The TaskPlanner is a key orchestration component that prepares the extracted plan for execution by sub-agents. This modular approach enables scalable, maintainable, and testable multi-agent workflows.
