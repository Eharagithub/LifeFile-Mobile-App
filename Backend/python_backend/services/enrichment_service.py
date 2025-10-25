from typing import Dict, Any
import os

class EnrichmentService:
    def __init__(self):
        # Initialize any required connections (e.g., medical history DB)
        pass

    def enrich_prompt(self, 
                     prompt: str, 
                     user_id: str, 
                     session_id: str, 
                     workflow: str) -> Dict[str, Any]:
        """
        Enriches the raw prompt with all necessary context before LLM processing
        """
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty")
            
        if not user_id or not session_id or not workflow:
            raise ValueError("Missing required parameters: user_id, session_id, or workflow")
            
        # Base context with required fields
        enriched_context = {
            "user_id": user_id,
            "session_id": session_id,
            "workflow": workflow,
            "timestamp": None,  # Will be set by LLM service
            "system_context": {
                "current_workflow_state": workflow,
                "available_agents": [
                    "symptom_analyzer",
                    "disease_prediction",
                    "patient_journey"
                ]
            }
        }

        # TODO: Add more enrichment sources:
        # - User medical history
        # - Previous conversation context
        # - Active medications
        # - Known conditions
        # - Recent test results

        return {
            "raw_prompt": prompt,
            "enriched_context": enriched_context
        }