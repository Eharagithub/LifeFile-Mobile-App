from pydantic import BaseModel, Field
from typing import List, Dict, Any

class MCPACLAction(BaseModel):
    agent: str
    action: str
    params: Dict[str, Any]

class MCPACLDataFlow(BaseModel):
    fr: str = Field(alias="from")  # using 'fr' since 'from' is a Python keyword
    to: str
    data: str

class MCPACL(BaseModel):
    agents: List[str]
    workflow: str
    actions: List[MCPACLAction]
    data_flow: List[MCPACLDataFlow]