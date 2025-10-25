# Multi-Agentic Healthcare System Integration Guide

## Detailed System Flow

### Complete Request Flow
1. **Frontend Chat → Orchestration Agent (8001)**
   ```json
   Example Request:
   {
     "prompt": "I have a severe headache and feeling dizzy since yesterday",
     "user_id": "user123",
     "session_id": "sess456",
     "workflow": "medical_diagnosis"
   }
   ```

2. **Orchestration Agent Input Handler**
   - Validates input structure
   - For unstructured text, routes to Prompt Processor

3. **Prompt Processor (8000)**
   - Enriches with context:
     ```json
     {
       "prompt": "I have a severe headache and feeling dizzy since yesterday",
       "user_context": {
         "user_id": "user123",
         "medical_history": "...",
         "session_data": "..."
       }
     }
     ```
   - Uses Vertex AI for:
     * Intent classification
     * Initial semantic understanding
   - Creates initial MCP/ACL structure

4. **Symptom Analyzer (8003)**
   - Maps natural language to medical terms using symptom_map:
     ```python
     symptom_map = {
       'headache': ['headache', 'head pain', 'head ache'],
       'nausea': ['nausea', 'nauseous', 'feeling sick'],
       'fever': ['fever', 'high temperature'],
       'dizziness': ['dizzy', 'light-headed']
     }
     ```
   - Example Analysis:
     ```json
     {
       "identified_symptoms": ["headache", "dizziness"],
       "severity_level": "high",
       "temporal_info": {
         "duration": "1 day",
         "onset": "yesterday"
       },
       "confidence": 0.9
     }
     ```

5. **Disease Prediction Agent (8002)**
   - Takes structured symptoms
   - Uses Vertex AI for prediction
   - Returns predictions with confidence scores:
     ```json
     {
       "predictions": [
         {
           "condition": "Migraine",
           "confidence": 0.85,
           "supporting_symptoms": ["headache", "dizziness"]
         },
         {
           "condition": "Vertigo",
           "confidence": 0.65,
           "supporting_symptoms": ["dizziness"]
         }
       ]
     }
     ```

### Data Flow Diagram
```
Frontend Chat
     ↓
Orchestration Agent (8001)
     ↓
Prompt Processor (8000)
[Enrichment + Initial LLM Analysis]
     ↓
Symptom Analyzer (8003)
[Symptom Mapping + Classification]
     ↓
Disease Prediction (8002)
[Final Analysis + Recommendations]
     ↓
Results to Frontend
```

## System Architecture Overview

The system consists of these components:
1. Expo Frontend (React Native)
2. FastAPI Modular Backend:
   - Orchestration Agent (Port 8001)
   - Disease Prediction Service (Port 8002)
   - Symptom Analyzer Service (Port 8003)
3. Prompt Processor Service (Port 8000)

## Frontend Configuration

Location: `ExpoFE/` (Main Frontend Application)

1. **Backend URL Configuration**  
   File: `ExpoFE/app.json`
   ```json
   {
     "expo": {
       "extra": {
         "backendUrl": "http://YOUR_PC_IP:8001"  // Point to orchestration agent
       }
     },
     "android": {
       "usesCleartextTraffic": true  // Required for HTTP connections
     }
   }
   ```

This guide details the configuration and setup steps needed to run both the frontend (Expo) and backend (Python FastAPI) components of the Multi-Agentic Healthcare System.

## Project Structure Note

Note: `ExpoFE` is the main frontend application folder. Other folders like `Frontend`, `ExpoFE_backup`, and `mobile` are for reference or backup purposes only.

## 1. Backend Configuration

### 1.1 Python Environment Setup

Location: `python_backend/`

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 1.2 LLM Service Configuration

The system uses Google Vertex AI as the LLM service provider. Configuration is handled through environment variables and service credentials.

1. **Environment Setup**  
   Create/update `.env` file in `python_backend/`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
   ```

2. **Service Account**
   - Place your Google Cloud service account key JSON file in a secure location
   - Update the `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`

### 1.3 FastAPI Orchestration Agent Configuration

The Orchestration Agent is configured to use Vertex AI through the LLMService class in `python_backend/services/llm_service.py`. No additional configuration is needed unless you're changing the Google Cloud project or model settings.

## 2. Frontend Configuration

### 2.1 Expo Configuration

Location: `ExpoFE/`

1. **Backend URL Configuration**  
   File: `app.json`
   ```json
   {
     "expo": {
       "extra": {
         "backendUrl": "http://YOUR_PC_IP:8001"  // Replace YOUR_PC_IP with your machine's IP, points to Orchestration Agent
       }
     }
   }
   ```

2. **Backend Config Override**  
   File: `config/backendConfig.ts`
   ```typescript
   // Will use backendUrl from app.json or fall back to orchestration agent
   export const BACKEND_BASE_URL: string = envBackendUrl() || 'http://YOUR_PC_IP:8001';
   ```

3. **Network Security Configuration**
   For Android, create `android/app/src/main/res/xml/network_security_config.xml`:
   ```xml
   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
       <base-config cleartextTrafficPermitted="true">
           <trust-anchors>
               <certificates src="system" />
           </trust-anchors>
       </base-config>
   </network-security-config>
   ```

## 3. Network Configuration

### 3.1 Find Your PC's IP Address

```powershell
# Run ipconfig and look for IPv4 Address under your active network adapter
ipconfig
```

Common locations:
- Wi-Fi adapter: "Wireless LAN adapter Wi-Fi"
- Ethernet adapter: "Ethernet adapter Ethernet"

### 3.2 Windows Firewall Configuration

Run these commands to allow incoming connections for all services:

```powershell
# Allow all required service ports
New-NetFirewallRule -DisplayName "Allow Python FastAPI 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Allow Python FastAPI 8001" -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Allow Python FastAPI 8002" -Direction Inbound -LocalPort 8002 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Allow Python FastAPI 8003" -Direction Inbound -LocalPort 8003 -Protocol TCP -Action Allow
```

## 4. Starting the Services

### 4.1 Start All Backend Services

```powershell
# Terminal 1: Prompt Processor
cd python_backend
.\.venv\Scripts\Activate.ps1
uvicorn services.prompt_processor:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Orchestration Agent
cd python_backend
.\.venv\Scripts\Activate.ps1
uvicorn orchestration_agent.main:app --reload --host 0.0.0.0 --port 8001

