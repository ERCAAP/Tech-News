import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { NewsState } from '../../types';
import axios from '@/api/axios';

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
    const response = await axios.get('/news');
    return response.data.data.news;
  }
);

export const viewNews = createAsyncThunk(
  'news/view',
  async (newsId: string) => {
    try {
      const response = await axios.post(`/news/${newsId}/view`);
      return response.data;
    } catch (error) {
      console.error('View news error:', error);
      throw error;
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'news/toggleFavorite',
  async (newsId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/news/${newsId}/favorite`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Toggle favorite error:', error);
        return rejectWithValue(
          (error as any).response?.data?.message || 'Failed to update favorite status'
        );
      }
      return rejectWithValue('Failed to update favorite status');
    }
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

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || null;
      })
      .addCase(viewNews.fulfilled, (state, action) => {
        const updatedNews = state.news.map(item => 
          item._id === action.payload.newsId 
            ? { 
                ...item, 
                views: {
                  total: action.payload.views.total,
                  unique: action.payload.views.unique
                }
              }
            : item
        );
        state.news = updatedNews;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const updatedNews = state.news.map(item => 
          item._id === action.payload.newsId 
            ? { 
                ...item, 
                favorites: action.payload.favorites
              }
            : item
        );
        state.news = updatedNews;
      })
      .addCase(fetchUserFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      });
  }
});

export default newsSlice.reducer; 