import axios from 'axios';
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
  async (config) => {
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
  },

  getStats: async () => {
    try {
      const response = await api.get<ApiResponse<{
        totalViews: number;
        totalFavorites: number;
        totalNews: number;
      }>>('/news/stats');
      return response.data;
    } catch (error) {
      console.error('Get Stats Error:', error);
      throw error;
    }
  },

  addToFavorites: async (newsId: string) => {
    try {
      const response = await api.post(`/news/${newsId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Add to Favorites Error:', error);
      throw error;
    }
  },

  removeFromFavorites: async (newsId: string) => {
    try {
      const response = await api.delete(`/news/${newsId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Remove from Favorites Error:', error);
      throw error;
    }
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
  },

  updateProfile: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
  }) => {
    try {
      console.log('Update Profile Request:', {
        url: `${BASE_URL}/auth/profile`,
        data: userData,
        headers: api.defaults.headers
      });

      const response = await api.patch('/auth/profile', userData);
      console.log('Update Profile Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update Profile Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.config?.headers
      });
      throw error;
    }
  },

  getFavoriteNews: async () => {
    try {
      const response = await api.get('/auth/favorites');
      return response.data;
    } catch (error) {
      console.error('Get Favorite News Error:', error);
      throw error;
    }
  }
}; 