import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NewsState, NewsItem } from '@/types';
import { newsAPI } from '@/services/api';

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
export const createNews = createAsyncThunk<NewsItem, FormData>(
  'news/createNews',
  async (formData) => {
    const response = await newsAPI.createNews(formData);
    return response.data.news;
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