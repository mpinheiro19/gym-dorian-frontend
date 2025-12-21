import apiClient from '../client';

export const analyticsService = {
  /**
   * Get complete analytics dashboard data
   */
  async getDashboard() {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  /**
   * Get overall progress summary
   */
  async getProgressSummary(days: number = 30) {
    const response = await apiClient.get('/analytics/progress', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get exercise-specific progress over time
   */
  async getExerciseProgress(exerciseId: number, days: number = 90) {
    const response = await apiClient.get(
      `/analytics/progress/exercise/${exerciseId}`,
      {
        params: { days },
      }
    );
    return response.data;
  },

  /**
   * Get weekly workout volume (last 12 weeks by default)
   */
  async getWeeklyVolume(weeks: number = 12) {
    const response = await apiClient.get('/analytics/volume/weekly', {
      params: { weeks },
    });
    return response.data;
  },

  /**
   * Get monthly workout volume (last 6 months by default)
   */
  async getMonthlyVolume(months: number = 6) {
    const response = await apiClient.get('/analytics/volume/monthly', {
      params: { months },
    });
    return response.data;
  },

  /**
   * Get personal records (max weights for each exercise)
   */
  async getPersonalRecords() {
    const response = await apiClient.get('/analytics/personal-records');
    return response.data;
  },

  /**
   * Get muscle group distribution
   */
  async getMuscleDistribution(days: number = 30) {
    const response = await apiClient.get('/analytics/muscle-distribution', {
      params: { days },
    });
    return response.data;
  },

  /**
   * Get weekly muscle volume tracking
   */
  async getWeeklyMuscleVolume(weeks: number = 12) {
    const response = await apiClient.get('/analytics/muscle-volume/weekly', {
      params: { weeks },
    });
    return response.data;
  },

  /**
   * Get AI-generated insights and recommendations
   */
  async getInsights(days: number = 30) {
    const response = await apiClient.get('/analytics/insights', {
      params: { days },
    });
    return response.data;
  },
};
