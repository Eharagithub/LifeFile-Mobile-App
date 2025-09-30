from typing import Dict, Any, List
import os
import json
from datetime import datetime
from langchain_google_vertexai import VertexAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from google.cloud import aiplatform
from ..core.input_handler import InputHandler
from ...common.mcp_schemas import MCPACL, MCPContext, ACLTask
import logging

logger = logging.getLogger(__name__)

class LLMService:
    """Service for handling LLM (Gemini via Vertex AI) operations and MCP/ACL enrichment."""
    
    def __init__(self):
        """Initialize the Vertex AI and LangChain components."""
        from multigenetic_healthcare.common.config import get_settings
        
        settings = get_settings()
        
        try:
            # Initialize Vertex AI
            aiplatform.init(
                project=settings.gcp_project_id,
                location=settings.gcp_location
            )
            
            # Create Gemini Pro model through Vertex AI
            self.llm = VertexAI(
                model_name="gemini-2.5-pro",
                max_output_tokens=2048,
                temperature=0.3,
                top_p=0.8,
                verbose=True
            )
            self.is_mock = False
            logger.info("Successfully initialized Vertex AI LLM service")
        except Exception as e:
            logger.warning(f"Failed to initialize Vertex AI, using mock LLM: {str(e)}")
            self.is_mock = True
        
        # Create prompt template for MCP/ACL generation
        self.prompt = PromptTemplate(
            input_variables=["message"],
            template="""Analyze the following healthcare-related message and generate a structured MCP/ACL response.
            The response should identify required agents (patient_journey, disease_prediction) and their actions.

            Message: {message}

            Generate a JSON response in MCP/ACL format with:
            1. MCP context (empty object - will be filled in later)
            2. ACL tasks for relevant agents with:
               - Required actions
               - Necessary parameters
               - Dependencies
               - Priority (1-5)

            Only use supported agents and actions:
            - patient_journey: [track_journey, update_journey, get_history]
            - disease_prediction: [predict_disease, get_symptoms, update_model]

            Example response format:
            {
                "mcp": {},
                "acl": [
                    {
                        "agent": "disease_prediction",
                        "action": "predict_disease",
                        "params": {"symptoms": ["fever", "headache"]},
                        "dependencies": [],
                        "priority": 1
                    },
                    {
                        "agent": "patient_journey",
                        "action": "track_journey",
                        "params": {"symptoms": ["fever", "headache"], "visit_type": "symptom_report"},
                        "dependencies": ["disease_prediction"],
                        "priority": 2
                    }
                ],
                "version": "1.0"
            }

            Your response must be ONLY the JSON, no other text."""
        )
        
        # Create LangChain runnable sequence with proper input mapping
        self.chain = {"message": lambda x: x["message"]} | self.prompt | self.llm
        self.input_handler = InputHandler()
        
    async def process_chat_message(self, message: str, user_id: str, session_id: str) -> Dict[str, Any]:
        """
        Process a chat message through Gemini and generate MCP/ACL structure.
        
        Args:
            message: The user's chat message
            user_id: The ID of the user
            session_id: The current session ID
            
        Returns:
            Validated MCP/ACL structure
        """
        try:
            if self.is_mock:
                logger.info("Using mock LLM service")
                mcp_acl_json = self._create_default_mcp_acl(message)
                mcp_acl_json["mcp"] = {
                    "user_id": user_id,
                    "session_id": session_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "metadata": {
                        "source": "chat",
                        "original_message": message,
                        "processed_by": "mock_handler"
                    }
                }
                return await self.input_handler.handle(mcp_acl_json)
                
            # Use LangChain runnable to process the message
            result = await self.chain.ainvoke({"message": message})
            result = result.content if hasattr(result, 'content') else str(result)
            
            # Inner try block for JSON parsing and validation
            # This separates LLM errors from JSON parsing errors
            try:
                # Find JSON in the response
                start = result.find('{')
                end = result.rfind('}') + 1
                if start >= 0 and end > start:
                    json_str = result[start:end]
                    mcp_acl_json = json.loads(json_str)
                else:
                    # If no JSON found, try to generate a structured response
                    mcp_acl_json = self._create_default_mcp_acl(message)
                
                # Enrich MCP context
                mcp_acl_json["mcp"].update({
                    "user_id": user_id,
                    "session_id": session_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "metadata": {
                        **mcp_acl_json["mcp"].get("metadata", {}),
                        "processed_by": "gemini-2.5-pro"
                    }
                })
                
                logger.debug(f"Enriched MCP/ACL structure: {json.dumps(mcp_acl_json, indent=2)}")
                
                try:
                    # Validate through input handler
                    validated_mcp_acl = await self.input_handler.handle(mcp_acl_json)
                except Exception as validation_error:
                    logger.error(f"Validation error: {str(validation_error)}")
                    logger.error(f"Invalid structure: {json.dumps(mcp_acl_json, indent=2)}")
                    raise
                
                # Log successful processing
                logger.info(f"Successfully processed chat message for user {user_id}")
                logger.debug(f"Generated MCP/ACL: {validated_mcp_acl.dict()}")
                
                return validated_mcp_acl.dict()
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from LLM response: {str(e)}")
                # Try to recover by creating a default structure
                return await self._handle_parsing_error(message, user_id, session_id)
        except Exception as e:
            logger.error(f"Error processing chat message through LLM: {str(e)}")
            return await self._handle_parsing_error(message, user_id, session_id)
                
    def _create_default_mcp_acl(self, message: str) -> Dict[str, Any]:
        """Create a default MCP/ACL structure from a message."""
        # Extract potential symptoms from message
        symptoms = self._extract_symptoms(message)
        logger.debug(f"Extracted symptoms: {symptoms}")
        
        # Create tasks based on symptoms
        tasks = []
        if symptoms:
            # Add disease prediction task
            tasks.append({
                "agent": "disease_prediction",
                "action": "predict_disease",
                "params": {
                    "symptoms": symptoms,
                },
                "dependencies": [],
                "priority": 1
            })
            
            # Add patient journey tracking
            tasks.append({
                "agent": "patient_journey",
                "action": "track_journey",
                "params": {
                    "symptoms": symptoms,
                    "visit_type": "symptom_report",
                },
                "dependencies": ["disease_prediction"],
                "priority": 2
            })
            
            logger.debug(f"Created tasks: {json.dumps(tasks, indent=2)}")
        else:
            logger.warning("No symptoms detected in message, creating empty task list")
        
        # Basic structure - MCP context will be enriched by process_chat_message
        return {
            "mcp": {
                "metadata": {
                    "source": "chat",
                    "original_message": message
                }
            },
            "acl": tasks,
            "version": "1.0"
        }
        
    def _extract_symptoms(self, message: str) -> List[str]:
        """Extract potential symptoms from a message using basic keyword matching."""
        logger.info(f"Extracting symptoms from message: {message}")
        # Common symptoms to look for
        symptom_keywords = [
            "fever", "cough", "headache", "pain", "nausea",
            "fatigue", "dizzy", "dizziness", "vomiting", "ache"
        ]
        
        # Find symptoms in message
        found_symptoms = []
        lower_message = message.lower()
        for symptom in symptom_keywords:
            if symptom in lower_message:
                found_symptoms.append(symptom)
                logger.debug(f"Found symptom: {symptom}")
                
        logger.info(f"Extracted symptoms: {found_symptoms}")
        return found_symptoms
        
    async def _handle_parsing_error(self, message: str, user_id: str, session_id: str) -> Dict[str, Any]:
        """Handle JSON parsing errors by creating a default structure."""
        try:
            logger.info("Creating default MCP/ACL structure due to parsing error")
            # Create default structure
            mcp_acl_json = self._create_default_mcp_acl(message)
            logger.debug(f"Created default structure: {json.dumps(mcp_acl_json, indent=2)}")
            
            # Add MCP context
            mcp_acl_json["mcp"] = {
                "user_id": user_id,
                "session_id": session_id,
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": {
                    "source": "chat",
                    "original_message": message,
                    "processed_by": "fallback_handler",
                    "error_recovery": True
                }
            }
            logger.debug(f"Added MCP context: {json.dumps(mcp_acl_json['mcp'], indent=2)}")
            
            try:
                # Validate the fallback structure
                validated_mcp_acl = await self.input_handler.handle(mcp_acl_json)
                logger.info(f"Successfully created fallback MCP/ACL for user {user_id}")
                return validated_mcp_acl.dict()
            except Exception as validation_error:
                logger.error(f"Validation error in fallback handler: {str(validation_error)}")
                logger.error(f"Invalid structure: {json.dumps(mcp_acl_json, indent=2)}")
                raise
            
        except Exception as e:
            logger.error(f"Error in fallback handling: {str(e)}")
            raise ValueError("Failed to create valid MCP/ACL structure")