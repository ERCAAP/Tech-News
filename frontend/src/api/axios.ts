import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get the appropriate base URL based on environment and platform
const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api/v1'; // Android Emulator
    } else if (Platform.OS === 'ios') {
      return 'http://127.0.0.1:3000/api/v1'; // iOS Simulator
    }
    return 'http://localhost:3000/api/v1'; // Web Development
  }
  
  // Production API Gateway URL
  return process.env.EXPO_PUBLIC_API_URL || 'https://xxxxxxxxxx.execute-api.eu-central-1.amazonaws.com/prod/api/v1';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-api-key': process.env.EXPO_PUBLIC_API_KEY // API Gateway API Key
  },
  validateStatus: (status: number) => status >= 200 && status < 300,
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    try {
      const token = await AsyncStorage.getItem('token');
      
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

      // Add AWS specific headers if needed
      if (!__DEV__) {
        config.headers['x-amz-date'] = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
        config.headers['x-amz-security-token'] = process.env.EXPO_PUBLIC_AWS_SESSION_TOKEN;
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
  (error: unknown) => {
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
  async (error: unknown) => {
    // Log error in development
    if (__DEV__) {
      console.error('API Error:', {
        status: (error as any)?.response?.status,
        url: (error as any)?.config?.url,
        message: (error as any)?.message,
        data: (error as any)?.response?.data
      });
    }

    // Handle AWS specific errors
    const axiosError = error as { response?: { status: number; data?: any } };
    if (axiosError.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // Handle unauthorized access
    } else if (axiosError.response?.status === 403) {
      // Handle forbidden access
      console.error('Access forbidden:', axiosError.response.data);
    } else if (axiosError.response?.status === 429) {
      // Handle API Gateway throttling
      console.error('API rate limit exceeded');
    }

    return Promise.reject(error);
  }
);

export default api; 