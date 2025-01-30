import axios, { AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NewsItem } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

console.log('API_URL:', BASE_URL);

interface ApiResponse<T> {
  status: string;
  data: T;
  token?: string;
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor'ı düzelt
api.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Hata yakalama interceptor'ı
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// API endpoints
export const newsAPI = {
  getAllNews: async () => {
    const response = await api.get<ApiResponse<{ news: NewsItem[] }>>('/news');
    return response.data;
  },

  getNewsById: async (id: string) => {
    const response = await api.get<ApiResponse<{ news: NewsItem }>>(`/news/${id}`);
    return response.data;
  },

  createNews: async (newsData: any) => {
    const response = await api.post<ApiResponse<{ news: NewsItem }>>('/news', newsData);
    return response.data;
  },

  updateNews: async (id: string, newsData: any) => {
    const response = await api.put<ApiResponse<{ news: NewsItem }>>(`/news/${id}`, newsData);
    return response.data;
  },

  deleteNews: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/news/${id}`);
    return response.data;
  },

  likeNews: async (id: string) => {
    const response = await api.post<ApiResponse<{ news: NewsItem }>>(`/news/${id}/like`);
    return response.data;
  },

  unlikeNews: async (id: string) => {
    const response = await api.delete<ApiResponse<{ news: NewsItem }>>(`/news/${id}/like`);
    return response.data;
  }
};

// Auth API endpoints
export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.post<ApiResponse<{ user: User }>>('/auth/login', { 
        email, 
        password 
      });
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error: any) {
      console.error('Login Error:', error.response?.data);
      throw error;
    }
  },
  
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.post<ApiResponse<{ user: User }>>('/auth/register', userData);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Register Error:', error);
      throw error;
    }
  },

  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.patch<ApiResponse<null>>('/auth/update-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
  }
}; 