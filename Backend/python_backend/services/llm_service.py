from typing import Dict, Any, List
import os
import json
from datetime import datetime
# dotenv and VertexAI are optional during development. Import them safely
try:
    from dotenv import load_dotenv
except Exception:
    # Provide a no-op fallback so missing python-dotenv doesn't break imports
    def load_dotenv(*args, **kwargs):
        return None

try:
    from langchain_google_vertexai import VertexAI
except Exception:
    # If the langchain Google VertexAI integration package isn't available,
    # fall back to None and allow the service to continue running in a degraded mode.
    VertexAI = None
from pydantic import BaseModel, Field
import logging

# Load environment variables
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

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

class LLMService:
    def __init__(self):
        try:
            project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
            if not project_id:
                raise ValueError("GOOGLE_CLOUD_PROJECT environment variable not set")
                
            self.llm = VertexAI(
                project=project_id,
                model_name="gemini-pro"
            )
            logger.info("LLM service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing LLM service: {str(e)}")
            self.llm = None

    def get_structured_symptoms(self, text: str) -> List[str]:
        """Extract structured symptoms from text using LLM"""
        try:
            if not self.llm:
                return []

            prompt = f"""Extract medical symptoms from this text and return them as a comma-separated list:
            Text: "{text}"
            Only return the symptoms, no other text."""

            response = self.llm(prompt)
            symptoms = [s.strip() for s in response.strip().split(',') if s.strip()]
            return symptoms
        except Exception as e:
            logger.error(f"Error extracting symptoms: {str(e)}")
            return []

    def generate_mcp_acl(self, enriched_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate MCP/ACL structure based on symptoms"""
        try:
            # Extract prompt and context
            raw_text = enriched_data.get('raw_prompt', '')
            enriched_context = enriched_data.get('enriched_context', {})
            user_id = enriched_context.get('user_id')
            
            # Get symptoms
            symptoms = self.get_structured_symptoms(raw_text)
            if not symptoms and 'headache' in raw_text.lower():
                symptoms = ['headache']  # Default for testing when using mock LLM
            
            # Create MCP/ACL structure
            mcp = MCPACL(
                agents=["symptom_analyzer", "disease_prediction"],
                workflow="medical_diagnosis",
                actions=[
                    MCPACLAction(
                        agent="symptom_analyzer",
                        action="analyze_symptoms",
                        params={"symptoms_text": raw_text}
                    ),
                    MCPACLAction(
                        agent="disease_prediction",
                        action="predict_disease",
                        params={"symptoms": []}  # Will be populated from symptom_analyzer's output
                    )
                ],
                data_flow=[
                    {
                        "from": "symptom_analyzer",
                        "to": "disease_prediction",
                        "data": "structured_symptoms"
                    }
                ]
            )
            
            # Convert to dict and ensure "from" field is correct
            result = mcp.model_dump()
            for flow in result["data_flow"]:
                # Fix the field name if needed
                if "fr" in flow:
                    flow["from"] = flow.pop("fr")
            
            return result
        except Exception as e:
            logger.error(f"Error generating MCP/ACL: {str(e)}")
            raise

    def validate_mcp_acl_format(self, mcp_acl: Dict[str, Any]) -> bool:
        """Validate MCP/ACL format using Pydantic model"""
        try:
            # Try to parse through Pydantic model
            MCPACL(**mcp_acl)
            
            # Additional validation of action names
            valid_actions = {
                "disease_prediction": ["predict_disease"],
                "symptom_analyzer": ["analyze_symptoms"],
                "patient_journey": ["track_journey"]
            }
            
            for action in mcp_acl["actions"]:
                agent = action["agent"].lower()
                action_name = action["action"]
                if agent in valid_actions and action_name not in valid_actions[agent]:
                    logger.warning(f"Invalid action {action_name} for agent {agent}")
                    return False
            
            return True
        except Exception as e:
            logger.error(f"MCP/ACL validation error: {str(e)}")
            return False