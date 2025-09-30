from typing import Dict, Any, List

class ResultAggregator:
    """Aggregates and processes results from sub-agents."""
    
    async def aggregate(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate results from multiple agents into a unified response.
        
        Args:
            results: List of results from various agents
            
        Returns:
            Aggregated response
        """
        aggregated = {
            "patient_journey": {},
            "disease_prediction": {},
            "errors": []
        }
        
        for result in results:
            agent = result.get("agent")
            if "error" in result:
                aggregated["errors"].append({
                    "agent": agent,
                    "error": result["error"]
                })
            elif agent == "patient_journey":
                aggregated["patient_journey"] = result.get("result", {})
            elif agent == "disease_prediction":
                aggregated["disease_prediction"] = result.get("result", {})
        
        return aggregated