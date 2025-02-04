import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
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
  async (config: AxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const newConfig = { ...config };
      
      // Initialize headers if they don't exist
      if (!newConfig.headers) {
        newConfig.headers = {};
      }

      if (token) {
        newConfig.headers.Authorization = `Bearer ${token}`;
      }

      // Handle FormData requests
      if (newConfig.data instanceof FormData) {
        newConfig.headers['Content-Type'] = 'multipart/form-data';
      }

      // Log request details in development
      if (__DEV__) {
        console.log('API Request:', {
          method: newConfig.method,
          url: newConfig.url,
          data: newConfig.data,
          headers: newConfig.headers,
          baseURL: newConfig.baseURL
        });
      }

      return newConfig;
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

    // Type assertion for error to include response property
    const axiosError = error as { response?: { status: number } };
    if (axiosError.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // You can add navigation logic here if needed
    }
    return Promise.reject(error);
  }
);

export default api; 