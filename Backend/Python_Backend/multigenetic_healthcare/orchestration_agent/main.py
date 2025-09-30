from typing import Dict, Any
from datetime import datetime
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from multigenetic_healthcare.orchestration_agent.core.input_handler import InputHandler
from multigenetic_healthcare.orchestration_agent.core.task_planner import TaskPlanner
from multigenetic_healthcare.orchestration_agent.core.agent_dispatcher import AgentDispatcher
from multigenetic_healthcare.orchestration_agent.core.state_manager import StateManager
from multigenetic_healthcare.orchestration_agent.core.result_aggregator import ResultAggregator
from multigenetic_healthcare.orchestration_agent.core.error_handler import ErrorHandler
from multigenetic_healthcare.orchestration_agent.core.feedback_loop import FeedbackLoop
from multigenetic_healthcare.orchestration_agent.services.llm_service import LLMService
from multigenetic_healthcare.common.mcp_schemas import MCPACL

class ChatMessage(BaseModel):
    """Request model for chat messages."""
    message: str
    user_id: str
    session_id: str
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Healthcare Orchestration Agent API",
    description="Orchestrates healthcare-related tasks across multiple specialized agents",
    version="1.0.0"
)

# Instantiate core components
input_handler = InputHandler()
task_planner = TaskPlanner()
agent_dispatcher = AgentDispatcher()
state_manager = StateManager()
result_aggregator = ResultAggregator()
error_handler = ErrorHandler()
feedback_loop = FeedbackLoop()
llm_service = LLMService()

@app.post("/chat", response_model=Dict[str, Any],
         description="Process a chat message through Gemini and orchestrate healthcare tasks")
async def process_chat(chat: ChatMessage):
    """
    Process a chat message, enrich it with MCP/ACL through Gemini, and orchestrate tasks.
    
    Args:
        chat: The chat message with user and session information
        
    Returns:
        Orchestrated results from all relevant agents
    """
    try:
        logger.info(f"Processing chat message for user {chat.user_id}")
        logger.debug(f"Chat message: {chat.message}")
        
        # Create initial MCP/ACL structure
        initial_mcp_acl = {
            "mcp": {
                "user_id": chat.user_id,
                "session_id": chat.session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "source": "chat",
                    "original_message": chat.message
                }
            },
            "acl": [],  # Will be populated by LLM service
            "version": "1.0"
        }
        
        # Process through Gemini and get enriched MCP/ACL
        try:
            mcp_acl = await llm_service.process_chat_message(
                message=chat.message,
                user_id=chat.user_id,
                session_id=chat.session_id
            )
            logger.debug(f"Processed MCP/ACL: {json.dumps(mcp_acl, indent=2)}")
            
            # Forward to orchestration
            return await orchestrate(mcp_acl)
            
        except Exception as llm_error:
            logger.error(f"Error in LLM processing: {str(llm_error)}")
            # Try to use initial structure as fallback
            logger.info("Attempting to use initial MCP/ACL structure as fallback")
            return await orchestrate(initial_mcp_acl)
        
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        return await error_handler.handle(e)

@app.post("/orchestrate", response_model=Dict[str, Any], 
          description="Process an MCP/ACL message and orchestrate tasks across healthcare agents")
async def orchestrate(mcp_acl_json: dict):
    """
    Main orchestration endpoint that processes LLM output and coordinates healthcare agents.
    
    Args:
        mcp_acl_json: The MCP/ACL message from the LLM layer
        
    Returns:
        Aggregated results from all agents
        
    Raises:
        HTTPException: If any validation or processing errors occur
    """
    try:
        # Process and validate the LLM output
        logger.info("Received new MCP/ACL message")
        logger.debug(f"Input MCP/ACL: {json.dumps(mcp_acl_json, indent=2)}")
        
        try:
            validated_input = await input_handler.handle(mcp_acl_json)
        except Exception as validation_error:
            logger.error(f"Validation error: {str(validation_error)}")
            return await error_handler.handle(validation_error)
        
        # If there are no tasks, return early with a success message
        if not validated_input.acl:
            logger.info("No tasks to process")
            return {
                "status": "success",
                "message": "No tasks to process",
                "data": {
                    "workflow_id": None,
                    "tasks_processed": 0
                }
            }
        
        # Plan the tasks
        tasks = await task_planner.plan(validated_input)
        workflow_id = state_manager.init_workflow(tasks)
        logger.info(f"Initialized workflow {workflow_id} with {len(tasks)} tasks")
        
        try:
            # Dispatch tasks to agents
            results = await agent_dispatcher.dispatch(tasks)
            state_manager.update_workflow(results, workflow_id)
            
            # Aggregate results
            aggregated = await result_aggregator.aggregate(results)
            
            # Log feedback
            await feedback_loop.log({
                "workflow_id": workflow_id,
                "mcp_acl": validated_input.dict(),
                "results": aggregated
            })
            
            return {
                "status": "success",
                "data": aggregated,
                "workflow_id": workflow_id
            }
            
        except Exception as processing_error:
            logger.error(f"Error processing tasks: {str(processing_error)}")
            return await error_handler.handle(processing_error)
        
    except HTTPException as he:
        # Re-raise HTTP exceptions as they already have the proper format
        raise he
    except Exception as e:
        # Handle any other exceptions
        return await error_handler.handle(e)

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": "1.0.0"}