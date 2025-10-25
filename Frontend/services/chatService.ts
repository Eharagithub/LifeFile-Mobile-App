import axios from 'axios';
import { BACKEND_BASE_URL } from '../config/backendConfig';

export interface ChatMessage {
    id: number;
    type: 'user' | 'bot';
    text: string;
    time: string;
}

class ChatService {
    private extractSymptoms(userMessage: string): string[] {
        console.log('Extracting symptoms from:', userMessage);
        
        // Convert message to lowercase for easier matching
        const message = userMessage.toLowerCase();
        
        // Common words to remove
        const wordsToRemove = [
            'experiencing', 'with', 'having', 'feel', 'feeling', 'suffering',
            'from', 'got', 'have', 'has', 'am', 'is', 'are', 'i', 'and', 'also',
            'plus', 'some', 'bit', 'little', 'lot', 'of', 'the', 'this', 'these',
            'im', "i'm", "'m"
        ];
        
        // Create a regex pattern to remove common words
        const removeWordsPattern = new RegExp(`\\b(${wordsToRemove.join('|')})\\b`, 'gi');
        
        // Clean the message
        let cleanedMessage = message
            .replace(removeWordsPattern, ',')  // Replace common words with comma
            .replace(/\s+/g, ' ')             // Replace multiple spaces with single space
            .replace(/,+/g, ',')              // Replace multiple commas with single comma
            .replace(/^\,|\,$/g, '')          // Remove leading/trailing commas
            .trim();
        
        // Split by common delimiters and clean up
        const symptoms = cleanedMessage
            .split(/,|\sand\s|&/)
            .map(s => s.trim())
            .filter(s => s.length > 0 && !wordsToRemove.includes(s));
            
        console.log('Extracted symptoms:', symptoms);
        return symptoms;
    }

    async processHealthQuery(userMessage: string): Promise<string> {
        try {
            console.log('Processing health query:', userMessage);
            // Build a minimal MCP/ACL payload expected by the orchestrator
            const mcp_acl = {
                agents: ["symptom_analyzer", "disease_prediction"],
                workflow: "disease_prediction",
                actions: [
                    {
                        agent: "symptom_analyzer",
                        action: "analyze_symptoms",
                        params: { symptoms_text: userMessage }
                    },
                    {
                        agent: "disease_prediction",
                        action: "predict_disease",
                        params: { symptoms: [] }
                    }
                ],
                data_flow: [
                    {
                        from: "symptom_analyzer",
                        to: "disease_prediction",
                        data: "structured_symptoms"
                    }
                ]
            };

            const fullUrl = `${BACKEND_BASE_URL}/orchestrate`;
            console.log('Posting to orchestrator at:', fullUrl);
            const response = await axios.post(fullUrl, { mcp_acl }, {
                headers: { 'Content-Type': 'application/json' }
            });
            const data = response.data;
            // Handle MCP/ACL and dispatch_results
            // The orchestrator may return `dispatch_results` or `results`; normalize both
            const results = data.dispatch_results || data.results || [];
            if (results && results.length > 0) {
                // Prefer disease_prediction result if present
                const dp = results.find((r: any) => r.agent && r.agent.toLowerCase().includes('disease')) || results[results.length - 1];
                if (dp && dp.error) {
                    return `I encountered an error while analyzing your symptoms: ${dp.error}`;
                }

                // Build a user-friendly summary
                const parts: string[] = [];
                if (dp && dp.result) {
                    const res = dp.result;
                    if (res.predicted_diseases && res.predicted_diseases.length > 0) {
                        parts.push(`Possible conditions: ${res.predicted_diseases.join(', ')}`);
                    }
                    if (typeof res.confidence === 'number') {
                        parts.push(`Confidence: ${(res.confidence * 100).toFixed(0)}%`);
                    }
                }
                if (parts.length === 0) {
                    return "I analyzed your symptoms but couldn't generate a prediction. Please provide more details.";
                }
                parts.push('\nPlease note: This is not a diagnosis. Always consult with a healthcare professional.');
                return parts.join('\n');
            }
            return "I understand you're not feeling well. Could you please describe your symptoms in more detail? This will help me provide better information.";
        } catch (error: any) {
            // Axios errors include response info when available
            console.error('Error processing health query: ', error?.message || error);
            if (error.response) {
                console.error('Orchestrator response status:', error.response.status);
                console.error('Orchestrator response data:', error.response.data);
                if (error.response.status === 404) {
                    return "The orchestration service was not found (404). Please ensure the backend is running and BACKEND_BASE_URL is configured correctly.";
                }
                return `Orchestration service returned status ${error.response.status}.`;
            }
            return "I'm having trouble processing your query right now. Could you please try again or rephrase your symptoms?";
        }
    }
}

export const chatService = new ChatService();
export default chatService;