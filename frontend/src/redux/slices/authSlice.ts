import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/services/api';
import { AuthState, User } from '@/types';

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
export const login = createAsyncThunk<ApiResponse, { email: string; password: string }>(
  'auth/login',
  async (credentials) => {
    const response = await authAPI.login(credentials.email, credentials.password);
    if (!response.token) {
      throw new Error('Token not found in response');
    }
    return {
      status: response.status,
      data: response.data,
      token: response.token
    };
  }
);

// Register thunk
export const register = createAsyncThunk<
  ApiResponse,
  { email: string; password: string; firstName: string; lastName: string }
>(
  'auth/register',
  async (userData) => {
    const response = await authAPI.register(userData);
    if (!response.token) {
      throw new Error('Token not found in response');
    }
    return {
      status: response.status,
      data: response.data,
      token: response.token
    };
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

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      authAPI.logout();
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
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
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
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
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
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 