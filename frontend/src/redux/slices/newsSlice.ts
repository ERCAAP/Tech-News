import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NewsState, NewsItem } from '@/types';
import { newsAPI } from '@/services/api';

interface NewsResponse {
  status: string;
  data: {
    news: NewsItem[] | NewsItem;
  };
}

const initialState: NewsState = {
  news: [],
  favorites: [],
  isLoading: false,
  error: null,
};

export const fetchNews = createAsyncThunk<NewsResponse>(
  'news/fetchNews',
  async () => {
    const response = await newsAPI.getAllNews();
    return {
      status: response.status,
      data: { news: response.data.news }
    };
  }
);

export const createNews = createAsyncThunk<NewsResponse, FormData>(
  'news/createNews',
  async (newsData) => {
    const response = await newsAPI.createNews(newsData);
    return {
      status: response.status,
      data: { news: response.data.news }
    };
  }
);

export const toggleFavorite = createAsyncThunk<NewsResponse, string>(
  'news/toggleFavorite',
  async (newsId) => {
    const response = await newsAPI.toggleFavorite(newsId);
    return {
      status: response.status,
      data: { news: response.data.news }
    };
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
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news = action.payload.data.news as NewsItem[];
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || null;
      });
  }
});

export const { setNews, addNews, setLoading, setError } = newsSlice.actions;
export default newsSlice.reducer; 