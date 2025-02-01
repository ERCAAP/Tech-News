import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/services/api';
import { AuthState, User } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Response tipi
interface ApiResponse {
  status: string;
  data: {
    user: User;
  };
  token: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null
};

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    try {
      // Önce credentials'ı kontrol edelim
      if (!credentials.email || !credentials.password) {
        throw new Error('Email ve şifre gereklidir');
      }

      // API isteğini yapalım
      const response = await authAPI.login(credentials.email, credentials.password);
      
      // Token kontrolü
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        // API için Authorization header'ını ayarlayalım
        authAPI.setAuthToken(response.token);
      }

      return response;
    } catch (error: any) {
      console.error('Login Error:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Giriş yapılamadı' };
    }
  }
);

// Register thunk
export const register = createAsyncThunk(
  'auth/register',
  async (userData: { email: string; password: string; firstName: string; lastName: string }) => {
    try {
      const response = await authAPI.register(userData);
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
      }
      return response;
    } catch (error: any) {
      throw error.response?.data || { message: 'Kayıt işlemi başarısız' };
    }
  }
);

// Get me thunk
export const getMe = createAsyncThunk<ApiResponse>(
  'auth/getMe',
  async () => {
    const response = await authAPI.getMe();
    return {
      status: response.status,
      data: response.data,
      token: response.token || '' // getMe endpoint token döndürmeyebilir
    };
  }
);

// Update user profile thunk
export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: User, { rejectWithValue }) => {
    try {
      console.log('UpdateUserProfile Thunk - Input:', userData);
      
      const response = await authAPI.updateProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      });
      
      console.log('UpdateUserProfile Thunk - Success:', response);
      return response;
    } catch (error: any) {
      console.error('UpdateUserProfile Thunk - Error:', {
        message: error.message,
        response: error.response?.data
      });
      
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      AsyncStorage.removeItem('token');
    },
    setToken: (state, action) => {
      state.token = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.token || null; // Burada null ile fallback
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || null;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.token || null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || null;
      });

    // Get Me
    builder
      .addCase(getMe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        // getMe'de token güncellemeye gerek yok
      })
      .addCase(getMe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user data';
      });

    // Update Profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        console.log('UpdateUserProfile - Pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        console.log('UpdateUserProfile - Fulfilled:', action.payload);
        state.isLoading = false;
        state.user = action.payload.data.user;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        console.log('UpdateUserProfile - Rejected:', action.payload);
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to update profile';
      });
  }
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer; 