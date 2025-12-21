import apiClient from '../client';
import type { components } from '@/types/api';

type User = components['schemas']['User'];
type UserSettings = components['schemas']['UserSettings'];
type UserGoal = components['schemas']['UserGoal'];

export interface UpdateProfileData {
  email?: string;
  full_name?: string;
  password?: string;
}

export interface UpdateSettingsData {
  weight_unit?: 'kg' | 'lbs';
  distance_unit?: 'km' | 'miles';
  default_rest_time?: number;
  private_profile?: boolean;
  email_notifications?: boolean;
}

export const userService = {
  /**
   * Get current user profile with settings and goals
   */
  async getProfile() {
    const response = await apiClient.get('/users/me/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response = await apiClient.put<User>('/users/me', data);
    return response.data;
  },

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    const response = await apiClient.get<UserSettings>('/users/me/settings');
    return response.data;
  },

  /**
   * Update user settings
   */
  async updateSettings(data: UpdateSettingsData): Promise<UserSettings> {
    const response = await apiClient.put<UserSettings>('/users/me/settings', data);
    return response.data;
  },

  /**
   * List all user goals
   */
  async listGoals() {
    const response = await apiClient.get('/users/me/goals');
    return response.data;
  },

  /**
   * Create new goal
   */
  async createGoal(data: Partial<UserGoal>): Promise<UserGoal> {
    const response = await apiClient.post<UserGoal>('/users/me/goals', data);
    return response.data;
  },

  /**
   * Get specific goal
   */
  async getGoal(goalId: number): Promise<UserGoal> {
    const response = await apiClient.get<UserGoal>(`/users/me/goals/${goalId}`);
    return response.data;
  },

  /**
   * Update goal
   */
  async updateGoal(goalId: number, data: Partial<UserGoal>): Promise<UserGoal> {
    const response = await apiClient.put<UserGoal>(
      `/users/me/goals/${goalId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete goal
   */
  async deleteGoal(goalId: number): Promise<void> {
    await apiClient.delete(`/users/me/goals/${goalId}`);
  },
};
