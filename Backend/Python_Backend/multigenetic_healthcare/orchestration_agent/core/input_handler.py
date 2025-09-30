from typing import Dict, Any
import json
from fastapi import HTTPException
from pydantic import BaseModel, ValidationError
from multigenetic_healthcare.common.mcp_schemas import MCPACL, MCPContext, ACLTask
import logging

logger = logging.getLogger(__name__)

class InputHandler:
    """Handles and validates the incoming MCP/ACL JSON payload from the LLM layer."""
    
    SUPPORTED_AGENTS = {
        "patient_journey": {
            "actions": ["track_journey", "update_journey", "get_history"],
            "required_params": {
                "track_journey": ["patient_id"],
                "update_journey": ["patient_id", "visit_data"],
                "get_history": ["patient_id"]
            }
        },
        "disease_prediction": {
            "actions": ["predict_disease", "get_symptoms", "update_model"],
            "required_params": {
                "predict_disease": ["symptoms"],
                "get_symptoms": ["disease"],
                "update_model": ["training_data"]
            }
        }
    }
    
    async def handle(self, mcp_acl_json: Dict[str, Any]) -> MCPACL:
        """
        Process and validate the incoming MCP/ACL JSON.
        
        Args:
            mcp_acl_json: The incoming JSON payload from the LLM
            
        Returns:
            Validated and processed MCPACL object
            
        Raises:
            HTTPException: If validation fails or required data is missing
        """
        try:
            logger.debug(f"Received MCP/ACL JSON: {json.dumps(mcp_acl_json, indent=2)}")
            
            # Ensure MCP and ACL sections exist
            if "mcp" not in mcp_acl_json or "acl" not in mcp_acl_json:
                logger.error("Missing required MCP or ACL sections")
                raise ValueError("Invalid MCP/ACL structure: missing required sections")
            
            # Ensure required MCP fields exist
            if "user_id" not in mcp_acl_json["mcp"]:
                logger.error("Missing user_id in MCP context")
                raise ValueError("Invalid MCP context: missing user_id")
                
            if "session_id" not in mcp_acl_json["mcp"]:
                logger.error("Missing session_id in MCP context")
                raise ValueError("Invalid MCP context: missing session_id")
            
            # Ensure metadata exists
            if "metadata" not in mcp_acl_json["mcp"]:
                mcp_acl_json["mcp"]["metadata"] = {}
            
            # Ensure ACL is a list
            if not isinstance(mcp_acl_json["acl"], list):
                logger.error("ACL section is not a list")
                raise ValueError("Invalid ACL structure: must be a list of tasks")
            
            try:
                # Try to parse the incoming JSON into our Pydantic model
                mcp_acl = MCPACL(**mcp_acl_json)
            except Exception as validation_error:
                logger.error(f"Failed to validate MCP/ACL structure: {str(validation_error)}")
                logger.error(f"Validation error details: {validation_error.__class__.__name__}")
                if hasattr(validation_error, "errors"):
                    logger.error(f"Validation errors: {validation_error.errors()}")
                raise ValueError(f"Invalid MCP/ACL structure: {str(validation_error)}")
            
            # Get the user_id from MCP context
            user_id = mcp_acl.mcp.user_id
            logger.debug(f"User ID from MCP context: {user_id}")
            
            # Validate agent tasks and inject user_id as patient_id where needed
            if mcp_acl.acl:  # Only validate if there are tasks
                for task in mcp_acl.acl:
                    self._validate_task(task, user_id)
            else:
                logger.warning("No tasks in ACL section")
            
            # Log successful validation
            logger.info(f"Successfully validated MCP/ACL message for user {user_id}")
            logger.debug(f"Validated MCP/ACL structure: {json.dumps(mcp_acl.dict(), indent=2)}")
            
            return mcp_acl
            
        except ValueError as e:
            logger.error(f"Validation error in MCP/ACL message: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Invalid MCP/ACL format: {str(e)}")
        except Exception as e:
            logger.error(f"Error processing MCP/ACL message: {str(e)}")
            raise HTTPException(status_code=500, detail="Internal server error during input processing")
    
    def _validate_task(self, task: ACLTask, user_id: str = None) -> None:
        """
        Validate an individual agent task.
        
        Args:
            task: The task to validate
            user_id: The user ID from MCP context
            
        Raises:
            ValueError: If the task is invalid
        """
        logger.debug(f"Validating task: {json.dumps(task.dict(), indent=2)}")

        # Check if agent exists
        if task.agent not in self.SUPPORTED_AGENTS:
            logger.error(f"Unsupported agent: {task.agent}")
            raise ValueError(f"Unsupported agent: {task.agent}")
        
        # Check if action is valid for this agent
        if task.action not in self.SUPPORTED_AGENTS[task.agent]["actions"]:
            logger.error(f"Unsupported action '{task.action}' for agent {task.agent}")
            raise ValueError(f"Unsupported action '{task.action}' for agent {task.agent}")
        
        # Initialize params if not present
        if not task.params:
            task.params = {}
        
        # Automatically add patient_id if it's required and not present
        required_params = self.SUPPORTED_AGENTS[task.agent]["required_params"][task.action]
        if "patient_id" in required_params and "patient_id" not in task.params:
            task.params["patient_id"] = user_id
            logger.info(f"Automatically added patient_id to task params: {user_id}")
            if not user_id:
                logger.warning("No user_id available to use as patient_id")
        
        # Check required parameters
        missing_params = [param for param in required_params if param not in task.params]
        if missing_params:
            logger.error(f"Missing parameters for {task.agent}.{task.action}: {missing_params}")
            raise ValueError(
                f"Missing required parameters for {task.agent}.{task.action}: {', '.join(missing_params)}"
            )