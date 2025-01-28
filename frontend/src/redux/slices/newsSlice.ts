import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NewsState, NewsItem } from '@/types';

const initialState: NewsState = {
  news: [],
  isLoading: false,
  error: null,
};

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNews: (state, action: PayloadAction<NewsItem[]>) => {
      state.news = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setNews, setLoading, setError } = newsSlice.actions;
export default newsSlice.reducer; 