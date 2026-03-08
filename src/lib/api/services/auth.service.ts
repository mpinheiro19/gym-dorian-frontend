import apiClient from '../client';
import type { components } from '@/types/api';
import Cookies from 'js-cookie';

type UserCreate = components['schemas']['UserCreate'];
type User = components['schemas']['UserResponse'];
type Token = components['schemas']['Token'];

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

export const authService = {
  /**
   * Register a new user account
   */
  async register(data: RegisterData): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Login with email and password (OAuth2 password flow)
   * Returns JWT access token
   */
  async login(credentials: LoginCredentials): Promise<Token> {
    // OAuth2 password flow requires form-urlencoded format
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await apiClient.post<Token>('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // Store token in localStorage and cookies
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.data.access_token);
      Cookies.set('access_token', response.data.access_token, {
        expires: 1, // 1 day
        sameSite: 'lax',
      });
    }

    return response.data;
  },

  /**
   * Validate current JWT token
   */
  async validateToken(): Promise<{ valid: boolean; message: string }> {
    const response = await apiClient.post<{ valid: boolean; message: string }>(
      '/auth/validate'
    );
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },

  /**
   * Logout - clear token from storage
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      Cookies.remove('access_token');
      window.location.href = '/login';
    }
  },
};
