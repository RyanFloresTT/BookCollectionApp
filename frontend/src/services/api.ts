import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create a function to get the token
let getToken: (() => Promise<string>) | null = null;

export const setAuthToken = (tokenGetter: () => Promise<string>) => {
  getToken = tokenGetter;
};

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  async (config) => {
    try {
      if (getToken) {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log('API Service - No token available');
        }
      } else {
        console.log('API Service - No token getter available');
      }
      return config;
    } catch (error) {
      console.error('API Service - Error getting token:', error);
      if (error instanceof Error) {
        console.error('API Service - Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
      return config;
    }
  },
  (error) => {
    console.error('API Service - Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default api;
