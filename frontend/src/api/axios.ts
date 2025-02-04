import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get the appropriate base URL based on platform
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1'; // Android Emulator
  } else if (Platform.OS === 'ios') {
    return 'http://127.0.0.1:3000/api/v1'; // iOS Simulator
  }
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1'; // Web & fallback
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 300,
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Initialize headers if they don't exist
      if (!config.headers) {
        config.headers = {};
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Handle FormData requests
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }

      // Log request details in development
      if (__DEV__) {
        console.log('API Request:', {
          method: config.method,
          url: config.url,
          data: config.data,
          headers: config.headers,
          baseURL: config.baseURL
        });
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Request config error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    // Log error in development
    if (__DEV__) {
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data
      });
    }

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // You can add navigation logic here if needed
    }
    return Promise.reject(error);
  }
);

export default api; 