import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '@/services/api';
import { AuthState, User } from '@/types';

interface AuthResponse {
  status: string;
  data: {
    user: User;
  };
  token: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null
};

export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string }
>('auth/login', async (credentials) => {
  const response = await authAPI.login(credentials.email, credentials.password);
  return {
    status: response.status,
    data: response.data,
    token: response.token!
  };
});

export const register = createAsyncThunk<
  AuthResponse,
  {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }
>('auth/register', async (userData) => {
  const response = await authAPI.register(userData);
  return {
    status: response.status,
    data: response.data,
    token: response.token!
  };
});

export const getMe = createAsyncThunk<AuthResponse>('auth/getMe', async () => {
  const response = await authAPI.getMe();
  return {
    status: response.status,
    data: response.data,
    token: ''  // getMe endpoint'i token döndürmez
  };
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.data.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Login failed';
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.data.user;
      state.token = action.payload.token;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Registration failed';
    });

    // Get Me
    builder.addCase(getMe.fulfilled, (state, action) => {
      state.user = action.payload.data.user;
    });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer; 