# Terminal 3: Disease Prediction Service
cd python_backend
.\.venv\Scripts\Activate.ps1
uvicorn agents.disease_prediction.main:app --host 0.0.0.0 --port 8002

# Terminal 4: Symptom Analyzer Service
cd python_backend
.\.venv\Scripts\Activate.ps1
uvicorn agents.symptom_analyzer.main:app --host 0.0.0.0 --port 8003
```

### 4.2 Start Expo Frontend (Terminal 5)

```powershell
cd ExpoFE
npm install  # Only needed first time or when dependencies change
npx expo start
```

Note: Make sure all backend services (Terminals 1-4) are running before starting the frontend.

## 5. Verifying the Setup

### 5.1 Backend Health Check

Test these health endpoints in your browser:
1. Prompt Processor: `http://YOUR_PC_IP:8000/health`
2. Orchestration Agent: `http://YOUR_PC_IP:8001/health`
3. Disease Prediction: `http://YOUR_PC_IP:8002/health`
4. Symptom Analyzer: `http://YOUR_PC_IP:8003/health`

Test the main orchestration endpoint:
```bash
# Test orchestration endpoint
curl -X POST http://YOUR_PC_IP:8001/orchestrate -H "Content-Type: application/json" -d '{
  "prompt": "I have a headache",
  "user_id": "test_user",
  "session_id": "test_session",
  "workflow": "medical_diagnosis"
}'
```

Verify Vertex AI connection:
- Check Orchestration Agent logs for successful LLM initialization
- Look for "Successfully initialized Vertex AI" message

### 5.2 Frontend Integration Test

1. Open the Expo app on your device
2. Navigate to the chat screen
3. Send a test message
4. Try the disease prediction feature

### 5.3 Troubleshooting Network Issues

1. **"Network Error" in chat:**
   - **Problem**: Frontend can't reach backend services
   - **Solutions**:
     - Verify all services are running (check all 4 terminals)
     - Confirm firewall rules for all ports (8000-8003)
     - Check IP address in both app.json and backendConfig.ts
     - Verify Android cleartext traffic settings
     - Test service endpoints directly with curl

2. **Android HTTP Connection Issues:**
   - **Problem**: Android blocks cleartext HTTP traffic by default
   - **Solutions**:
     - Add `usesCleartextTraffic: true` in app.json
     - Create network security config XML
     - Add network security config to Android manifest

3. **CORS Issues:**
   - **Problem**: Browser/App blocks cross-origin requests
   - **Solutions**:
     - Add CORS middleware to all FastAPI services:
       ```python
       app.add_middleware(
           CORSMiddleware,
           allow_origins=["*"],
           allow_credentials=True,
           allow_methods=["*"],
           allow_headers=["*"]
       )
       ```

4. **Service Communication Issues:**
   - **Problem**: Services can't communicate with each other
   - **Solutions**:
     - Verify all services are bound to 0.0.0.0
     - Check agent_dispatcher.py has correct URLs
     - Test inter-service communication with curl
     - Verify firewall rules for all ports

5. **Testing Service Health:**
   ```bash
   # Test the complete flow
   curl -X POST http://YOUR_PC_IP:8001/orchestrate -H "Content-Type: application/json" -d '{
     "prompt": "I have a headache and fever",
     "user_id": "test_user",
     "session_id": "test_session",
     "workflow": "medical_diagnosis"
   }'
   
   # Expected: Success response with symptom analysis and disease predictions
   ```

## 6. Development Notes

### 6.1 Port Usage
- Port 8000: Prompt Processor Service
- Port 8001: Orchestration Agent (Main API endpoint)
- Port 8002: Disease Prediction Service
- Port 8003: Symptom Analyzer Service

Note: The LLM service runs on Google Vertex AI and does not require a local port.

### 6.2 Configuration Files Summary
1. `ExpoFE/app.json`: Backend URL and Android network settings
2. `ExpoFE/config/backendConfig.ts`: Backend URL fallback
3. `ExpoFE/android/.../network_security_config.xml`: Android security settings
4. `python_backend/orchestration/agent_dispatcher.py`: Inter-service URLs
5. Each service's main.py: CORS configuration

### 6.3 Testing Changes
After changing any configuration:
1. Restart the affected service
2. Clear Expo cache if needed: `npx expo start -c`
3. Verify connectivity in the app