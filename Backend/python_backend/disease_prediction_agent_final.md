# Disease Prediction Agent Implementation Guide

## Table of Contents
1. [Initial Architecture](#initial-architecture)
2. [Migration to Modular Architecture](#migration-to-modular-architecture)
3. [Current Architecture](#current-architecture)
4. [Implementation Details](#implementation-details)
5. [Integration Testing](#integration-testing)
6. [Troubleshooting Guide](#troubleshooting-guide)

## Initial Architecture

### Overview
Initially, we had a monolithic architecture where all functionality was contained in a single FastAPI service:
- Single endpoint at port 8000
- Combined symptom analysis and disease prediction
- Direct integration with frontend
- No separation of concerns

### Original Setup
```plaintext
python_backend/
├── main.py           # All logic in one file
├── requirements.txt
└── models/
    └── ...          # Basic disease prediction models
```

## Migration to Modular Architecture

### Motivation
1. Better separation of concerns
2. Independent scaling of services
3. Easier maintenance and testing
4. More robust error handling
5. Better development workflow

### Step-by-Step Migration Process

1. **Service Separation and Pythonic Architecture**
   - Split into multiple microservices following Pythonic principles
   - Implemented core Pythonic design patterns:
     ```plaintext
     a. SOLID Principles
        - Single Responsibility: Each agent handles one specific task
        - Open/Closed: Easy to extend without modifying existing code
        - Liskov Substitution: Agents can be swapped with different implementations
        - Interface Segregation: Clean API contracts between services
        - Dependency Inversion: High-level modules don't depend on low-level ones
     
     b. Component Organization
        - agents/: Concrete implementations (disease_prediction, symptom_analyzer)
        - orchestration/: Core orchestration logic and workflow management
        - services/: Shared services and utilities
        - common/: Reusable components and utilities
     
     c. Clean Architecture Layers
        - Presentation: FastAPI endpoints
        - Business Logic: Agent-specific processing
        - Data Access: Model interactions and external services
     ```
   
   - Created dedicated ports for each service:
     ```plaintext
     - Port 8000: Prompt Processor
     - Port 8001: Orchestration Agent (Core orchestration with MCP/ACL handling)
     - Port 8002: Disease Prediction (Specialized prediction service)
     - Port 8003: Symptom Analyzer (Natural language processing)
     ```

   - Implemented modular components:
     ```plaintext
     - InputHandler: Validates and processes incoming requests
     - TaskPlanner: Determines workflow and task sequence
     - AgentDispatcher: Routes tasks to appropriate services
     - StateManager: Maintains workflow state
     - ResultAggregator: Combines results from multiple agents
     ```

2. **Network Configuration**
   ```powershell
   # Added firewall rules for each service
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8001" -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8002" -Direction Inbound -LocalPort 8002 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8003" -Direction Inbound -LocalPort 8003 -Protocol TCP -Action Allow
   ```

## Current Architecture

### Directory Structure
```plaintext
python_backend/
├── agents/
│   ├── disease_prediction/
│   │   ├── main.py             # Currently contains all logic and models
│   │   ├── models.py          # [Planned] Will contain Pydantic models
│   │   └── utils.py           # [Planned] Will contain utility functions
│   └── symptom_analyzer/
│       └── main.py

Note: The models.py and utils.py files are planned for future implementation
to better separate concerns and follow coding best practices. Currently, all
functionality is in main.py. Future updates will:
- Move data models to models.py (DiseasePredictionRequest, MCPACLPrompt, etc.)
- Move utility functions to utils.py (prediction calculations, data processing)
This separation will improve code organization and maintainability.
├── orchestration/
│   ├── main.py
│   ├── agent_dispatcher.py
│   ├── input_handler.py
│   └── task_planner.py
├── sub_agents/
│   ├── task_handler.py
│   ├── domain_logic.py
│   ├── api_data_connector.py
│   ├── state_manager.py
│   ├── result_formatter.py
│   └── ...
└── services/
  └── prompt_processor/
    └── main.py
```

### Service Architecture
1. **Disease Prediction Agent (Port 8002)**
   - Dedicated to disease prediction
   - Receives structured symptoms
   - Returns predicted diseases with confidence scores

2. **Symptom Analyzer (Port 8003)**
   - Processes natural language input
   - Extracts and standardizes symptoms
   - Determines severity levels

3. **Orchestration Agent (Port 8001)**
   - Coordinates between services
   - Handles MCP/ACL protocol
   - Manages workflow execution

4. **Frontend Integration**
   - Uses MCP/ACL format for requests
   - Communicates with orchestration agent
   - Handles multiple agent responses

## Implementation Details

### Symptom Analyzer Agent
```python
# agents/symptom_analyzer/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

class SymptomRequest(BaseModel):
    symptoms_text: str

class SymptomResponse(BaseModel):
    identified_symptoms: List[str]
    confidence: float
    severity_level: str

app = FastAPI(title="Symptom Analyzer Agent")

@app.post("/analyze_symptoms", response_model=SymptomResponse)
async def analyze_symptoms(request: SymptomRequest):
    # Natural language processing to extract symptoms
    # Example: "I have fever and cough" -> ["fever", "cough"]
    identified = extract_symptoms(request.symptoms_text)
    
    # Determine severity based on symptom combinations and duration
    severity = calculate_severity(identified)
    
    # Calculate confidence based on clarity of symptoms in text
    confidence = calculate_confidence(request.symptoms_text, identified)
    
    return SymptomResponse(
        identified_symptoms=identified,
        confidence=confidence,
        severity_level=severity
    )
```

### Disease Prediction Agent
```python
# agents/disease_prediction/main.py
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any

class DiseaseRequest(BaseModel):
    symptoms: List[str]

class DiseaseResponse(BaseModel):
    predicted_diseases: List[str]
    confidence: float

app = FastAPI(title="Disease Prediction Agent")

@app.post("/predict_disease", response_model=DiseaseResponse)
async def predict_disease(request: DiseaseRequest):
    # Use structured symptoms to predict possible diseases
    predictions = predict_diseases(request.symptoms)
    confidence = calculate_prediction_confidence(predictions)
    
    return DiseaseResponse(
        predicted_diseases=predictions,
        confidence=confidence
    )
```

### MCP/ACL Protocol
```typescript
// Frontend request format
const mcpPayload = {
  mcp_acl: {
    agents: ["symptom_analyzer", "disease_prediction"],
    workflow: "medical_diagnosis",
    actions: [
      {
        agent: "symptom_analyzer",
        action: "analyze_symptoms",
        params: { symptoms_text: userInput }
      },
      {
        agent: "disease_prediction",
        action: "predict_disease",
        params: { symptoms: [] }  // Populated from analyzer
      }
    ],
    data_flow: [
      {
        from: "symptom_analyzer",
        to: "disease_prediction",
        data: "structured_symptoms"
      }
    ]
  }
};
```

## Integration Testing
## A complte workflow for the disease prediction agent available in step10-integration-env-setup.md fiel under Detailed System Flow
### Test Workflow
1. User inputs symptoms in natural language
2. Symptom analyzer processes and structures the input
3. Disease prediction generates possible conditions
4. Results are aggregated and returned to frontend

### Example Request/Response
```javascript
// Request
POST http://192.168.1.25:8001/orchestrate
{
  "symptoms_text": "Fever"
}

// Response
{
  "status": "success",
  "results": [
    {
      "agent": "symptom_analyzer",
      "result": {
        "identified_symptoms": ["fever"],
        "confidence": 0.7,
        "severity_level": "low"
      }
    },
    {
      "agent": "disease_prediction",
      "result": {
        "predicted_diseases": [
          "Viral Infection",
          "Bacterial Infection",
          "Influenza",
          "Common Cold",
          "COVID-19",
          "UTI"
        ],
        "confidence": 0.1
      }
    }
  ]
}
```

## Troubleshooting Guide

### Common Issues and Solutions

1. **Network Errors**
   - Verify all services are running
   - Check firewall rules
   - Ensure correct IP and ports in configuration

2. **CORS Issues**
   - Added CORS middleware to FastAPI services
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"]
   )
   ```

3. **Android Cleartext Traffic**
   - Updated app.json for HTTP traffic
   ```json
   {
     "android": {
       "usesCleartextTraffic": true
     }
   }
   ```

### Service Health Checks
```bash
# Test orchestration agent
curl -X POST http://192.168.1.25:8001/orchestrate -H "Content-Type: application/json" -d "..."

# Expected: 200 OK with valid JSON response
```

## Frontend Implementation

### Initial Setup
1. **Environment Requirements**
   ```bash
   Node.js >= 20.0.0 (Recommended: 20.9.0 or later)
   npm >= 10.0.0
   Expo CLI (latest)
   Python >= 3.11 for backend services
   ```

   To verify your versions:
   ```bash
   node --version    # Should show v20.x.x
   npm --version     # Should show v10.x.x
   python --version  # Should show Python 3.11 or higher
   ```

   Note: All backend services must be running before starting the frontend:
   - Prompt Processor (8000)
   - Orchestration Agent (8001)
   - Disease Prediction (8002)
   - Symptom Analyzer (8003)

2. **Backend Setup**
   ```bash
   # Create and activate Python virtual environment
   cd python_backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Install Python dependencies
   pip install -r requirements.txt
   ```

3. **Frontend Installation Steps**
   ```bash
   # Install Expo CLI globally
   npm install -g expo-cli

   # Navigate to ExpoFE directory
   cd ExpoFE

   # Install dependencies
   npm install

   # Required packages
   npm install @react-navigation/native @react-navigation/stack
   npm install axios
   npm install @react-native-async-storage/async-storage
   npm install react-native-gesture-handler
   npm install expo-router
   npm install @expo/vector-icons
   ```

3. **Environment Configuration**
   Create `config/backendConfig.ts`:
   ```typescript
   import Constants from 'expo-constants';

   export const BACKEND_BASE_URL = Constants.expoConfig?.extra?.backendUrl 
     || 'http://YOUR_PC_IP:8001';
   ```

   Update `app.json`:
   ```json
   {
     "expo": {
       "name": "CareFlow",
       "slug": "careflow",
       "version": "1.0.0",
       "orientation": "portrait",
       "extra": {
         "backendUrl": "http://YOUR_PC_IP:8001"
       },
       "android": {
         "usesCleartextTraffic": true,
         "package": "com.yourcompany.careflow",
         "adaptiveIcon": {
           "foregroundImage": "./assets/adaptive-icon.png",
           "backgroundColor": "#ffffff"
         }
       }
     }
   }
   ```

4. **Network Configuration**
   
   First, find your PC's IP address:
   ```powershell
   # Run ipconfig and look for IPv4 Address
   ipconfig
   ```

   Then configure Windows Firewall:
   ```powershell
   # Allow all required service ports
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8001" -Direction Inbound -LocalPort 8001 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8002" -Direction Inbound -LocalPort 8002 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "Allow Python FastAPI 8003" -Direction Inbound -LocalPort 8003 -Protocol TCP -Action Allow
   ```

5. **Android Configuration**
   Create `android/app/src/main/res/xml/network_security_config.xml`:
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

6. **Starting the Services**

   Start backend services (in separate terminals):
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

   Start frontend (in a new terminal):
   ```powershell
   # Terminal 5: Frontend
   cd ExpoFE
   npx expo start

   # For Android
   npx expo run:android

   # For iOS
   npx expo run:ios
   ```

7. **Verify Setup**
   Test these health endpoints in your browser:
   1. `http://YOUR_PC_IP:8000/health` (Prompt Processor)
   2. `http://YOUR_PC_IP:8001/health` (Orchestration Agent)
   3. `http://YOUR_PC_IP:8002/health` (Disease Prediction)
   4. `http://YOUR_PC_IP:8003/health` (Symptom Analyzer)

### Directory Structure
```plaintext
ExpoFE/
├── app/
│   ├── (tabs)/
│   │   ├── home.tsx         # Home screen with chat interface
│   │   ├── profile.tsx      # User profile management
│   │   └── settings.tsx     # App settings
│   ├── auth/
│   │   └── login.tsx        # Authentication screens
│   └── index.tsx            # Entry point
├── components/
│   ├── ui/
│   │   ├── ChatInput.tsx    # Chat input component
│   │   ├── MessageBubble.tsx# Chat message display
│   │   └── Prediction.tsx   # Disease prediction display
│   └── common/
│       └── Loading.tsx      # Loading states
├── services/
│   ├── backendApi.ts        # API integration with backend
│   └── types.ts             # TypeScript interfaces
└── config/
    └── backendConfig.ts     # Backend URL configuration
```

### API Integration
```typescript
// services/backendApi.ts
import axios from 'axios';
import { BACKEND_BASE_URL } from '../config/backendConfig';

interface PredictionRequest {
  prompt: string;
  user_id: string;
  session_id: string;
  workflow: string;
}

export const predictDisease = async (symptoms: string): Promise<any> => {
  try {
    const response = await axios.post(`${BACKEND_BASE_URL}/orchestrate`, {
      prompt: symptoms,
      user_id: 'current_user',
      session_id: 'session_123',
      workflow: 'medical_diagnosis'
    });
    return response.data;
  } catch (error) {
    console.error('Error in disease prediction:', error);
    throw error;
  }
};
```

### Chat Interface
```typescript
// components/ui/ChatInput.tsx
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { predictDisease } from '../../services/backendApi';

export const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const result = await predictDisease(input);
      // Handle prediction result
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Describe your symptoms..."
      />
      <Button 
        title="Send" 
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
};
```

### Results Display
```typescript
// components/ui/Prediction.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface PredictionProps {
  predictions: Array<{
    condition: string;
    confidence: number;
    supporting_symptoms: string[];
  }>;
}

export const Prediction: React.FC<PredictionProps> = ({ predictions }) => {
  return (
    <View style={styles.container}>
      {predictions.map((pred, index) => (
        <View key={index} style={styles.predictionCard}>
          <Text style={styles.condition}>{pred.condition}</Text>
          <Text>Confidence: {(pred.confidence * 100).toFixed(1)}%</Text>
          <Text>Based on: {pred.supporting_symptoms.join(', ')}</Text>
        </View>
      ))}
    </View>
  );
};
```

### Error Handling
```typescript
// services/errorHandling.ts
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 404:
        return 'Service not available';
      case 500:
        return 'Internal server error';
      default:
        return 'Something went wrong';
    }
  } else if (error.request) {
    // No response received
    return 'Network error - please check your connection';
  }
  return 'An unexpected error occurred';
};
```

### Additional Configuration Files

1. **TypeScript Configuration**
   Create `tsconfig.json`:
   ```json
   {
     "extends": "expo/tsconfig.base",
     "compilerOptions": {
       "strict": true,
       "baseUrl": ".",
       "paths": {
         "@/*": ["*"],
         "@components/*": ["components/*"],
         "@services/*": ["services/*"],
         "@config/*": ["config/*"]
       }
     },
     "include": ["**/*.ts", "**/*.tsx"],
     "exclude": ["node_modules"]
   }
   ```

2. **ESLint Configuration**
   Create `.eslintrc.js`:
   ```javascript
   module.exports = {
     extends: ['universe/native', 'universe/shared/typescript-analysis'],
     overrides: [
       {
         files: ['*.ts', '*.tsx', '*.d.ts'],
         parserOptions: {
           project: './tsconfig.json'
         }
       }
     ],
     rules: {
       'import/order': 'warn'
     }
   };
   ```

3. **Babel Configuration**
   Update `babel.config.js`:
   ```javascript
   module.exports = function (api) {
     api.cache(true);
     return {
       presets: ['babel-preset-expo'],
       plugins: [
         'expo-router/babel',
         ['module-resolver', {
           root: ['./'],
           alias: {
             '@': './',
             '@components': './components',
             '@services': './services',
             '@config': './config'
           }
         }]
       ]
     };
   };
   ```

### Testing Setup

1. **Unit Testing Configuration**
   ```bash
   # Install testing dependencies
   npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
   ```

   Create `jest.config.js`:
   ```javascript
   module.exports = {
     preset: 'jest-expo',
     transformIgnorePatterns: [
       'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
     ],
     setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect']
   };
   ```

2. **Sample Test**
   Create `components/ui/__tests__/ChatInput.test.tsx`:
   ```typescript
   import React from 'react';
   import { render, fireEvent } from '@testing-library/react-native';
   import { ChatInput } from '../ChatInput';

   describe('ChatInput', () => {
     it('handles user input correctly', () => {
       const { getByPlaceholderText, getByText } = render(<ChatInput />);
       const input = getByPlaceholderText('Describe your symptoms...');
       fireEvent.changeText(input, 'I have a headache');
       expect(input.props.value).toBe('I have a headache');
     });
   });
   ```

### Style Guide and Best Practices

1. **Component Structure**
   - Keep components small and focused
   - Use TypeScript interfaces for props
   - Implement error boundaries
   - Follow React Native performance best practices

2. **State Management**
   - Use React hooks for local state
   - Consider Context API for global state
   - Implement proper error handling
   - Cache API responses when appropriate

3. **Code Organization**
   - Follow feature-based structure
   - Keep business logic in services
   - Use custom hooks for shared logic
   - Implement proper type checking

4. **Testing Guidelines**
   - Write unit tests for components
   - Test API integration
   - Implement E2E tests for critical flows
   - Mock external dependencies

## Future Improvements

1. **Enhanced Error Handling**
   - Better error propagation
   - Detailed error messages
   - Retry mechanisms

2. **Performance Optimization**
   - Caching frequent predictions
   - Load balancing
   - Response time optimization

3. **Security Enhancements**
   - Authentication
   - Rate limiting
   - Input validation

4. **Monitoring and Logging**
   - Service health monitoring
   - Request/response logging
   - Performance metrics

5. **Frontend Enhancements**
   - Offline support
   - Chat history persistence
   - Real-time symptom analysis
   - Enhanced UI/UX for predictions
   - Accessibility improvements

## Conclusion

The migration from a monolithic to a modular architecture has significantly improved the system's maintainability, scalability, and robustness. The disease prediction agent now operates as an independent service while maintaining seamless integration with other components through the orchestration layer.

Key achievements:
1. Successful service separation
2. Clean API interfaces
3. Robust error handling
4. Efficient inter-service communication
5. Scalable architecture for future enhancements