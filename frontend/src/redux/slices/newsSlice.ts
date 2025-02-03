import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NewsItem } from '@/types';
import api from '@/api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiResponse<T> {
  status: string;
  data: {
    news?: T;
    stats?: any;
    views?: number;
  };
  message?: string;
}

interface NewsStats {
  views: {
    total: number;
    unique: number;
  };
  favorites: number;
}

interface NewsState {
  news: NewsItem[];
  favorites: NewsItem[];
  isLoading: boolean;
  error: string | null;
  stats: NewsStats | null;
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
    const response = await api.post<ApiResponse<NewsItem>>(`/news/${newsId}/favorite`);
    return response.data.data;
  }
);

export const getNewsStats = createAsyncThunk(
  'news/getStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string }) => {
    const response = await api.get<ApiResponse<NewsStats>>('/news/stats', {
      params: { startDate, endDate }
    });
    return response.data.data;
  }
);

// deleteNews thunk'ını ekle
export const deleteNews = createAsyncThunk(
  'news/deleteNews',
  async (newsId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<ApiResponse<void>>(`/news/${newsId}`);
      return newsId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete news');
    }
  }
);

// Add getFavoriteNews thunk
export const getFavoriteNews = createAsyncThunk(
  'news/getFavoriteNews',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<NewsItem[]>>('/news/favorites', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.data?.data?.news) {
        throw new Error('Invalid response format');
      }
      return response.data.data.news;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorite news');
    }
  }
);

export const updateNews = createAsyncThunk(
  'news/updateNews',
  async ({ 
    id, 
    title, 
    content, 
    category,
    imageUrl,
    contentImages 
  }: { 
    id: string; 
    title: string; 
    content: string;
    category: string;
    imageUrl?: string;
    contentImages?: string[];
  }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      
      if (imageUrl && imageUrl.startsWith('file://')) {
        const filename = imageUrl.split('/').pop();
        formData.append('coverImage', {
          uri: imageUrl,
          type: 'image/jpeg',
          name: filename || 'cover.jpg',
        } as any);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      if (contentImages?.length) {
        contentImages.forEach((image, index) => {
          if (image.startsWith('file://')) {
            const filename = image.split('/').pop();
            formData.append('contentImages', {
              uri: image,
              type: 'image/jpeg',
              name: filename || `content${index}.jpg`,
            } as any);
          } else {
            formData.append('contentImages[]', image);
          }
        });
      }

      const response = await api.put<ApiResponse<NewsItem>>(`/news/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data?.data?.news) {
        throw new Error('Invalid response format');
      }
      return response.data.data.news;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update news');
    }
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
      .addCase(viewNews.fulfilled, (state) => {
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
      .addCase(toggleFavorite.fulfilled, (state) => {
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
        state.stats = action.payload as NewsStats;
        state.error = null;
      })
      .addCase(getNewsStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'İstatistikleri getirme hatası';
      })
      .addCase(deleteNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.news = state.news.filter(item => item._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Haber silme hatası';
      })
      .addCase(getFavoriteNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFavoriteNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favorites = action.payload;
        state.error = null;
      })
      .addCase(getFavoriteNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateNews.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.news.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.news[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setNews, addNews, setLoading, setError } = newsSlice.actions;
export default newsSlice.reducer;

// newsThunks objesine deleteNews'u ekle
export const newsThunks = {
  fetchNews,
  createNews,
  toggleLike,
  getAllNews,
  viewNews,
  toggleFavorite,
  getNewsStats,
  deleteNews,
  getFavoriteNews,
  updateNews,
}; 