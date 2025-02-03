import axios, { InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Get the appropriate base URL based on platform
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1'; // Android Emulator
  }
  return 'http://10.0.2.2:3000/api/v1'; // iOS Simulator & Web
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Initialize headers if they don't exist
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }

      if (config.data instanceof FormData) {
        config.headers.set('Content-Type', 'multipart/form-data');
      }

      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api; 