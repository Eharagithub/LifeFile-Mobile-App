import { predictionService } from './predictionService';

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
            
            // Extract symptoms from the user message
            const symptoms = this.extractSymptoms(userMessage);
            
            // If symptoms are found, send them to prediction service
            if (symptoms.length > 0) {
                console.log('Sending symptoms to prediction service:', symptoms);
                const response = await predictionService.predictDisease(symptoms);
                console.log('Received prediction response:', response);
                
                // Check if we have valid prediction results
                if (response.dispatch_results && response.dispatch_results.length > 0) {
                    const result = response.dispatch_results[0];
                    
                    // Check for errors
                    if (result.error) {
                        console.error('Prediction error:', result.error);
                        return `I encountered an error while analyzing your symptoms: ${result.error}`;
                    }
                    
                    // Handle the new response format
                    console.log('Processing analysis result:', result);
                    
                    // Format the response based on available data
                    const messageParts = [];
                    
                    if (result.patient_summary) {
                        messageParts.push(`Based on your symptoms (${result.patient_summary.symptoms.join(', ')})`);
                    }
                    
                    if (result.preliminary_assessment) {
                        messageParts.push(result.preliminary_assessment);
                    }
                    
                    if (result.analysis_status === "processing") {
                        messageParts.push("I'm analyzing your symptoms. Please wait a moment...");
                    }
                    
                    return messageParts.join('\n\n') + "\n\nPlease note: This is not a diagnosis. Always consult with a healthcare professional for proper medical advice.";
                }
            }
            
            // Default response if no valid prediction
            return "I understand you're not feeling well. Could you please describe your symptoms in more detail? This will help me provide better information.";
            
        } catch (error) {
            console.error('Error processing health query:', error);
            return "I'm having trouble processing your query right now. Could you please try again or rephrase your symptoms?";
        }
    }
}

export const chatService = new ChatService();
export default chatService;