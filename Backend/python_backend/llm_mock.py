from fastapi import FastAPI, Request
from typing import Dict, Any

app = FastAPI(title="LLM Mock")


@app.post("/llm")
async def llm_endpoint(req: Request):
    body: Dict[str, Any] = await req.json()
    prompt = body.get("prompt") or body.get("user_input") or ""

    mock_mcp_acl = {
        "mcp": {
            "context": {"user_id": body.get("user_id", "test"), "session_id": body.get("session_id", "s1")},
            "workflow": body.get("workflow", "default"),
        },
        "acl": [
            {
                "agent": "Disease Prediction Agent",
                "action": "predict_disease",
                "params": {"symptoms": [s.strip() for s in prompt.split(',') if s.strip()] or ["fever", "cough"]},
            }
        ],
        "answer": f"Mocked LLM response for prompt: {prompt}"
    }

    return mock_mcp_acl
