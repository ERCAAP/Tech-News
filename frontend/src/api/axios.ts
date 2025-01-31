import axios, { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Instead of using @env, we'll use a constant
const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Request interceptor with proper typing
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const newConfig = { ...config };
      
      if (!newConfig.headers) {
        newConfig.headers = {};
      }

      if (token) {
        newConfig.headers.Authorization = `Bearer ${token}`;
      }
      
      // FormData için content-type ayarı
      if (config.data instanceof FormData) {
        newConfig.headers['Content-Type'] = 'multipart/form-data';
      }
      
      return newConfig;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api; 