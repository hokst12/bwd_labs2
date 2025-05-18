// src/api/users.ts
import axios from 'axios';
import type { Event, UserInfo } from './types';

const userInfoCache = new Map<number, string>();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const usersApi = {
  getUserInfo: async (userId: number): Promise<UserInfo> => {
    const response = await axios.get(`${API_URL}/users/info/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return response.data;
  },

  getUserEvents: async (userId: number): Promise<Event[]> => {
    const response = await axios.get(
      `${API_URL}/users/${userId}/created-events`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      },
    );
    return response.data;
  },
  getCachedUserInfo: async (userId: number): Promise<string> => {
    if (userInfoCache.has(userId)) {
      return userInfoCache.get(userId)!;
    }

    try {
      const user = await usersApi.getUserInfo(userId);
      userInfoCache.set(userId, user.name);
      return user.name;
    } catch {
      return 'Неизвестен';
    }
  },
};
