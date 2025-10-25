from sub_agents.domain_logic import DomainLogic

class TaskHandler:
    """
    Receives and interprets the task from the orchestration agent.
    Routes to appropriate domain logic.
    """
    def __init__(self):
        self.domain_logic = DomainLogic()

    def handle(self, task):
        # Route to domain logic based on action
        action = task.get('action')
        params = task.get('params', {})
        if action == 'predict_disease':
            return self.domain_logic.predict_disease(params)
        # Add more actions as needed
        return {'error': f'Unknown action: {action}'}
