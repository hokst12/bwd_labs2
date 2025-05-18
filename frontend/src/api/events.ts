import axios from 'axios';
import { authService } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const eventsService = {
  async getEvents(showDeleted: boolean = false) {
    const endpoint = showDeleted ? '/events/all' : '/events';
    const response = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    });
    return response.data;
  },

  async subscribeToEvent(eventId: number, userId: number) {
    const response = await axios.post(
      `${API_URL}/events/${eventId}/subscribe`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${authService.getAuthToken()}`,
        },
      },
    );
    return {
      ...response.data,
      isSubscribed: true,
    };
  },

  async unsubscribeFromEvent(eventId: number, userId: number) {
    const response = await axios.post(
      `${API_URL}/events/${eventId}/unsubscribe`,
      { userId },
      {
        headers: {
          Authorization: `Bearer ${authService.getAuthToken()}`,
        },
      },
    );
    return {
      ...response.data,
      isSubscribed: false,
    };
  },

  async getEventParticipants(eventId: number) {
    const response = await axios.get(
      `${API_URL}/events/${eventId}/participants`,
      {
        headers: {
          Authorization: `Bearer ${authService.getAuthToken()}`,
        },
      },
    );
    return response.data;
  },

  async getEvent(id: number) {
    const response = await axios.get(`${API_URL}/events/${id}`, {
      headers: {
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    });
    return response.data;
  },

  async createEvent(eventData: {
    title: string;
    description?: string;
    date: string;
  }) {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Пользователь не авторизован');

    const response = await axios.post(
      `${API_URL}/events`,
      {
        ...eventData,
        createdBy: user.id,
      },
      {
        headers: {
          Authorization: `Bearer ${authService.getAuthToken()}`,
        },
      },
    );
    return response.data;
  },

  async updateEvent(
    id: number,
    eventData: {
      title?: string;
      description?: string;
      date?: string;
    },
  ) {
    const response = await axios.put(`${API_URL}/events/${id}`, eventData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    });
    return response.data;
  },

  async deleteEvent(id: number) {
    const response = await axios.delete(`${API_URL}/events/${id}`, {
      headers: {
        Authorization: `Bearer ${authService.getAuthToken()}`,
      },
    });
    return response.data;
  },

  async restoreEvent(id: number) {
    const response = await axios.post(
      `${API_URL}/events/${id}/restore`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authService.getAuthToken()}`,
        },
      },
    );
    return response.data;
  },
};
