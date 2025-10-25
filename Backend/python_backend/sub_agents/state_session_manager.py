class StateSessionManager:
    """
    Maintains session or workflow state for the task.
    """
    def __init__(self):
        self.session = {}

    def set_state(self, key, value):
        self.session[key] = value

    def get_state(self, key):
        return self.session.get(key)
