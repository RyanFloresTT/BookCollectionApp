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
  console.log('API Service - Setting auth token getter');
  getToken = tokenGetter;
};

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  async (config) => {
    try {
      console.log('API Service - Intercepting request:', config.url);
      if (getToken) {
        const token = await getToken();
        if (token) {
          console.log('API Service - Adding token to request:', token.slice(0, 10) + '...');
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log('API Service - No token available');
        }
      } else {
        console.log('API Service - No token getter available');
      }
      console.log('API Service - Final request headers:', config.headers);
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
