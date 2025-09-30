"""Unit tests for the task planner component."""
import pytest
from datetime import datetime
from multigenetic_healthcare.orchestration_agent.core.task_planner import TaskPlanner
from multigenetic_healthcare.common.mcp_schemas import MCPContext, ACLTask, MCPACL

def test_task_planner_basic_ordering():
    """Test basic task ordering based on priority."""
    planner = TaskPlanner()
    
    # Create test MCP/ACL input
    input_data = MCPACL(
        mcp=MCPContext(
            user_id="test_user",
            session_id="test_session",
            timestamp=datetime.utcnow(),
            metadata={}
        ),
        acl=[
            ACLTask(
                agent="patient_journey",
                action="track_journey",
                params={"patient_id": "123"},
                dependencies=[],
                priority=2
            ),
            ACLTask(
                agent="disease_prediction",
                action="predict_disease",
                params={"symptoms": ["fever"]},
                dependencies=[],
                priority=1
            )
        ],
        version="1.0"
    )
    
    # Plan tasks
    planned_tasks = planner.plan(input_data)
    
    # Verify ordering based on priority
    assert len(planned_tasks) == 2
    assert planned_tasks[0].agent == "disease_prediction"  # Priority 1 should be first
    assert planned_tasks[1].agent == "patient_journey"     # Priority 2 should be second

def test_task_planner_dependencies():
    """Test task ordering with dependencies."""
    planner = TaskPlanner()
    
    # Create test MCP/ACL input with dependencies
    input_data = MCPACL(
        mcp=MCPContext(
            user_id="test_user",
            session_id="test_session",
            timestamp=datetime.utcnow(),
            metadata={}
        ),
        acl=[
            ACLTask(
                agent="patient_journey",
                action="track_journey",
                params={"patient_id": "123"},
                dependencies=[],
                priority=2
            ),
            ACLTask(
                agent="disease_prediction",
                action="predict_disease",
                params={"symptoms": ["fever"]},
                dependencies=["patient_journey"],
                priority=1
            )
        ],
        version="1.0"
    )
    
    # Plan tasks
    planned_tasks = planner.plan(input_data)
    
    # Verify ordering based on dependencies
    assert len(planned_tasks) == 2
    assert planned_tasks[0].agent == "patient_journey"     # Should be first due to dependency
    assert planned_tasks[1].agent == "disease_prediction"  # Should be second despite higher priority

def test_task_planner_circular_dependencies():
    """Test handling of circular dependencies."""
    planner = TaskPlanner()
    
    # Create test MCP/ACL input with circular dependencies
    input_data = MCPACL(
        mcp=MCPContext(
            user_id="test_user",
            session_id="test_session",
            timestamp=datetime.utcnow(),
            metadata={}
        ),
        acl=[
            ACLTask(
                agent="task1",
                action="action1",
                params={},
                dependencies=["task2"],
                priority=1
            ),
            ACLTask(
                agent="task2",
                action="action2",
                params={},
                dependencies=["task1"],
                priority=2
            )
        ],
        version="1.0"
    )
    
    # Verify that circular dependencies raise an error
    with pytest.raises(ValueError, match="Circular dependency detected"):
        planner.plan(input_data)

def test_task_planner_empty_input():
    """Test handling of empty task list."""
    planner = TaskPlanner()
    
    # Create test MCP/ACL input with no tasks
    input_data = MCPACL(
        mcp=MCPContext(
            user_id="test_user",
            session_id="test_session",
            timestamp=datetime.utcnow(),
            metadata={}
        ),
        acl=[],
        version="1.0"
    )
    
    # Verify empty input handling
    planned_tasks = planner.plan(input_data)
    assert len(planned_tasks) == 0