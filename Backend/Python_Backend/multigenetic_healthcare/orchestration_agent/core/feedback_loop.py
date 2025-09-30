from typing import Dict, Any
import logging
import json
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FeedbackLoop:
    """Logs outcomes and feedback for continuous improvement."""
    
    async def log(self, data: Dict[str, Any]) -> None:
        """
        Log outcomes and feedback for analysis.
        
        Args:
            data: The data to log (typically aggregated results)
        """
        timestamp = datetime.utcnow().isoformat()
        
        # Add metadata to the log entry
        log_entry = {
            "timestamp": timestamp,
            "type": "workflow_completion",
            "data": data
        }
        
        # Log the entry (in production, this might go to a proper logging system)
        logger.info(json.dumps(log_entry))