import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, authAPI } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface AuthState {
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    token: string;
    favoriteNews?: string[];
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null
};

const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.status === 'success') {
        const userData = {
          ...response.data.data.user,
          token: response.data.token
        };
        
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('User data saved to storage:', userData);
        
        return userData;
      }
      
      throw new Error('Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

const restoreUserSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        console.log('Restored user session:', userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Session restore error:', error);
      return rejectWithValue('Failed to restore session');
    }
  }
);

interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { user: any; token: string }, { rejectWithValue }) => {
    try {
      // Token'ı kaydet
      await AsyncStorage.setItem('token', userData.token);
      // User bilgisini kaydet
      await AsyncStorage.setItem('user', JSON.stringify(userData.user));
      
      return userData;
    } catch (error: any) {
      console.error('Register error:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        'Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      AsyncStorage.removeItem('user');
      state.user = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(restoreUserSession.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

const { logout } = authSlice.actions;

export {
  login,
  restoreUserSession,
  logout
};

export default authSlice.reducer; 