
from typing import Dict, Any, List

class InputHandler:
    """
    Handles MCP/ACL validation and preparation for task planning.
    No longer responsible for enrichment or LLM communication.
    """
    
    def validate(self, mcp_acl_json: Dict[str, Any]) -> bool:
        """
        Validates the structure and content of MCP/ACL JSON
        """
        try:
            # Validate required top-level structure
            required_fields = ["agents", "workflow", "actions", "data_flow"]
            if not all(field in mcp_acl_json for field in required_fields):
                return False

            # Validate actions
            for action in mcp_acl_json["actions"]:
                if not all(field in action for field in ["agent", "action", "params"]):
                    return False

            # Validate data flow
            for flow in mcp_acl_json["data_flow"]:
                if not all(field in flow for field in ["from", "to", "data"]):
                    return False

            return True
        except Exception:
            return False

    def extract_plan(self, mcp_acl_json: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extracts executable plan from validated MCP/ACL
        """
        if not self.validate(mcp_acl_json):
            raise ValueError("Invalid MCP/ACL structure")

        # Extract ordered list of actions with their dependencies
        plan = []
        for action in mcp_acl_json["actions"]:
            # Find related data flows
            input_flows = [
                flow for flow in mcp_acl_json["data_flow"]
                if flow["to"] == action["agent"]
            ]
            output_flows = [
                flow for flow in mcp_acl_json["data_flow"]
                if flow["from"] == action["agent"]
            ]

            plan.append({
                "agent": action["agent"],
                "action": action["action"],
                "params": action["params"],
                "inputs": [flow["data"] for flow in input_flows],
                "outputs": [flow["data"] for flow in output_flows]
            })

        return plan
