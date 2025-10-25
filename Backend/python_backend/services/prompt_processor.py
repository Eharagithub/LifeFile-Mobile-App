import sys
import logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from services.enrichment_service import EnrichmentService
from services.llm_service import LLMService

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Prompt Processing Service")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Initialize services
enrichment_service = EnrichmentService()
llm_service = LLMService()

class PromptInput(BaseModel):
    prompt: str
    user_id: str
    session_id: str
    workflow: str

from fastapi import Request

@app.post("/process_prompt")
async def process_prompt(request: Request, input_data: PromptInput):
    """
    Process a user prompt through enrichment and LLM services
    """
    try:
        # Log raw request body for debugging
        raw_body = await request.body()
        logger.debug(f"Raw request body: {raw_body}")
        
        logger.debug(f"Received input data: {input_data.dict()}")
        logger.info(f"Processing prompt: {input_data.prompt}")
        logger.info(f"User ID: {input_data.user_id}, Session: {input_data.session_id}")
        
        # Step 1: Enrich data
        try:
            enriched_data = enrichment_service.enrich_prompt(
                prompt=input_data.prompt,
                user_id=input_data.user_id,
                session_id=input_data.session_id,
                workflow=input_data.workflow
            )
            logger.info("Data enrichment successful")
            logger.debug(f"Enriched data: {enriched_data}")
        except Exception as enrich_error:
            logger.error(f"Enrichment error: {str(enrich_error)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Data enrichment failed: {str(enrich_error)}")
        
        # Step 2: Generate MCP/ACL via LLM
        try:
            logger.info("Generating MCP/ACL structure...")
            mcp_acl = llm_service.generate_mcp_acl(enriched_data)
            logger.info("MCP/ACL generation successful")
            logger.debug(f"Generated MCP/ACL: {mcp_acl}")
        except Exception as llm_error:
            logger.error(f"LLM service error: {str(llm_error)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"LLM service error: {str(llm_error)}")
        
        # Step 3: Validate LLM output format
        try:
            logger.info("Validating MCP/ACL format...")
            if not llm_service.validate_mcp_acl_format(mcp_acl):
                error_msg = "LLM generated invalid MCP/ACL format"
                logger.error(error_msg)
                raise HTTPException(status_code=400, detail=error_msg)
            logger.info("MCP/ACL validation successful")
        except Exception as validate_error:
            logger.error(f"Validation error: {str(validate_error)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"MCP/ACL validation failed: {str(validate_error)}")
        
        logger.info("Request processing completed successfully")
        return {"mcp_acl": mcp_acl}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in process_prompt: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))