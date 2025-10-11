import predictionService from '../predictionService';

describe('PredictionService Integration Test', () => {
    it('should successfully predict diseases from symptoms', async () => {
        const testSymptoms = ['fever', 'cough', 'fatigue'];
        
        try {
            const result = await predictionService.predictDisease(testSymptoms);
            console.log('Test result:', JSON.stringify(result, null, 2));
            
            // Verify the response structure
            expect(result).toHaveProperty('dispatch_results');
            expect(Array.isArray(result.dispatch_results)).toBe(true);
            
            // Check each dispatch result
            result.dispatch_results.forEach(dispatch => {
                expect(dispatch).toHaveProperty('agent');
                expect(dispatch).toHaveProperty('result');
                expect(dispatch.result).toHaveProperty('predicted_diseases');
                expect(dispatch.result).toHaveProperty('confidence');
                expect(Array.isArray(dispatch.result.predicted_diseases)).toBe(true);
                expect(typeof dispatch.result.confidence).toBe('number');
            });
        } catch (error) {
            console.error('Test failed:', error);
            throw error;
        }
    });
});