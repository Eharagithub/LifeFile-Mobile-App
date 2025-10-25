
import requests
from typing import List, Dict, Any

class AgentDispatcher:
    """
    Sends tasks to sub-agents using MCP/ACL messages, API calls, etc.
    """
    def __init__(self):
        # Agent endpoints
        # Host can be configured via environment variable BACKEND_HOST. Defaults to localhost.
        import os
        host = os.environ.get('BACKEND_HOST') or os.environ.get('AGENT_HOST') or '127.0.0.1'
        self.disease_prediction_url = f"http://{host}:8002/predict_disease"
        self.symptom_analyzer_url = f"http://{host}:8003/analyze_symptoms"

    def dispatch(self, tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        results = []
        intermediate_results = {}  # Store results for data flow between agents
        
        for task in tasks:
            agent = task.get('agent')
            action = task.get('action')
            params = task.get('params', {})
            
            try:
                if agent.lower() == 'symptom_analyzer':
                    if action == 'analyze_symptoms':
                        response = requests.post(
                            self.symptom_analyzer_url,
                            json={'symptoms_text': params.get('symptoms_text', '')}
                        )
                        response.raise_for_status()
                        result = response.json()
                        # Store the identified symptoms for disease prediction
                        if result.get('result', {}).get('identified_symptoms'):
                            intermediate_results['structured_symptoms'] = result['result']['identified_symptoms']
                        results.append({
                            'agent': agent,
                            'result': result.get('result'),
                            'error': result.get('error')
                        })
                    else:
                        results.append({
                            'agent': agent,
                            'error': f'Unknown action for symptom_analyzer: {action}'
                        })
                
                elif agent.lower() == 'disease_prediction':
                    if action == 'predict_disease':
                        # Use symptoms from symptom analyzer if available
                        symptoms = intermediate_results.get('structured_symptoms', params.get('symptoms', []))
                        response = requests.post(
                            self.disease_prediction_url,
                            json={'symptoms': symptoms}
                        )
                        response.raise_for_status()
                        result = response.json()
                        results.append({
                            'agent': agent,
                            'result': result.get('result'),
                            'error': result.get('error')
                        })
                    else:
                        results.append({
                            'agent': agent,
                            'error': f'Unknown action for disease_prediction: {action}'
                        })
                
                elif agent.lower() == 'patient_journey':
                    if action == 'track_journey':
                        response = requests.post(
                            self.patient_journey_url,
                            json=params
                        )
                        response.raise_for_status()
                        result = response.json()
                        results.append({
                            'agent': agent,
                            'result': result.get('result'),
                            'error': result.get('error')
                        })
                    else:
                        results.append({
                            'agent': agent,
                            'error': f'Unknown action for patient_journey: {action}'
                        })
                
                else:
                    results.append({
                        'agent': agent,
                        'result': None,
                        'error': f'No handler implemented for agent: {agent}'
                    })
            except Exception as e:
                results.append({
                    'agent': agent,
                    'result': None,
                    'error': f'Error dispatching to {agent}: {str(e)}'
                })
        return results
