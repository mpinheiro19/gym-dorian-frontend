import apiClient from '../client';
import type { components } from '@/types/api';

type Exercise = components['schemas']['ExerciseResponse'];
type WorkoutSession = components['schemas']['WorkoutSessionResponse'];
type WorkoutSessionCreate = components['schemas']['WorkoutSessionCreate'];
type QuickWorkoutLog = components['schemas']['QuickWorkoutLog'];

export interface ExerciseFilters {
  search?: string;
  muscle_group?: string;
  skip?: number;
  limit?: number;
}

export interface SessionFilters {
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}

export const workoutsService = {
  /**
   * List all exercises with optional filters
   */
  async listExercises(filters?: ExerciseFilters) {
    const response = await apiClient.get<Exercise[]>('/workouts/exercises', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get exercise by ID
   */
  async getExercise(id: number): Promise<Exercise> {
    const response = await apiClient.get<Exercise>(`/workouts/exercises/${id}`);
    return response.data;
  },

  /**
   * Create new exercise
   */
  async createExercise(data: Omit<Exercise, 'id'>): Promise<Exercise> {
    const response = await apiClient.post<Exercise>('/workouts/exercises', data);
    return response.data;
  },

  /**
   * List workout sessions
   */
  async listSessions(filters?: SessionFilters) {
    const response = await apiClient.get<WorkoutSession[]>(
      '/workouts/sessions',
      {
        params: filters,
      }
    );
    return response.data;
  },

  /**
   * Get workout session by ID
   */
  async getSession(id: number): Promise<WorkoutSession> {
    const response = await apiClient.get<WorkoutSession>(
      `/workouts/sessions/${id}`
    );
    return response.data;
  },

  /**
   * Create quick workout (recommended - auto-calculates totals)
   */
  async createQuickWorkout(data: QuickWorkoutLog): Promise<WorkoutSession> {
    const response = await apiClient.post<WorkoutSession>(
      '/workouts/sessions/quick',
      data
    );
    return response.data;
  },

  /**
   * Delete workout session
   */
  async deleteSession(id: number): Promise<void> {
    await apiClient.delete(`/workouts/sessions/${id}`);
  },

  /**
   * Get workout statistics
   */
  async getStats() {
    const response = await apiClient.get('/workouts/stats');
    return response.data;
  },
};
