from typing import Dict, Any
import traceback
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ErrorHandler:
    """Handles errors and exceptions in the orchestration workflow."""
    
    async def handle(self, error: Exception) -> Dict[str, Any]:
        """
        Handle an error and return an appropriate response.
        
        Args:
            error: The exception that occurred
            
        Returns:
            Error response suitable for API
        """
        # Log the full error with traceback
        logger.error(f"Error occurred: {str(error)}")
        logger.error(traceback.format_exc())
        
        # Get the error details
        error_type = error.__class__.__name__
        error_message = str(error)
        
        # Add more context for specific error types
        if error_type == "ValueError":
            if "MCP/ACL" in error_message:
                error_message = f"Invalid message structure: {error_message}"
                error_type = "ValidationError"
        elif error_type == "HTTPException":
            error_message = error.detail if hasattr(error, 'detail') else error_message
        
        # Return a detailed error response
        return {
            "error": {
                "message": error_message,
                "type": error_type,
                "details": {
                    "timestamp": datetime.utcnow().isoformat(),
                    "location": traceback.extract_tb(error.__traceback__)[-1].name
                }
            },
            "status": "error"
        }