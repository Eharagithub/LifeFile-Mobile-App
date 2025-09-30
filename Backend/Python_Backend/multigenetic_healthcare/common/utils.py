import logging
from datetime import datetime
from typing import Dict, Any

def setup_logger(name: str) -> logging.Logger:
    """Set up a logger with standard configuration."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Create console handler with formatting
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

def format_timestamp() -> str:
    """Get current timestamp in ISO format."""
    return datetime.utcnow().isoformat()

def sanitize_error(error: Exception) -> Dict[str, Any]:
    """Convert an exception into a safe API response."""
    return {
        "error": str(error),
        "type": error.__class__.__name__
    }