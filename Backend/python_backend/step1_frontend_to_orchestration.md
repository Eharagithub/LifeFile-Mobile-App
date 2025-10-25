# Frontend Chat to Orchestration Agent Flow

## Overview
This document details Step 1 of the Multi-Agentic Healthcare System flow, where the frontend chat interface sends requests to the Orchestration Agent's Input Handler.

## Architecture Components

### 1. Frontend Chat Interface
- **Location**: `ExpoFE/app/(tabs)/home.tsx`
- **Purpose**: Provides user interface for symptom input
- **Type**: React Native component with chat UI

### 2. API Service Layer
- **Location**: `ExpoFE/services/backendApi.ts`
- **Purpose**: Handles API communication with backend
- **Port**: Connects to port 8001 (Orchestration Agent)

### 3. Orchestration Agent Input Handler
- **Location**: `python_backend/orchestration/input_handler.py`
- **Purpose**: Validates and processes incoming requests
- **Endpoint**: `/orchestrate`

## Request Flow Details

### 1. User Input Processing
```typescript
// Frontend Component (home.tsx)
const handleSubmit = async (userInput: string) => {
  const request = {
    prompt: userInput,
    user_id: "user123",
    session_id: "sess456",
    workflow: "medical_diagnosis"
  };
  
  const response = await backendApi.callOrchestrate(request);
  // Handle response...
};
```

### 2. API Request Formation
```typescript
// backendApi.ts
export const callOrchestrate = async (payload: {
  prompt: string;
  user_id: string;
  session_id: string;
  workflow: string;
}) => {
  const response = await api.post('/orchestrate', payload);
  return response.data;
};
```

### 3. Example Request
```json
{
  "prompt": "I have a severe headache and feeling dizzy since yesterday",
  "user_id": "user123",
  "session_id": "sess456",
  "workflow": "medical_diagnosis"
}
```

## Input Handler Processing

### 1. Request Validation
- Checks for required fields (prompt, user_id, session_id)
- Validates workflow type
- Ensures proper request format

### 2. Initial Processing
- Logs incoming request
- Creates session context
- Prepares for routing to appropriate service

### 3. Error Handling
- Handles malformed requests
- Manages network errors
- Provides meaningful error messages

## Configuration Requirements

### 1. Frontend Configuration
```typescript
// config/backendConfig.ts
export const BACKEND_BASE_URL = 'http://YOUR_PC_IP:8001';
```

### 2. Backend Configuration
```python
# orchestration/input_handler.py
CORS_ORIGINS = ["*"]  # Configure as needed
ALLOWED_WORKFLOWS = ["medical_diagnosis", "symptom_analysis"]
```

## Testing

### 1. Health Check
```bash
curl http://YOUR_PC_IP:8001/health
```

### 2. Test Request
```bash
curl -X POST http://YOUR_PC_IP:8001/orchestrate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "I have a headache",
    "user_id": "test_user",
    "session_id": "test_session",
    "workflow": "medical_diagnosis"
  }'
```

### 3. Expected Response Format
```json
{
  "status": "success",
  "message": "Request accepted",
  "request_id": "req123",
  "timestamp": "2025-10-15T10:00:00Z"
}
```

## Error Handling

### Common Errors
1. **Invalid Request Format**
   ```json
   {
     "error": "Invalid request format",
     "details": "Missing required field: workflow"
   }
   ```

2. **Network Connection**
   ```json
   {
     "error": "Service unavailable",
     "details": "Could not connect to orchestration agent"
   }
   ```

3. **Invalid Workflow**
   ```json
   {
     "error": "Invalid workflow",
     "details": "Workflow 'unknown' not supported"
   }
   ```

## Troubleshooting Guide

1. **Connection Issues**
   - Verify Orchestration Agent is running on port 8001
   - Check firewall settings
   - Verify correct IP address in frontend config

2. **Request Failures**
   - Validate request format
   - Check session ID format
   - Ensure workflow type is supported

3. **Response Issues**
   - Check CORS configuration
   - Verify network security settings
   - Review logs for detailed error messages

## Next Steps
After successful validation, the request moves to:
1. Prompt processing (if unstructured text)
2. Symptom analysis
3. Disease prediction

See `step2_prompt_processor.md` for details on the next step in the flow.