import axios from 'axios';
import { API_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('API Configuration:', {
  baseURL: API_URL,
  currentEnvironment: process.env.NODE_ENV
});

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      hasToken: !!token
    });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired veya geçersiz
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 