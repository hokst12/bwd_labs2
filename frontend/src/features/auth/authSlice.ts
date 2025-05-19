import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { authService } from '../../api/auth';
import { setError } from '../events/eventsSlice';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthError {
  message: string;
  statusCode?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: AuthError | null;
  message: string | null;
}

const initialState: AuthState = {
  user: authService.getCurrentUser(),
  token: authService.getAuthToken(),
  loading: false,
  error: null,
  message: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (
    {
      email,
      name,
      password,
    }: { email: string; name: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.register(email, name, password);
      return {
        id: response.id,
        name: response.name,
        email: response.email,
      };
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Ошибка регистрации',
        statusCode: error.response?.status || 500,
      });
    }
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Ошибка авторизации',
        statusCode: error.response?.status || 500,
      });
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    
    clearMessage(state) {
      state.message = null;
    },
    setMessage(state, action: PayloadAction<string>) {
      state.message = action.payload;
    },
    SetError(
      state,
      action: PayloadAction<{ message: string; statusCode?: number }>,
    ) {
      state.error = action.payload as AuthError
      state.message = action.payload.message;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AuthError;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, clearMessage, setMessage,SetError } = authSlice.actions;
export default authSlice.reducer;
