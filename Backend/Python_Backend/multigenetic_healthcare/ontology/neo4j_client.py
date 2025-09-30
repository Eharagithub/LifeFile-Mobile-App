from neo4j import GraphDatabase
from typing import Any, Dict, List
import logging

logger = logging.getLogger(__name__)

class Neo4jClient:
    """Client for interacting with Neo4j graph database."""
    
    def __init__(self, uri: str, user: str, password: str):
        """
        Initialize Neo4j client.
        
        Args:
            uri: Neo4j database URI
            user: Username for authentication
            password: Password for authentication
        """
        self._driver = GraphDatabase.driver(uri, auth=(user, password))
        
    def close(self):
        """Close the database connection."""
        self._driver.close()
        
    def query(self, cypher_query: str, parameters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Execute a Cypher query and return results.
        
        Args:
            cypher_query: The Cypher query to execute
            parameters: Optional parameters for the query
            
        Returns:
            List of query results
        """
        try:
            with self._driver.session() as session:
                result = session.run(cypher_query, parameters or {})
                return [dict(record) for record in result]
        except Exception as e:
            logger.error(f"Neo4j query error: {str(e)}")
            raise