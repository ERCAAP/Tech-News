import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NewsItem } from '@/types';

// API URL'ini .env'den al
const API_URL = process.env.EXPO_PUBLIC_API_URL;

console.log('API_URL:', API_URL); // Debug için

interface ApiResponse<T> {
  status: string;
  data: T;
  token?: string;
}

interface RequestConfig {
  headers?: Record<string, string>;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // 10 saniye timeout
});

// Token interceptor
api.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
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

export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    try {
      console.log('Register Request:', userData);
      const response = await api.post<ApiResponse<{ user: User }>>('/auth/register', userData);
      console.log('Register Response:', response.data);
      
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
    const response = await api.get<ApiResponse<{ user: User }>>('/v1/auth/me');
    return response.data;
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.patch<ApiResponse<null>>('/v1/auth/update-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
  }
};

export const newsAPI = {
  getAllNews: async (): Promise<ApiResponse<{ news: NewsItem[] }>> => {
    const response = await api.get<ApiResponse<{ news: NewsItem[] }>>('/v1/news');
    return response.data;
  },

  getNewsById: async (id: string): Promise<ApiResponse<{ news: NewsItem }>> => {
    const response = await api.get<ApiResponse<{ news: NewsItem }>>(`/v1/news/${id}`);
    return response.data;
  },

  createNews: async (newsData: FormData): Promise<ApiResponse<{ news: NewsItem }>> => {
    const response = await api.post<ApiResponse<{ news: NewsItem }>>('/news', newsData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  toggleFavorite: async (newsId: string): Promise<ApiResponse<{ news: NewsItem }>> => {
    const response = await api.post<ApiResponse<{ news: NewsItem }>>(`/v1/news/favorite/${newsId}`);
    return response.data;
  }
}; 