import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NewsState } from '../../types';
import axios, { AxiosError } from 'axios';
import axiosInstance from '@/api/axios';
import { API_URL } from '@/utils/api';
import { api } from '@/services/api';
import * as Notifications from 'expo-notifications';
import OneSignal from 'react-native-onesignal';
import { NewsItem } from '@/types';

const initialState: NewsState = {
  news: [],
  favorites: [],
  isLoading: false,
  error: null,
  stats: null
};

export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async () => {
    const response = await api.get('/news');
    return response.data.data.news;
  }
);

export const viewNews = createAsyncThunk(
  'news/view',
  async (newsId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/news/${newsId}/view`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update view count');
      }
      return rejectWithValue('Failed to update view count');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'news/toggleFavorite',
  async ({ newsId, token }: { newsId: string; token: string }) => {
    const response = await fetch(`${API_URL}/api/v1/news/${newsId}/favorite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle favorite');
    }
    
    const data = await response.json();
    return { newsId, isFavorited: data.data.isFavorited };
  }
);

export const fetchUserFavorites = createAsyncThunk(
  'news/fetchUserFavorites',
  async () => {
    const response = await axios.get('/user/favorites');
    return response.data.favorites;
  }
);

export const getNewsStats = createAsyncThunk(
  'news/getStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    const response = await axios.get('/news/stats', {
      params: { startDate, endDate }
    });
    return response.data;
  }
);

export const getSimilarNews = createAsyncThunk(
  'news/getSimilar',
  async (newsId: string) => {
    const response = await axios.get(`/news/${newsId}/similar`);
    return response.data.similar;
  }
);

export const shareNews = createAsyncThunk(
  'news/share',
  async ({ newsId, platform }: { newsId: string; platform: string }) => {
    const response = await axios.post(`/news/${newsId}/share`, { platform });
    return response.data;
  }
);

export const updateReadingProgress = createAsyncThunk(
  'news/updateReadingProgress',
  async ({ newsId, completed }: { newsId: string; completed: boolean }) => {
    const response = await axios.post(`/news/${newsId}/reading-progress`, { completed });
    return response.data;
  }
);

interface UpdateNewsPayload {
  id: string;
  title?: string;
  content?: string;
  category?: string;
  imageUrl?: string;
  notification?: {
    enabled: boolean;
    title: string;
    message: string;
  };
}

export const updateNews = createAsyncThunk(
  'news/updateNews',
  async (payload: UpdateNewsPayload) => {
    const { id, ...updates } = payload;
    const response = await axiosInstance.patch(`/news/${id}`, updates);
    return response.data;
  }
);

export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (newsId: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/news/${newsId}`);
      return newsId;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete news');
      }
      return rejectWithValue('Failed to delete news');
    }
  }
);

export const fetchFavoriteNews = createAsyncThunk(
  'news/fetchFavoriteNews',
  async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/news/user/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorite news');
      }
      
      const data = await response.json();
      return data.data.news;
    } catch (error) {
      console.error('Fetch favorites error:', error);
      throw error;
    }
  }
);

export const getFavoriteNews = createAsyncThunk(
  'news/getFavorites',
  async (token: string) => {
    try {
      const response = await api.get('/news/favorites', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }
);

export const createNews = createAsyncThunk(
  'news/createNews',
  async (newsData: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/news', newsData);

      // Bildirim gönderme
      if (newsData.notification?.enabled) {
        await OneSignal.postNotification({
          contents: { en: newsData.notification.message || newsData.title },
          headings: { en: newsData.notification.title || 'New Article' },
          data: {
            newsId: response.data._id,
            type: 'news'
          },
          included_segments: ['Subscribed Users']
        });
      }

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message || 'Haber oluşturulamadı');
      }
      return rejectWithValue('Haber oluşturulamadı');
    }
  }
);

export const toggleLike = createAsyncThunk(
  'news/toggleLike',
  async ({ newsId, token }: { newsId: string; token: string }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/news/${newsId}/like`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Beğeni işlemi başarısız oldu');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favorites = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news = action.payload;
        state.error = null;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred';
      })
      .addCase(viewNews.fulfilled, (state, action) => {
        const updatedNews = state.news.map(item => 
          item._id === action.payload.newsId 
            ? { 
                ...item, 
                views: action.payload.views
              }
            : item
        );
        state.news = updatedNews;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        if (action.payload.isFavorited) {
          // Haberi favorilere ekle
          const newsToAdd = state.news.find(n => n._id === action.payload.newsId);
          if (newsToAdd) {
            state.favorites.push(newsToAdd);
          }
        } else {
          // Haberi favorilerden çıkar
          state.favorites = state.favorites.filter(
            n => n._id !== action.payload.newsId
          );
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(fetchUserFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      .addCase(updateNews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.news.findIndex((item: any) => item._id === action.payload._id);
        if (index !== -1) {
          state.news[index] = action.payload;
        }
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.news = state.news.filter(item => item._id !== action.payload);
      })
      .addCase(fetchFavoriteNews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFavoriteNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
        state.error = null;
      })
      .addCase(fetchFavoriteNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch favorites';
      })
      .addCase(createNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news.push(action.payload);
        state.error = null;
      })
      .addCase(createNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const index = state.news.findIndex(item => item._id === action.payload.newsId);
        if (index !== -1) {
          state.news[index].likes = action.payload.likes;
        }
      });
  }
});

export const { clearFavorites } = newsSlice.actions;
export default newsSlice.reducer; 