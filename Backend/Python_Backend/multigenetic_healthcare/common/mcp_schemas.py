from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class MCPContext(BaseModel):
    """Model Context Protocol (MCP) context information."""
    user_id: str
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    workflow_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ACLTask(BaseModel):
    """Agent Communication Language (ACL) task definition."""
    agent: str = Field(..., description="Name of the agent to execute the task")
    action: str = Field(..., description="Action to be performed by the agent")
    params: Dict[str, Any] = Field(default_factory=dict, description="Parameters for the action")
    dependencies: List[str] = Field(default_factory=list, description="IDs of tasks that must complete before this one")
    priority: int = Field(default=1, ge=1, le=5, description="Task priority (1-5)")

class MCPACL(BaseModel):
    """Combined MCP/ACL message structure."""
    mcp: MCPContext
    acl: List[ACLTask]
    version: str = "1.0"
    
    model_config = {
        "json_schema_extra": {
            "examples": [{
                "mcp": {
                    "user_id": "123",
                    "session_id": "abc",
                    "timestamp": "2025-09-20T10:00:00Z",
                    "workflow_id": "workflow_1",
                    "metadata": {"source": "llm_response"}
                },
                "acl": [
                    {
                        "agent": "patient_journey",
                        "action": "track_journey",
                        "params": {"patient_id": "123"},
                        "dependencies": [],
                        "priority": 1
                    },
                    {
                        "agent": "disease_prediction",
                        "action": "predict_disease",
                        "params": {"symptoms": ["fever", "cough"]},
                        "dependencies": [],
                        "priority": 2
                    }
                ],
                "version": "1.0"
            }]
        }
    }