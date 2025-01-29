import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NewsState, NewsItem } from '@/types';
import { newsAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState: NewsState = {
  news: [],
  favorites: [],
  isLoading: false,
  error: null,
};

// Haberleri getir
export const fetchNews = createAsyncThunk<NewsItem[]>(
  'news/fetchNews',
  async () => {
    const response = await newsAPI.getAllNews();
    return response.data.news;
  }
);

// Haber oluştur
export const createNews = createAsyncThunk(
  'news/createNews',
  async (newsData: any, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to access this resource');
      }

      const response = await newsAPI.createNews(newsData);
      return response.data.news;
    } catch (error: any) {
      console.error('Create News Error:', error);
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create news'
      );
    }
  }
);

// Haberi beğen
export const toggleLike = createAsyncThunk<NewsItem, string>(
  'news/toggleLike',
  async (newsId) => {
    const response = await newsAPI.likeNews(newsId);
    return response.data.news;
  }
);

// Tüm haberleri getir
export const getAllNews = createAsyncThunk<NewsItem[]>(
  'news/getAllNews',
  async () => {
    const response = await newsAPI.getAllNews();
    return response.data.news;
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNews: (state, action: PayloadAction<NewsItem[]>) => {
      state.news = action.payload;
    },
    addNews: (state, action: PayloadAction<NewsItem>) => {
      state.news.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
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
        state.error = action.error.message || 'Bir hata oluştu';
      })
      .addCase(createNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news.unshift(action.payload);
        state.error = null;
      })
      .addCase(createNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Haber oluşturulamadı';
      })
      .addCase(getAllNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news = action.payload;
      })
      .addCase(getAllNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || null;
      });
  }
});

export const { setNews, addNews, setLoading, setError } = newsSlice.actions;
export default newsSlice.reducer; 