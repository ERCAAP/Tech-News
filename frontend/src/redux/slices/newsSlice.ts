import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NewsState, NewsItem } from '@/types';

const initialState: NewsState = {
  news: [],
  favorites: [],
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
    addNews: (state, action: PayloadAction<NewsItem>) => {
      state.news.unshift(action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const newsItem = state.news.find(item => item.id === action.payload);
      if (newsItem) {
        newsItem.isFavorited = !newsItem.isFavorited;
        if (newsItem.isFavorited) {
          state.favorites.push(newsItem);
        } else {
          state.favorites = state.favorites.filter(item => item.id !== action.payload);
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setNews, addNews, toggleFavorite, setLoading, setError } = newsSlice.actions;
export default newsSlice.reducer; 