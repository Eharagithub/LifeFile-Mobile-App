# Step 3: MCP/ACL Prompt Enrichment (Beginner Friendly)

## Overview
Prompt enrichment for multi-agent systems should happen in two places:

1. **Before sending to the LLM (Vertex AI):**
   - The `disease_prediction` agent wraps the symptoms in an MCP (Model Context Protocol) and ACL (Agent Communication Language) structure, adding metadata, context, and agent info to the prompt.

2. **After receiving the LLM response:**
   - The agent packages the LLM output in an MCP/ACL-compliant response before sending it to the orchestration agent, ensuring context and communication standards are maintained.

## Why Enrich the Prompt?
- **MCP** provides context, workflow state, and metadata for the LLM, improving accuracy and traceability.
- **ACL** standardizes agent communication, making it easier to coordinate multiple agents and maintain interoperability.


## Example Workflow
- **Step 1:** User submits symptoms via API.
- **Step 2:** `disease_prediction` agent builds an MCP/ACL-enriched prompt and sends it to Vertex AI Gemini-Pro.
- **Step 3:** The agent receives the LLM response, wraps it in MCP/ACL, and returns it to the orchestration agent.

### Example MCP/ACL-Enriched Prompt
```json
{
   "protocol": "MCP",
   "agent": "disease_prediction",
   "action": "predict_disease",
   "context": "Disease prediction for healthcare workflow",
   "symptoms": ["fever", "cough", "headache"]
}
```

### Example MCP/ACL-Enriched Response
```json
{
   "protocol": "MCP",
   "agent": "disease_prediction",
   "action": "predict_disease_result",
   "context": "Disease prediction result for healthcare workflow",
   "llm_raw_response": "Status: Success\nAgent: disease_prediction\nAction: prediction_result\n..."
}
```

### Workflow Summary
- The agent wraps the user input in MCP/ACL before sending to the LLM.
- The LLM response is also wrapped in MCP/ACL before returning to orchestration.
- This ensures all communication is standardized and context-rich for multi-agent workflows.

## Next Steps
- Define the MCP/ACL structure for your requests and responses.
- Update the FastAPI endpoint to build and send enriched prompts.
- Ensure all agent responses are MCP/ACL-compliant for orchestration.

---
Let me know if you want to see example MCP/ACL structures or update the code for prompt enrichment!