import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import { eventsService } from '../../api/events';

interface Participant {
  id: number;
  name: string;
  email: string;
}

export interface Event {
  id: number;
  title: string;
  description: string | null;
  date: string;
  createdBy: number;
  deletedAt: string | null;
  participantsCount: number;
  isSubscribed?: boolean;
  subscribers?: number[]; // Массив ID подписчиков
  participants?: Participant[]; // Полная информация о подписчиках
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

// Состояние хранилища
interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  loading: boolean;
  error: string | null;
  errorStatusCode?: number;
  showDeleted: boolean;
  participants: Participant[];
  participantsLoading: boolean;
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  loading: false,
  error: null,
  errorStatusCode: undefined,
  showDeleted: false,
  participants: [],
  participantsLoading: false,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (showDeleted: boolean, { rejectWithValue }) => {
    try {
      return await eventsService.getEvents(showDeleted);
    } catch (error: any) {
      let errorMessage = error.message;
      let statusCode;

      if (error.response) {
        statusCode = error.response.status;
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.code === 'ERR_NETWORK') {
        statusCode = 503;
        errorMessage =
          'Сервер недоступен. Пожалуйста, проверьте подключение к интернету.';
      }

      return rejectWithValue({
        message: errorMessage,
        statusCode,
      });
    }
  },
);

export const subscribeToEvent = createAsyncThunk(
  'events/subscribeToEvent',
  async (
    { eventId, userId }: { eventId: number; userId: number },
    { rejectWithValue },
  ) => {
    try {
      return await eventsService.subscribeToEvent(eventId, userId);
    } catch (error: any) {
      let errorMessage = error.message;
      let statusCode;

      if (error.response) {
        statusCode = error.response.status;
        errorMessage = 'ошибка подписки, вы уже подписаны';
      } else if (error.code === 'ERR_NETWORK') {
        statusCode = 503;
        errorMessage =
          'Сервер недоступен. Пожалуйста, проверьте подключение к интернету.';
      }

      return rejectWithValue({
        message: errorMessage,
        statusCode,
      });
    }
  },
);

export const unsubscribeFromEvent = createAsyncThunk(
  'events/unsubscribeFromEvent',
  async (
    { eventId, userId }: { eventId: number; userId: number },
    { rejectWithValue },
  ) => {
    try {
      return await eventsService.unsubscribeFromEvent(eventId, userId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message,
        statusCode: error.response?.status,
      });
    }
  },
);

export const fetchEventParticipants = createAsyncThunk(
  'events/fetchEventParticipants',
  async (eventId: number, { rejectWithValue }) => {
    try {
      return await eventsService.getEventParticipants(eventId);
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || error.message,
        statusCode: error.response?.status,
      });
    }
  },
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await eventsService.getEvent(id);
    } catch (error: any) {
      let errorMessage = error.message;
      let statusCode;

      if (error.response) {
        statusCode = error.response.status;
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.code === 'ERR_NETWORK') {
        statusCode = 503;
        errorMessage =
          'Сервер недоступен. Пожалуйста, проверьте подключение к интернету.';
      }

      return rejectWithValue({
        message: errorMessage,
        statusCode,
      });
    }
  },
);

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (
    eventData: { title: string; description?: string; date: string },
    { rejectWithValue },
  ) => {
    try {
      return await eventsService.createEvent(eventData);
    } catch (error: any) {
      let errorMessage = error.message;
      let statusCode;

      if (error.response) {
        statusCode = error.response.status;
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.code === 'ERR_NETWORK') {
        statusCode = 503;
        errorMessage =
          'Сервер недоступен. Пожалуйста, проверьте подключение к интернету.';
      }

      return rejectWithValue({
        message: errorMessage,
        statusCode,
      });
    }
  },
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async (
    {
      id,
      eventData,
    }: {
      id: number;
      eventData: { title?: string; description?: string; date?: string };
    },
    { rejectWithValue },
  ) => {
    try {
      return await eventsService.updateEvent(id, eventData);
    } catch (error: any) {
      let errorMessage = error.message;
      let statusCode;

      if (error.response) {
        statusCode = error.response.status;
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.code === 'ERR_NETWORK') {
        statusCode = 503;
        errorMessage =
          'Сервер недоступен. Пожалуйста, проверьте подключение к интернету.';
      }

      return rejectWithValue({
        message: errorMessage,
        statusCode,
      });
    }
  },
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (id: number, { rejectWithValue }) => {
    try {
      await eventsService.deleteEvent(id);
      return id;
    } catch (error: any) {
      let errorMessage = error.message;
      let statusCode;

      if (error.response) {
        statusCode = error.response.status;
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.code === 'ERR_NETWORK') {
        statusCode = 503;
        errorMessage =
          'Сервер недоступен. Пожалуйста, проверьте подключение к интернету.';
      }

      return rejectWithValue({
        message: errorMessage,
        statusCode,
      });
    }
  },
);

