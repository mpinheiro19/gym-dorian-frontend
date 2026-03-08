import apiClient from '../client';
import type {
  WorkoutPlan,
  WorkoutPlanCreate,
  WorkoutPlanUpdate,
  PlanStatus,
  PlanStatusUpdate,
  TodayWorkoutResponse,
  WorkoutSession,
} from '@/types/api';

export const plansService = {
  /**
   * List all plans for the current user, optionally filtered by status
   */
  async listPlans(status?: PlanStatus): Promise<WorkoutPlan[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get<WorkoutPlan[]>('/plans', { params });
    return response.data;
  },

  /**
   * Get a specific plan by ID (includes nested weeks and days)
   */
  async getPlan(id: number): Promise<WorkoutPlan> {
    const response = await apiClient.get<WorkoutPlan>(`/plans/${id}`);
    return response.data;
  },

  /**
   * Create a new workout plan with nested weeks and days
   */
  async createPlan(data: WorkoutPlanCreate): Promise<WorkoutPlan> {
    const response = await apiClient.post<WorkoutPlan>('/plans', data);
    return response.data;
  },

  /**
   * Update an existing plan (name, description, or full schedule)
   */
  async updatePlan(id: number, data: WorkoutPlanUpdate): Promise<WorkoutPlan> {
    const response = await apiClient.put<WorkoutPlan>(`/plans/${id}`, data);
    return response.data;
  },

  /**
   * Delete a plan and its entire schedule (cascade)
   */
  async deletePlan(id: number): Promise<void> {
    await apiClient.delete(`/plans/${id}`);
  },

  /**
   * Update the status of a plan (activate, pause, complete, archive)
   */
  async updateStatus(id: number, status: PlanStatus): Promise<WorkoutPlan> {
    const body: PlanStatusUpdate = { status };
    const response = await apiClient.patch<WorkoutPlan>(`/plans/${id}/status`, body);
    return response.data;
  },

  /**
   * Get today's workout for a specific plan
   * Returns TodayWorkoutResponse (with is_rest_day flag)
   */
  async getTodayWorkout(id: number): Promise<TodayWorkoutResponse> {
    const response = await apiClient.get<TodayWorkoutResponse>(`/plans/${id}/today`);
    return response.data;
  },

  /**
   * Get today's workout across all active plans (for dashboard)
   * Returns null when no active plan exists
   */
  async getActiveTodayWorkout(): Promise<TodayWorkoutResponse | null> {
    const response = await apiClient.get<TodayWorkoutResponse | null>('/plans/active/today');
    return response.data;
  },

  /**
   * Start today's workout from the plan — creates a WorkoutSession
   * with template_id and plan_id for traceability
   */
  async startWorkout(planId: number): Promise<WorkoutSession> {
    const response = await apiClient.post<WorkoutSession>(`/plans/${planId}/start-workout`);
    return response.data;
  },
};
