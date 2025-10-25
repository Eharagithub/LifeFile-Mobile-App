
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from orchestration.input_handler import InputHandler
from orchestration.task_planner import TaskPlanner
from orchestration.agent_dispatcher import AgentDispatcher
from services.enrichment_service import EnrichmentService
from services.llm_service import LLMService

# Initialize FastAPI app
app = FastAPI(title="Orchestration Agent API")

# Enable CORS
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/health")
def health_check():
    """Simple health endpoint for orchestration agent."""
    return {"status": "healthy"}

# Initialize services and handlers
enrichment_service = EnrichmentService()
llm_service = LLMService()
input_handler = InputHandler()
task_planner = TaskPlanner()
agent_dispatcher = AgentDispatcher()

class MCPACLInput(BaseModel):
    mcp_acl: Dict[str, Any]

@app.post("/orchestrate")
async def orchestrate(input_data: MCPACLInput):
    """
    Receives pre-enriched MCP/ACL JSON and orchestrates the execution.
    The enrichment and LLM processing should happen before this endpoint.
    """
    try:
        # Step 1: Validate MCP/ACL structure
        if not input_handler.validate(input_data.mcp_acl):
            raise HTTPException(status_code=400, detail="Invalid MCP/ACL structure")

        # Step 2: Extract execution plan
        plan = input_handler.extract_plan(input_data.mcp_acl)
        
        # Step 3: Sequence tasks
        sequenced_tasks = task_planner.sequence_tasks(plan)
        
        # Step 4: Dispatch tasks to sub-agents
        results = agent_dispatcher.dispatch(sequenced_tasks)
        
        return {
            "status": "success",
            "results": results
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Orchestration error: {str(e)}")
    # Step 2: Validate MCP/ACL JSON
    if not input_handler.validate(mcp_acl_json):
        return {"error": "Invalid MCP/ACL structure from LLM"}

    # Step 3: Extract plan/actions
    plan = input_handler.extract_plan(mcp_acl_json)

    # Step 4: Sequence and enrich tasks
    sequenced_tasks = task_planner.sequence_tasks(plan)

    # Step 5: Dispatch tasks to sub-agents
    dispatch_results = agent_dispatcher.dispatch(sequenced_tasks)

    # Step 6: Return dispatch results
    return {"dispatch_results": dispatch_results}



@app.post("/orchestrate")
def orchestrate(mcp_acl_json: dict):
    """Main orchestration endpoint."""
    # Step 1: Validate MCP/ACL JSON
    if not input_handler.validate(mcp_acl_json):
        return {"error": "Invalid MCP/ACL structure"}

    # Step 2: Extract plan/actions
    plan = input_handler.extract_plan(mcp_acl_json)

    # Step 3: Sequence and enrich tasks
    sequenced_tasks = task_planner.sequence_tasks(plan)

    # Step 4: Dispatch tasks to sub-agents
    dispatch_results = agent_dispatcher.dispatch(sequenced_tasks)

    # Step 5: Return dispatch results
    return {"dispatch_results": dispatch_results}

class DiseasePredictionRequest(BaseModel):
    symptoms: list[str]

@app.post("/predict_disease")
def predict_disease(request: DiseasePredictionRequest):
    """Predict diseases based on symptoms."""
    try:
        # Create MCP/ACL payload for disease prediction
        mcp_acl_json = {
            "user_input": f"Predict diseases for symptoms: {', '.join(request.symptoms)}",
            "workflow": "disease_prediction",
            "mcp": {
                "task": "disease_prediction",
                "input": {"symptoms": request.symptoms},
                "context": {"workflow": "medical_diagnosis"}
            }
        }

        # Send to disease prediction sub-agent via dispatcher
        dispatch_results = agent_dispatcher.dispatch([{
            "agent": "disease_prediction",
            "task": mcp_acl_json
        }])

        # Format the response
        if dispatch_results and len(dispatch_results) > 0:
            result = dispatch_results[0].get("result", {})
            return {
                "result": {
                    "predicted_diseases": result.get("diseases", []),
                    "confidence": result.get("confidence", 0.0)
                }
            }
        return {"error": "No prediction results"}
    except Exception as e:
        return {"error": str(e)}