export const restoreEvent = createAsyncThunk(
  'events/restoreEvent',
  async (id: number, { rejectWithValue }) => {
    try {
      await eventsService.restoreEvent(id);
      return id;
    } catch (error: any) {
      let errorMessage = error.message;
      let statusCode;

      if (error.response) {
        statusCode = error.response.status;
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.code === 'ERR_NETWORK') {
        statusCode = 503;
        errorMessage =
          'Сервер недоступен. Пожалуйста, проверьте подключение к интернету.';
      }

      return rejectWithValue({
        message: errorMessage,
        statusCode,
      });
    }
  },
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    toggleShowDeleted(state) {
      state.showDeleted = !state.showDeleted;
    },
    clearError(state) {
      state.error = null;
      state.errorStatusCode = undefined;
    },
    setError(
      state,
      action: PayloadAction<{ message: string; statusCode?: number }>,
    ) {
      state.error = action.payload.message;
      state.errorStatusCode = action.payload.statusCode;
    },
    clearParticipants(state) {
      state.participants = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorStatusCode = undefined;
      })
      .addCase(subscribeToEvent.fulfilled, (state, action) => {
        const { eventId, participantsCount, subscribers, isSubscribed } = action.payload;
        const event = state.events.find((e) => e.id === eventId);
        if (event) {
          event.participantsCount = participantsCount;
          event.subscribers = subscribers;
          event.isSubscribed = isSubscribed;
        }
        if (state.currentEvent && state.currentEvent.id === eventId) {
          state.currentEvent.participantsCount = participantsCount;
          state.currentEvent.subscribers = subscribers;
          state.currentEvent.isSubscribed = isSubscribed;
        }
      })
      .addCase(unsubscribeFromEvent.fulfilled, (state, action) => {
        const { eventId, participantsCount, subscribers, isSubscribed } = action.payload;
        const event = state.events.find((e) => e.id === eventId);
        if (event) {
          event.participantsCount = participantsCount;
          event.subscribers = subscribers;
          event.isSubscribed = isSubscribed;
        }
        if (state.currentEvent && state.currentEvent.id === eventId) {
          state.currentEvent.participantsCount = participantsCount;
          state.currentEvent.subscribers = subscribers;
          state.currentEvent.isSubscribed = isSubscribed;
        }
      })
      .addCase(subscribeToEvent.rejected, (state, action) => {
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      })
      .addCase(unsubscribeFromEvent.rejected, (state, action) => {
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      })
      .addCase(fetchEventParticipants.pending, (state) => {
        state.participantsLoading = true;
      })
      .addCase(fetchEventParticipants.fulfilled, (state, action) => {
        state.participantsLoading = false;
        state.participants = action.payload.participants;
      })
      .addCase(fetchEventParticipants.rejected, (state, action) => {
        state.participantsLoading = false;
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload.map((event: { subscribers: string | any[]; }) => ({
          ...event,
          participantsCount: event.subscribers?.length || 0,
          subscribers: event.subscribers || []
        }));
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      })
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorStatusCode = undefined;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      })
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorStatusCode = undefined;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.unshift(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      })
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorStatusCode = undefined;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorStatusCode = undefined;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex((e) => e.id === action.payload);
        if (index !== -1) {
          state.events[index].deletedAt = new Date().toISOString();
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      })
      .addCase(restoreEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.errorStatusCode = undefined;
      })
      .addCase(restoreEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.events.findIndex((e) => e.id === action.payload);
        if (index !== -1) {
          state.events[index].deletedAt = null;
        }
      })
      .addCase(restoreEvent.rejected, (state, action) => {
        state.loading = false;
        const payload = action.payload as {
          message: string;
          statusCode?: number;
        };
        state.error = payload.message;
        state.errorStatusCode = payload.statusCode;
      });
  },
});

export const { toggleShowDeleted, clearError, setError, clearParticipants } =
  eventsSlice.actions;
export default eventsSlice.reducer;
