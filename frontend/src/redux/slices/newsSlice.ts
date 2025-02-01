import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NewsState, NewsItem } from '@/types';
import api from '@/api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NewsState {
  news: NewsItem[];
  favorites: NewsItem[];
  isLoading: boolean;
  error: string | null;
  stats: {
    views: {
      total: number;
      unique: number;
    };
    favorites: number;
  } | null;
}

const initialState: NewsState = {
  news: [],
  favorites: [],
  isLoading: false,
  error: null,
  stats: null
};

// Tüm haberleri getir
export const fetchNews = createAsyncThunk(
  'news/fetchNews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/news');
      console.log('Fetched news:', response.data); // Debug için
      return response.data.data.news;
    } catch (error: any) {
      console.error('Error fetching news:', error); // Debug için
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch news');
    }
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

      const response = await api.post('/news', newsData);
      return response.data.data.news;
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
    const response = await api.post('/news/like', { newsId });
    return response.data.data.news;
  }
);

// Tüm haberleri getir
export const getAllNews = createAsyncThunk<NewsItem[]>(
  'news/getAllNews',
  async () => {
    const response = await api.get('/news');
    return response.data.data.news;
  }
);

export const viewNews = createAsyncThunk(
  'news/view',
  async (newsId: string) => {
    const response = await api.post(`/news/${newsId}/view`);
    return response.data;
  }
);

export const toggleFavorite = createAsyncThunk(
  'news/toggleFavorite',
  async (newsId: string) => {
    const response = await api.post(`/news/${newsId}/favorite`);
    return response.data;
  }
);

export const getNewsStats = createAsyncThunk(
  'news/getStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/news/stats', {
      params: { startDate, endDate }
    });
    return response.data;
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
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
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
      })
      .addCase(viewNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(viewNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(viewNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Haber görüntüleme hatası';
      })
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Favorilere ekleme hatası';
      })
      .addCase(getNewsStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNewsStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getNewsStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'İstatistikleri getirme hatası';
      });
  }
});

export const { setNews, addNews, setLoading, setError } = newsSlice.actions;
export default newsSlice.reducer; 