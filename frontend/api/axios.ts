import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API URL'i platform'a göre ayarla
const baseURL = Platform.select({
  android: 'http://10.0.2.2:3000/api/v1', // Android Emulator için
  ios: 'http://localhost:3000/api/v1',     // iOS Simulator için
  default: API_URL                         // Diğer durumlar için
});

console.log('API Configuration:', {
  baseURL,
  platform: Platform.OS,
  currentEnvironment: process.env.NODE_ENV
});

const axiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        hasToken: !!token,
        headers: config.headers
      });

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  async (error) => {
    console.error('API Error Response:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message
    });

    if (error.response?.status === 401) {
      // Token expired veya geçersiz
      await AsyncStorage.removeItem('token');
      // Burada yeniden login sayfasına yönlendirme yapabilirsiniz
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 