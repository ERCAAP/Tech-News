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
    const response = await axios.post(`/news/${newsId}/view`);
    return response.data;
  }
);

export const toggleFavorite = createAsyncThunk(
  'news/toggleFavorite',
  async (newsId: string) => {
    const response = await axios.post(`/news/${newsId}/favorite`);
    return response.data;
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
      });
  }
});

export default newsSlice.reducer; 