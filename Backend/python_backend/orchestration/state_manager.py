class StateManager:
    """
    Maintains workflow context, tracks task status and intermediate results.
    """
    def __init__(self):
        self.state = {}

    def update(self, agent, status):
        self.state[agent] = status

    def get_state(self):
        return self.state
