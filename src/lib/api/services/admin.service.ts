import apiClient from '../client';

export interface AdminUserFilters {
  skip?: number;
  limit?: number;
  is_active?: boolean;
  is_superuser?: boolean;
  search?: string;
}

export const adminService = {
  /**
   * List all users (admin only)
   */
  async listUsers(filters?: AdminUserFilters) {
    const response = await apiClient.get('/admin/users', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get user by ID (admin only)
   */
  async getUser(userId: number) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Create user (admin only)
   */
  async createUser(data: any) {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },

  /**
   * Update user (admin only)
   */
  async updateUser(userId: number, data: any) {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: number) {
    await apiClient.delete(`/admin/users/${userId}`);
  },

  /**
   * Toggle user active status (admin only)
   */
  async toggleUserActive(userId: number) {
    const response = await apiClient.post(`/admin/users/${userId}/toggle-active`);
    return response.data;
  },

  /**
   * Get user activity (admin only)
   */
  async getUserActivity(userId: number) {
    const response = await apiClient.get(`/admin/users/${userId}/activity`);
    return response.data;
  },

  /**
   * Get user statistics (admin only)
   */
  async getUserStats() {
    const response = await apiClient.get('/admin/stats/users');
    return response.data;
  },

  /**
   * Get workout statistics (admin only)
   */
  async getWorkoutStats() {
    const response = await apiClient.get('/admin/stats/workouts');
    return response.data;
  },

  /**
   * Get goal statistics (admin only)
   */
  async getGoalStats() {
    const response = await apiClient.get('/admin/stats/goals');
    return response.data;
  },

  /**
   * Get complete admin dashboard (admin only)
   */
  async getDashboard() {
    const response = await apiClient.get('/admin/stats/dashboard');
    return response.data;
  },
};
