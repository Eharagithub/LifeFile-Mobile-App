from typing import Dict, Any, List
import aiohttp
import asyncio
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class AgentDispatcher:
    """Dispatches tasks to sub-agents and collects their results."""
    
    def __init__(self):
        # Configuration for agent endpoints (should be moved to config file)
        self.agent_endpoints = {
            "patient_journey": "http://localhost:8001/patient_journey",
            "disease_prediction": "http://localhost:8002/predict_disease"
        }
    
    async def dispatch(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Dispatch tasks to appropriate agents and collect results.
        
        Args:
            tasks: List of tasks to be executed by agents
            
        Returns:
            List of results from agents
        """
        if not tasks:
            logger.info("No tasks to dispatch")
            return []
            
        logger.info(f"Dispatching {len(tasks)} tasks to agents")
        
        try:
            results = []
            async with aiohttp.ClientSession() as session:
                # Create tasks for concurrent execution
                api_tasks = [
                    self._call_agent(session, task)
                    for task in tasks
                ]
                
                # Execute all tasks concurrently
                try:
                    results = await asyncio.gather(*api_tasks)
                    logger.info(f"Successfully executed {len(results)} tasks")
                except Exception as execution_error:
                    logger.error(f"Error executing tasks: {str(execution_error)}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Task execution failed: {str(execution_error)}"
                    )
                
            return results
            
        except Exception as e:
            logger.error(f"Error in task dispatch: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Task dispatch failed: {str(e)}"
            )
    
    async def _call_agent(self, session: aiohttp.ClientSession, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Make an API call to a specific agent.
        
        Args:
            session: aiohttp client session
            task: Task to be executed
            
        Returns:
            Agent's response
        """
        agent_name = task.get("agent")
        if not agent_name:
            logger.error("Task missing agent name")
            return {
                "error": "Invalid task: missing agent name",
                "task": task,
                "status": "error"
            }
            
        logger.debug(f"Calling agent {agent_name} with task: {task}")
        
        if agent_name not in self.agent_endpoints:
            logger.error(f"Unknown agent: {agent_name}")
            return {
                "error": f"Unknown agent: {agent_name}",
                "task": task,
                "status": "error"
            }
            
        try:
            endpoint = self.agent_endpoints[agent_name]
            async with session.post(endpoint, json=task) as response:
                if response.status >= 400:
                    error_text = await response.text()
                    logger.error(f"Agent {agent_name} returned error {response.status}: {error_text}")
                    return {
                        "agent": agent_name,
                        "error": f"Agent returned {response.status}: {error_text}",
                        "status": "error",
                        "task": task
                    }
                    
                try:
                    result = await response.json()
                    logger.debug(f"Agent {agent_name} returned: {result}")
                    return {
                        "agent": agent_name,
                        "result": result,
                        "status": "success"
                    }
                except Exception as json_error:
                    logger.error(f"Error parsing agent {agent_name} response: {str(json_error)}")
                    return {
                        "agent": agent_name,
                        "error": f"Invalid response format: {str(json_error)}",
                        "status": "error",
                        "task": task
                    }
                    
        except Exception as e:
            logger.error(f"Error calling agent {agent_name}: {str(e)}")
            return {
                "agent": agent_name,
                "error": str(e),
                "status": "error",
                "task": task
            }