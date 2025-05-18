// src/features/user/userSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { usersApi } from '../../api/users';
import type { Event, UserInfo, ApiError } from '../../api/types';

interface UserState {
  info: UserInfo | null;
  events: Event[];
  loading: boolean;
  error: ApiError | null;
}

const initialState: UserState = {
  info: null,
  events: [],
  loading: false,
  error: null,
};

export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async (userId: number, { rejectWithValue }) => {
    try {
      return await usersApi.getUserInfo(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message,
        statusCode: error.response?.status,
      });
    }
  },
);

export const fetchUserEvents = createAsyncThunk(
  'user/fetchUserEvents',
  async (userId: number, { rejectWithValue }) => {
    try {
      return await usersApi.getUserEvents(userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message,
        statusCode: error.response?.status,
      });
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.info = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message:
            (action.payload as any)?.message ||
            'Ошибка загрузки данных пользователя',
          statusCode: (action.payload as any)?.statusCode,
        };
      })
      .addCase(fetchUserEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = {
          message:
            (action.payload as any)?.message || 'Ошибка загрузки мероприятий',
          statusCode: (action.payload as any)?.statusCode,
        };
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
