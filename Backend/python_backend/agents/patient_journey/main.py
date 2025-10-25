
import os
from dotenv import load_dotenv
load_dotenv()
print("GOOGLE_APPLICATION_CREDENTIALS:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
print("GOOGLE_CLOUD_PROJECT:", os.getenv("GOOGLE_CLOUD_PROJECT"))

from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

# LangChain and Vertex AI imports
try:
    from langchain_google_vertexai import VertexAI
except ImportError:
    VertexAI = None

app = FastAPI(title="Patient Journey Agent API")

# MCP/ACL structures (customize as needed for patient journey)
class MCPACLPrompt(BaseModel):
    protocol: str = "MCP"
    agent: str = "patient_journey"
    action: str = "analyze_journey"
    context: Optional[str] = None
    symptoms: List[str]

class PatientJourneyRequest(BaseModel):
    symptoms: List[str]

class PatientJourneyResult(BaseModel):
    journey_steps: List[str]
    confidence: float

class PatientJourneyResponse(BaseModel):
    result: Optional[PatientJourneyResult] = None
    error: Optional[str] = None

GOOGLE_CLOUD_PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT")

# Initialize Vertex AI LLM via LangChain (if available)
vertex_llm = None
if VertexAI and GOOGLE_CLOUD_PROJECT:
    vertex_llm = VertexAI(
        project=GOOGLE_CLOUD_PROJECT,
        model_name="gemini-2.5-pro"
    )

@app.post("/patient_journey", response_model=PatientJourneyResponse)
def handle_patient_journey(request: PatientJourneyRequest):
    if not vertex_llm:
        return PatientJourneyResponse(error="VertexAI or API keys not configured. Please install langchain-google-vertexai and set environment variables.")
    try:
        # Step 1: Enrich prompt with MCP/ACL
        mcp_prompt = MCPACLPrompt(
            symptoms=request.symptoms,
            context="Patient journey analysis for healthcare workflow"
        )
        # Build the prompt string for LLM
        prompt = (
            f"Protocol: {mcp_prompt.protocol}\n"
            f"Agent: {mcp_prompt.agent}\n"
            f"Action: {mcp_prompt.action}\n"
            f"Context: {mcp_prompt.context}\n"
            f"Symptoms: {', '.join(mcp_prompt.symptoms)}\n"
        )
        # Step 2: Send enriched prompt to Gemini-Pro LLM
        llm_response = vertex_llm(prompt)
        print("[DEBUG] Raw LLM response:\n", llm_response)

        # Try to parse the LLM response as JSON and extract journey_steps and confidence
        import json
        import re
        journey_steps = []
        confidence = 0.9

        try:
            # Extract JSON from markdown code block or text
            if isinstance(llm_response, str):
                # Remove markdown code block markers if present
                llm_response = re.sub(r"^```json|```$", "", llm_response.strip(), flags=re.MULTILINE).strip()
                # Find the first opening and last closing brace
                first_brace = llm_response.find('{')
                last_brace = llm_response.rfind('}')
                if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                    json_str = llm_response[first_brace:last_brace+1]
                    parsed = json.loads(json_str)
                else:
                    raise ValueError("No valid JSON object found in LLM response.")
            else:
                parsed = llm_response  # If already a dict

            # Try new structure: MCP_RESPONSE.Analysis.PatientJourney
            mcp = parsed.get("MCP_RESPONSE", {})
            analysis = mcp.get("Analysis", {})
            patient_journey = analysis.get("PatientJourney", [])
            if patient_journey:
                for stage in patient_journey:
                    stage_num = stage.get("Stage")
                    name = stage.get("Name")
                    desc = stage.get("Description")
                    if stage_num and name and desc:
                        journey_steps.append(f"Stage {stage_num} - {name}: {desc}")
                    elif name and desc:
                        journey_steps.append(f"{name}: {desc}")
            else:
                # Fallback to previous structure if needed
                journey_analysis = mcp.get("JourneyAnalysis", {})
                predicted_phases = journey_analysis.get("PredictedPhases", [])
                for phase in predicted_phases:
                    phase_title = phase.get("Title")
                    phase_desc = phase.get("Description")
                    if phase_title and phase_desc:
                        journey_steps.append(f"{phase_title}: {phase_desc}")
                    stages = phase.get("Stages", [])
                    for stage in stages:
                        stage_name = stage.get("Stage")
                        stage_desc = stage.get("Description")
                        if stage_name and stage_desc:
                            journey_steps.append(f"  - {stage_name}: {stage_desc}")
                        elif stage_name:
                            journey_steps.append(f"  - {stage_name}")
            # Optionally extract confidence if present
            if "confidence" in parsed:
                confidence = parsed["confidence"]
        except Exception as e:
            print(f"[ERROR] Failed to parse LLM response: {e}")
            journey_steps = [str(llm_response)]
            confidence = 0.5

        result = PatientJourneyResult(journey_steps=journey_steps, confidence=confidence)
        return PatientJourneyResponse(result=result)
    except Exception as e:
        return PatientJourneyResponse(error=str(e))
