import axios, { isAxiosError } from 'axios';
import { API_BASE_URL } from '../config/constants';

interface PatientData {
    symptoms: string[];
    age: number;
    gender: string;
}

interface DiseasePredictionRequest {
    patient_data: PatientData;
}

interface DiseasePredictionResponse {
    dispatch_results: {
        request_id: string;
        patient_summary: {
            age: number;
            gender: string;
            symptoms: string[];
        };
        analysis_status: string;
        preliminary_assessment: string;
        error?: string;
        timestamp: string;
    }[];
}

class PredictionService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL || 'http://10.146.44.175:8000';
        console.log('PredictionService initialized with baseUrl:', this.baseUrl);
    }

    async predictDisease(symptoms: string[]): Promise<DiseasePredictionResponse> {
        try {
            console.log('🔄 Sending symptoms to prediction service:', symptoms);
            
            const request: DiseasePredictionRequest = {
                patient_data: {
                    symptoms: symptoms,
                    age: 35,  // Default age for testing
                    gender: "M"  // Default gender for testing
                }
            };

            // Log the full URL and request details
            const fullUrl = `${this.baseUrl}/orchestrate`;
            console.log('📤 Making request to:', {
                url: fullUrl,
                method: 'POST',
                data: request
            });
            
            // Create axios instance with detailed logging
            const instance = axios.create({
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type'
                }
            });

            // Add request interceptor for logging
            instance.interceptors.request.use(
                (config) => {
                    console.log('🔍 Full request config:', {
                        url: config.url,
                        method: config.method,
                        headers: config.headers,
                        data: config.data
                    });
                    return config;
                },
                (error) => {
                    console.error('❌ Request setup failed:', error);
                    return Promise.reject(error);
                }
            );

            // Add response interceptor for logging
            instance.interceptors.response.use(
                (response) => {
                    console.log('✅ Full response:', {
                        status: response.status,
                        headers: response.headers,
                        data: response.data
                    });
                    return response;
                },
                (error) => {
                    console.error('❌ Response error:', {
                        status: error.response?.status,
                        data: error.response?.data,
                        headers: error.response?.headers
                    });
                    return Promise.reject(error);
                }
            );

            // Make the request
            const response = await instance.post<DiseasePredictionResponse>(
                fullUrl,
                request
            );

            console.log('📥 Received response:', response.data);
            return response.data;

        } catch (error) {
            console.error('❌ Prediction service error:', error);
            if (isAxiosError(error)) {
                if (error.code === 'ECONNREFUSED') {
                    console.error('🔍 Connection refused. Server might be down or wrong IP/port');
                    throw new Error('Cannot connect to the server. Please check if it is running.');
                } else if (error.code === 'ETIMEDOUT') {
                    console.error('🔍 Connection timed out');
                    throw new Error('Connection timed out. Please try again.');
                } else if (error.response) {
                    console.error('🔍 Server responded with error:', error.response.data);
                    throw new Error(`Server error: ${error.response.data.error || 'Unknown error'}`);
                } else if (error.request) {
                    console.error('🔍 No response received from server');
                    throw new Error('No response from server. Please check your network connection.');
                }
                throw new Error(`Network error: ${error.message}`);
            } else if (error instanceof Error) {
                console.error('🔍 Error details:', error.message);
                throw new Error(`Prediction failed: ${error.message}`);
            } else {
                throw new Error('An unknown error occurred');
            }
        }
    }
}

// Export singleton instance
export const predictionService = new PredictionService();

export default predictionService;