import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, NewsItem } from '@/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api/v1';

console.log('API_URL:', BASE_URL);

interface ApiResponse<T> {
  status: string;
  data: T;
  token?: string;
}

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Data yapısını kontrol et
    if (config.data && typeof config.data === 'object') {
      console.log('Request Data Before:', config.data);
      // Eğer data içinde data varsa, düzelt
      if (config.data.data) {
        config.data = config.data.data;
      }
      console.log('Request Data After:', config.data);
    }
    
    // Token ekle
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
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
      const response = await api.post<ApiResponse<{ favoriteCount: number, isFavorited: boolean }>>(`/news/${newsId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Add to Favorites Error:', error);
      throw error;
    }
  },

  removeFromFavorites: async (newsId: string) => {
    try {
      const response = await api.delete<ApiResponse<{ favoriteCount: number, isFavorited: boolean }>>(`/news/${newsId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Remove from Favorites Error:', error);
      throw error;
    }
  },

  incrementViews: async (newsId: string) => {
    try {
      const response = await api.post<ApiResponse<{ views: number }>>(`/news/${newsId}/view`);
      return response.data;
    } catch (error) {
      console.error('Increment Views Error:', error);
      throw error;
    }
  }
};

// Auth API endpoints
export const authAPI = {
  async login(email: string, password: string) {
    try {
      console.log('Login Request Payload:', { email, password });
      
      // İstek öncesi veri kontrolü
      if (!email || !password) {
        throw new Error('Email ve şifre gereklidir');
      }

      const response = await api.post<ApiResponse<{ user: User }>>('/auth/login', {
        email: email.trim(),
        password: password.trim()
      });
      
      console.log('Login Response:', response.data);

      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        data: error.config?.data
      });
      throw error.response?.data || error;
    }
  },
  
  setAuthToken(token: string) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => {
    try {
      // Sadece değişen alanları gönder
      const updateData: Record<string, string> = {};
      if (userData.firstName) updateData.firstName = userData.firstName;
      if (userData.lastName) updateData.lastName = userData.lastName;
      if (userData.email) updateData.email = userData.email;

      console.log('Update Profile Request:', {
        url: `${BASE_URL}/auth/profile`,
        data: updateData
      });

      const response = await api.patch<ApiResponse<{ user: User }>>('/auth/profile', updateData);
      console.log('Update Profile Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Update Profile Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error.response?.data || error;
    }
  },

  getFavoriteNews: async () => {
    try {
      const response = await api.get<ApiResponse<{ favoriteNews: NewsItem[] }>>('/auth/favorites');
      return response.data;
    } catch (error) {
      console.error('Get Favorite News Error:', error);
      throw error;
    }
  }
}; 