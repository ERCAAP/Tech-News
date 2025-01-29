import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NewsItem } from '@/types';

// API URL'ini .env'den al
const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ApiResponse<T> {
  status: string;
  data: T;
  token?: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token interceptor
api.interceptors.request.use(
  (config) => {
    const token = AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hata yakalama interceptor'ı ekleyelim
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/v1/auth/login', { email, password });
    if (response.data.token) {
      AsyncStorage.setItem('token', response.data.token);
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
      const response = await api.post<ApiResponse<{ user: User }>>('/auth/register', userData);
      if (response.data.token) {
        AsyncStorage.setItem('token', response.data.token);
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
    AsyncStorage.removeItem('token');
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
    const response = await api.post<ApiResponse<{ news: NewsItem }>>('/v1/news', newsData, {
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