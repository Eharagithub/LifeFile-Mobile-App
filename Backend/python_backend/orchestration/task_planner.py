from typing import List, Dict, Any
from collections import defaultdict

class TaskPlanner:
    """
    Breaks down the plan into actionable tasks and determines dependencies.
    """
    def sequence_tasks(self, plan: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes task dependencies and creates a properly sequenced execution plan.
        """
        # Build dependency graph
        depends_on = defaultdict(list)
        provides_data = {}
        
        # First pass: identify data providers
        for task in plan:
            task_id = f"{task['agent']}_{task['action']}"
            # Check what data this task provides
            if 'outputs' in task:
                for output in task['outputs']:
                    provides_data[output] = task_id

        # Second pass: build dependency graph
        for task in plan:
            task_id = f"{task['agent']}_{task['action']}"
            # Check what data this task needs
            if 'inputs' in task:
                for input_data in task['inputs']:
                    if input_data in provides_data:
                        provider = provides_data[input_data]
                        depends_on[task_id].append(provider)

        # Topological sort
        sequenced = []
        visited = set()
        temp_visited = set()

        def visit(task_id):
            if task_id in temp_visited:
                raise ValueError("Circular dependency detected")
            if task_id in visited:
                return
            
            temp_visited.add(task_id)
            for dep in depends_on[task_id]:
                visit(dep)
            temp_visited.remove(task_id)
            visited.add(task_id)
            for task in plan:
                if f"{task['agent']}_{task['action']}" == task_id:
                    sequenced.append(task)
                    break

        # Process all tasks
        for task in plan:
            task_id = f"{task['agent']}_{task['action']}"
            if task_id not in visited:
                visit(task_id)

        return sequenced
