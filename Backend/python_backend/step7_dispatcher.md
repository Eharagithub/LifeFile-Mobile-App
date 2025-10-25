# Step 7: Agent Dispatcher Integration

This document explains the role and integration of the AgentDispatcher component in the orchestration agent workflow.

---

## Workflow Context

After the orchestration agent sequences the plan/actions using the TaskPlanner, the next step is to dispatch these tasks to the appropriate sub-agents using the AgentDispatcher.

---

## AgentDispatcher Responsibilities
- Sends each sequenced task to the correct sub-agent.
- Handles communication (e.g., direct function call, API call, message queue) with sub-agents.
- Collects results and errors from each sub-agent for aggregation.

---

## Example Integration in FastAPI Endpoint

```python
from orchestration.agent_dispatcher import AgentDispatcher

agent_dispatcher = AgentDispatcher()

@app.post("/orchestrate")
def orchestrate(mcp_acl_json: dict):
    # ... previous steps ...
    sequenced_tasks = task_planner.sequence_tasks(plan)

    # Step 4: Dispatch tasks to sub-agents
    dispatch_results = agent_dispatcher.dispatch(sequenced_tasks)

    # Step 5: Return dispatch results
    return {"dispatch_results": dispatch_results}
```

---

## Example curl Command for Testing

```powershell
curl -X POST "http://127.0.0.1:8000/orchestrate" -H "Content-Type: application/json" -d "{\"mcp\": {\"context\": {\"user_id\": \"123\", \"session_id\": \"abc\"}, \"workflow\": \"patient_journey_and_disease_prediction\", \"timestamp\": \"2025-09-14T12:00:00Z\"}, \"acl\": [{\"agent\": \"Patient Journey Agent\", \"action\": \"track_journey\", \"params\": {\"patient_id\": \"123\"}}, {\"agent\": \"Disease Prediction Agent\", \"action\": \"predict_disease\", \"params\": {\"symptoms\": [\"cough\", \"fever\"]}}]}"
```

---

## Example Response

```
{"dispatch_results":[{"agent":"Patient Journey Agent","result":null,"error":null},{"agent":"Disease Prediction Agent","result":null,"error":null}]}
```

---

## Summary

The AgentDispatcher is responsible for routing tasks to sub-agents and collecting their results. This modular approach enables scalable, maintainable, and testable multi-agent workflows. In the current implementation, the dispatcher returns placeholders; you can extend it to call real sub-agent logic next.
