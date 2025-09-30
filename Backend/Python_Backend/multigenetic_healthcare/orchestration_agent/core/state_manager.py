from typing import Dict, Any, List

class StateManager:
    """Maintains workflow context and tracks progress of tasks."""
    
    def __init__(self):
        self.workflows = {}
    
    def init_workflow(self, tasks: List[Dict[str, Any]]) -> str:
        """
        Initialize a new workflow with tasks.
        
        Args:
            tasks: List of tasks to be executed
            
        Returns:
            Workflow ID
        """
        # TODO: Implement proper workflow ID generation
        workflow_id = "workflow_1"
        self.workflows[workflow_id] = {
            "tasks": tasks,
            "status": "in_progress",
            "results": []
        }
        return workflow_id
    
    def update_workflow(self, results: List[Dict[str, Any]], workflow_id: str = "workflow_1"):
        """
        Update workflow state with task results.
        
        Args:
            results: Results from executed tasks
            workflow_id: ID of the workflow to update
        """
        if workflow_id in self.workflows:
            self.workflows[workflow_id]["results"] = results
            self.workflows[workflow_id]["status"] = "completed"
    
    def get_workflow_state(self, workflow_id: str = "workflow_1") -> Dict[str, Any]:
        """
        Get the current state of a workflow.
        
        Args:
            workflow_id: ID of the workflow
            
        Returns:
            Current state of the workflow
        """
        return self.workflows.get(workflow_id, {})