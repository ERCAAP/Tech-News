import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NewsItem } from '@/types';

const BASE_URL = 'http://10.0.2.2:3000/api/v1'; // Android Emulator için

console.log('API_URL:', BASE_URL); // Debug için

interface ApiResponse<T> {
  status: string;
  data: T;
  token?: string;
}

interface RequestConfig {
  headers?: Record<string, string>;
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tek bir newsAPI tanımı
export const newsAPI = {
  getAllNews: async (): Promise<ApiResponse<{ news: NewsItem[] }>> => {
    const response = await api.get<ApiResponse<{ news: NewsItem[] }>>('/news');
    return response.data;
  },

  getNewsById: async (id: string): Promise<ApiResponse<{ news: NewsItem }>> => {
    const response = await api.get<ApiResponse<{ news: NewsItem }>>(`/news/${id}`);
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

  updateNews: async (id: string, data: FormData): Promise<ApiResponse<{ news: NewsItem }>> => {
    const response = await api.put<ApiResponse<{ news: NewsItem }>>(`/news/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteNews: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/news/${id}`);
    return response.data;
  },

  likeNews: async (id: string): Promise<ApiResponse<{ news: NewsItem }>> => {
    const response = await api.post<ApiResponse<{ news: NewsItem }>>(`/news/${id}/like`);
    return response.data;
  },

  unlikeNews: async (id: string): Promise<ApiResponse<{ news: NewsItem }>> => {
    const response = await api.delete<ApiResponse<{ news: NewsItem }>>(`/news/${id}/like`);
    return response.data;
  }
};

// Auth API endpoints
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

// Auth interceptor
api.interceptors.request.use(
  (config) => {
    const token = AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
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