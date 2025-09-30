from typing import List, Dict, Any
from fastapi import HTTPException
from multigenetic_healthcare.common.mcp_schemas import MCPACL, ACLTask
import logging

logger = logging.getLogger(__name__)

class TaskPlanner:
    """Plans and sequences tasks based on dependencies and priorities."""
    
    def __init__(self):
        """Initialize the TaskPlanner."""
        self.supported_workflows = {
            "patient_consultation": self._plan_patient_consultation,
            "disease_analysis": self._plan_disease_analysis,
            "medical_history": self._plan_medical_history
        }
    
    async def plan(self, mcp_acl: MCPACL) -> List[ACLTask]:
        """
        Create an execution plan for the given MCP/ACL tasks.
        
        Args:
            mcp_acl: The validated MCP/ACL input
            
        Returns:
            List of ordered tasks with resolved dependencies
            
        Raises:
            HTTPException: If planning fails
        """
        try:
            if not mcp_acl.acl:
                logger.info("No tasks to plan")
                return []
                
            # Extract workflow type from metadata if available
            workflow_type = mcp_acl.mcp.metadata.get("workflow_type", "default")
            logger.debug(f"Planning workflow type: {workflow_type}")
            
            try:
                # Get tasks and sort by priority (lower number = higher priority)
                tasks = sorted(mcp_acl.acl, key=lambda x: x.priority)
                logger.debug(f"Sorted {len(tasks)} tasks by priority")
                
                # Apply workflow-specific planning if available
                if workflow_type in self.supported_workflows:
                    logger.debug(f"Applying {workflow_type} workflow planning")
                    tasks = await self.supported_workflows[workflow_type](tasks)
                else:
                    logger.debug(f"Using default workflow planning")
                
                # Validate dependencies
                try:
                    self._validate_dependencies(tasks)
                    logger.debug("Task dependencies validated successfully")
                except ValueError as dep_error:
                    logger.error(f"Dependency validation error: {str(dep_error)}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid task dependencies: {str(dep_error)}"
                    )
                
                # Create execution groups based on dependencies
                execution_plan = self._create_execution_plan(tasks)
                
                logger.info(f"Created execution plan with {len(execution_plan)} tasks")
                logger.debug(f"Execution plan: {[task.dict() for task in execution_plan]}")
                
                return execution_plan
                
            except Exception as planning_error:
                logger.error(f"Task planning error: {str(planning_error)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Task planning failed: {str(planning_error)}"
                )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error in task planning: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error in task planning: {str(e)}"
            )
    
    def _validate_dependencies(self, tasks: List[ACLTask]) -> None:
        """
        Validate that all dependencies exist and there are no cycles.
        
        Args:
            tasks: List of tasks to validate
            
        Raises:
            ValueError: If dependencies are invalid
        """
        # Create map of task IDs
        task_ids = {task.agent: task for task in tasks}
        
        # Check each task's dependencies
        for task in tasks:
            for dep in task.dependencies:
                if dep not in task_ids:
                    raise ValueError(f"Task {task.agent} depends on non-existent task {dep}")
        
        # Check for cycles
        visited = set()
        temp_visited = set()
        
        def has_cycle(task_id: str) -> bool:
            if task_id in temp_visited:
                return True
            if task_id in visited:
                return False
                
            temp_visited.add(task_id)
            task = task_ids[task_id]
            
            for dep in task.dependencies:
                if has_cycle(dep):
                    return True
                    
            temp_visited.remove(task_id)
            visited.add(task_id)
            return False
        
        # Check each task for cycles
        for task in tasks:
            if has_cycle(task.agent):
                raise ValueError(f"Cyclic dependency detected in task {task.agent}")
    
    def _create_execution_plan(self, tasks: List[ACLTask]) -> List[ACLTask]:
        """
        Create an ordered execution plan based on dependencies.
        
        Args:
            tasks: List of tasks to order
            
        Returns:
            Ordered list of tasks respecting dependencies
        """
        # Create dependency graph
        graph: Dict[str, List[str]] = {task.agent: task.dependencies for task in tasks}
        ordered_tasks = []
        visited = set()
        
        def visit(task_id: str) -> None:
            if task_id in visited:
                return
                
            for dep in graph[task_id]:
                visit(dep)
                
            visited.add(task_id)
            task = next(t for t in tasks if t.agent == task_id)
            ordered_tasks.append(task)
        
        # Visit all tasks
        for task in tasks:
            visit(task.agent)
            
        return ordered_tasks
    
    async def _plan_patient_consultation(self, tasks: List[ACLTask]) -> List[ACLTask]:
        """
        Plan tasks for patient consultation workflow.
        
        Args:
            tasks: List of tasks to plan
            
        Returns:
            Updated list of tasks with workflow-specific planning
        """
        # Example: In patient consultation, always run patient_journey first
        for task in tasks:
            if task.agent == "patient_journey":
                task.priority = 1
            elif task.agent == "disease_prediction":
                task.dependencies.append("patient_journey")
                task.priority = 2
                
        return sorted(tasks, key=lambda x: x.priority)
    
    async def _plan_disease_analysis(self, tasks: List[ACLTask]) -> List[ACLTask]:
        """Plan tasks for disease analysis workflow."""
        # Implement disease analysis specific planning
        return tasks
    
    async def _plan_medical_history(self, tasks: List[ACLTask]) -> List[ACLTask]:
        """Plan tasks for medical history workflow."""
        # Implement medical history specific planning
        return tasks