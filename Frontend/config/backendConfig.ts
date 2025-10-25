import Constants from 'expo-constants';

function envBackendUrl(): string | undefined {
  return Constants?.expoConfig?.extra?.backendUrl;
}

export const BACKEND_BASE_URL: string = envBackendUrl() || 'http://10.181.219.156:8001';