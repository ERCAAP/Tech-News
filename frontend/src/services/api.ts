import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NewsItem } from '@/types';

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
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    return Promise.reject(error);
  }
});

export const authAPI = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/v1/auth/login', { email, password });
    return response.data;
  },
  
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.post<ApiResponse<{ user: User }>>('/v1/auth/register', userData);
    return response.data;
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