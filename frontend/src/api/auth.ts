import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


interface User {
  id: number; // Добавляем id в интерфейс User
  name: string;
  email: string;
}

interface RegisterResponse {
  message: string;
  id: number;
  name: string;
  email: string;
}

interface LoginResponse {
  token: string;
  user: User; // Теперь user включает id
}

export const authService = {
  async register(
    email: string,
    name: string,
    password: string,
  ): Promise<RegisterResponse> {
    const response = await axios.post<RegisterResponse>(
      `${API_URL}/auth/register`,
      { email, name, password },
    );
    return response.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
    throw new Error('Ошибка авторизации');
  },

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },


  getCurrentUser(): User | null {

    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  isAuthenticated(): boolean {

    return !!this.getAuthToken();
  },
};
