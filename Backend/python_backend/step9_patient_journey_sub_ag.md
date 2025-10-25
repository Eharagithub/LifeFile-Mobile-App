# Step 9: Patient Journey Sub-Agent Integration with Neo4j (Beginner Friendly)

This guide walks you through creating and integrating a Patient Journey Agent that uses Neo4j to track and analyze patient pathways through the healthcare system.

---

## Overview of the Workflow

1. **Define Patient Journey States**: Create graph nodes for different patient states (e.g., Registration, Triage, Consultation, etc.).
2. **Track State Transitions**: Record how patients move between states.
3. **Store Events and Metadata**: Capture relevant data at each state.
4. **Query Journey Analytics**: Analyze patterns and optimize patient flows.
5. **Integration with Other Agents**: Connect with Disease Prediction and other agents.

---

## 1. Patient Journey Agent Components

### TaskHandler
```python
from typing import Dict, Any
from .domain_logic import PatientJourneyLogic

class PatientJourneyTaskHandler:
    def __init__(self):
        self.domain_logic = PatientJourneyLogic()

    async def handle_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        action = task.get("action")
        params = task.get("params", {})

        if action == "update_journey":
            return await self.domain_logic.update_patient_journey(
                patient_id=params.get("patient_id"),
                new_state=params.get("new_state"),
                metadata=params.get("metadata", {})
            )
        elif action == "get_journey":
            return await self.domain_logic.get_patient_journey(
                patient_id=params.get("patient_id")
            )
        else:
            raise ValueError(f"Unknown action: {action}")
```

### DomainLogic (Placeholder)
```python
from typing import Dict, Any
import neo4j

class PatientJourneyLogic:
    def __init__(self):
        # Neo4j connection will be initialized here
        pass

    async def update_patient_journey(self, patient_id: str, new_state: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        # Add journey state node and relationship in Neo4j
        # Return updated journey info
        pass

    async def get_patient_journey(self, patient_id: str) -> Dict[str, Any]:
        # Query Neo4j for patient's journey path
        # Return journey analytics
        pass
```

---

## 2. Example Workflow

### A. Update Patient Journey State
```bash
curl -X POST "http://127.0.0.1:8000/orchestrate" -H "Content-Type: application/json" -d '{
    "mcp": {
        "context": {
            "user_id": "123",
            "session_id": "abc"
        },
        "workflow": "patient_journey_tracking",
        "timestamp": "2025-10-03T12:00:00Z"
    },
    "acl": [{
        "agent": "Patient Journey Agent",
        "action": "update_journey",
        "params": {
            "patient_id": "patient123",
            "new_state": "TRIAGE",
            "metadata": {
                "temperature": "38.5C",
                "blood_pressure": "120/80"
            }
        }
    }]
}'
```

### B. Query Patient Journey
```bash
curl -X POST "http://127.0.0.1:8000/orchestrate" -H "Content-Type: application/json" -d '{
    "mcp": {
        "context": {
            "user_id": "123",
            "session_id": "abc"
        },
        "workflow": "patient_journey_tracking",
        "timestamp": "2025-10-03T12:00:00Z"
    },
    "acl": [{
        "agent": "Patient Journey Agent",
        "action": "get_journey",
        "params": {
            "patient_id": "patient123"
        }
    }]
}'
```

---

## 3. Neo4j Graph Model

### Nodes
- `(:Patient {id: string})`
- `(:JourneyState {name: string, timestamp: datetime})`

### Relationships
- `(:Patient)-[:HAS_STATE {order: int}]->(:JourneyState)`
- `(:JourneyState)-[:NEXT_STATE]->(:JourneyState)`

---

## Next Steps
1. Implement the Neo4j connection in DomainLogic
2. Add proper error handling and validation
3. Implement journey analytics and reporting
4. Add integration with Disease Prediction Agent
5. Create comprehensive test suite

This workflow demonstrates how to track patient journeys using Neo4j graph database, making it easy to analyze patterns and optimize healthcare pathways.