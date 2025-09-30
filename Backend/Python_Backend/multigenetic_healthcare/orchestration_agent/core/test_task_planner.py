from datetime import datetime
from multigenetic_healthcare.common.mcp_schemas import MCPACL, MCPContext, ACLTask
from multigenetic_healthcare.orchestration_agent.core.task_planner import TaskPlanner
import pytest

@pytest.mark.asyncio
async def test_task_planner():
    """Test the TaskPlanner component."""
    
    # Create test MCP/ACL input
    mcp_acl = MCPACL(
        mcp=MCPContext(
            user_id="123",
            session_id="test_session",
            timestamp=datetime.utcnow(),
            metadata={"workflow_type": "patient_consultation"}
        ),
        acl=[
            ACLTask(
                agent="disease_prediction",
                action="predict_disease",
                params={"symptoms": ["fever", "cough"]},
                dependencies=[],
                priority=2
            ),
            ACLTask(
                agent="patient_journey",
                action="track_journey",
                params={"patient_id": "123"},
                dependencies=[],
                priority=3
            )
        ],
        version="1.0"
    )
    
    # Initialize TaskPlanner
    planner = TaskPlanner()
    
    # Get execution plan
    plan = await planner.plan(mcp_acl)
    
    # Verify plan
    assert len(plan) == 2, "Plan should have 2 tasks"
    
    # Verify order (patient_journey should be first in patient_consultation workflow)
    assert plan[0].agent == "patient_journey", "Patient journey should be first"
    assert plan[1].agent == "disease_prediction", "Disease prediction should be second"
    
    # Verify dependencies
    assert "patient_journey" in plan[1].dependencies, "Disease prediction should depend on patient journey"
    
    print("TaskPlanner test passed successfully! ✅")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_task_planner())