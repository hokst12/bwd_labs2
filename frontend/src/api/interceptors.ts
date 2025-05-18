import axios from 'axios';
import { authService } from './auth';

axios.interceptors.request.use((config) => {
  const token = authService.getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  },
);
