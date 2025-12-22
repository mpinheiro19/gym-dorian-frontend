import apiClient from '../client';
import type {
  WorkoutTemplate,
  WorkoutTemplateCreate,
  ExecuteTemplateRequest
} from '@/types/api';

export const templatesService = {
  /**
   * List all workout templates for the current user
   */
  async listTemplates() {
    const response = await apiClient.get<WorkoutTemplate[]>('/templates');
    return response.data;
  },

  /**
   * Get a specific workout template by ID
   */
  async getTemplate(id: number): Promise<WorkoutTemplate> {
    const response = await apiClient.get<WorkoutTemplate>(`/templates/${id}`);
    return response.data;
  },

  /**
   * Create a new workout template
   */
  async createTemplate(data: WorkoutTemplateCreate): Promise<WorkoutTemplate> {
    const response = await apiClient.post<WorkoutTemplate>('/templates', data);
    return response.data;
  },

  /**
   * Update an existing workout template
   */
  async updateTemplate(id: number, data: Partial<WorkoutTemplateCreate>): Promise<WorkoutTemplate> {
    const response = await apiClient.put<WorkoutTemplate>(`/templates/${id}`, data);
    return response.data;
  },

  /**
   * Delete a workout template
   */
  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/templates/${id}`);
  },

  /**
   * Prepare a workout from a template
   * Returns formatted data for the frontend to populate with actual workout data
   */
  async prepareWorkoutFromTemplate(request: ExecuteTemplateRequest) {
    const response = await apiClient.post(
      `/templates/${request.template_id}/prepare`,
      request
    );
    return response.data;
  },
};
