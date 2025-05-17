import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const authService = {
  async register(email: string, name: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      name,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
      }
    } catch (error: any) {
      console.error('Login error:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Ошибка авторизации');
    }
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getAuthToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    return !!this.getAuthToken();
  },
};
