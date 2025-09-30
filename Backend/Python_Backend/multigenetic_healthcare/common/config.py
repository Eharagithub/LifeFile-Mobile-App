from pydantic_settings import BaseSettings
from functools import lru_cache
from dotenv import load_dotenv
import os

# Load .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Google Cloud Configuration
    gcp_project_id: str = os.getenv("GCP_PROJECT_ID", "")
    gcp_location: str = os.getenv("GCP_LOCATION", "us-central1")
    
    # Server Configuration
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "127.0.0.1")
    env: str = os.getenv("ENV", "development")
    
    # Database Configuration
    neo4j_uri: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user: str = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password: str = os.getenv("NEO4J_PASSWORD", "")
    
    # Firebase Configuration
    firebase_project_id: str = os.getenv("FIREBASE_PROJECT_ID", "")
    
    model_config = {
        "env_file": ".env",
        "case_sensitive": False
    }

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()