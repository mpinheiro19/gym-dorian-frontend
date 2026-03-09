'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { userService } from '@/lib/api/services/user.service';

const goalSchema = z.object({
  goal_type: z.enum(['strength', 'muscle_gain', 'weight_loss', 'endurance', 'consistency', 'custom']),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  target_value: z.number().nullable().optional(),
  target_date: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).optional(),
});

type GoalFormData = z.infer<typeof goalSchema>;

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<number | null>(null);

  const { data: goals, isLoading } = useQuery({
    queryKey: ['user-goals'],
    queryFn: userService.listGoals,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      goal_type: 'strength',
      title: '',
      description: '',
      status: 'active',
    },
  });

  const createMutation = useMutation({
    mutationFn: userService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast.success('Goal created successfully!');
      setIsCreating(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create goal');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<GoalFormData> }) =>
      userService.updateGoal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast.success('Goal updated successfully!');
      setEditingGoal(null);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update goal');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      toast.success('Goal deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete goal');
    },
  });

  const onSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (goal: any) => {
    setEditingGoal(goal.id);
    setIsCreating(true);
    reset({
      goal_type: goal.goal_type,
      title: goal.title,
      description: goal.description || '',
      target_value: goal.target_value,
      target_date: goal.target_date?.split('T')[0] || '',
      status: goal.status,
    });
  };

  const handleDelete = (goalId: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      deleteMutation.mutate(goalId);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading goals...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Goals</h1>
        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingGoal(null);
              reset();
            }}
            className="bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium"
          >
            + New Goal
          </button>
        )}
      </div>

      {isCreating && (
        <div className="bg-surface rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Goal Type *
              </label>
              <select
                {...register('goal_type')}
                className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary bg-surface"
              >
                <option value="strength">Strength</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="endurance">Endurance</option>
                <option value="consistency">Consistency</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary placeholder-text-muted bg-surface"
                placeholder="e.g., Bench press 100kg"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary placeholder-text-muted bg-surface"
                placeholder="Add details about your goal..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Target Value
                </label>
                <input
                  {...register('target_value', { valueAsNumber: true })}
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary placeholder-text-muted bg-surface"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Target Date
                </label>
                <input
                  {...register('target_date')}
                  type="date"
                lang="pt-BR"
                placeholder="dd/mm/aaaa"
                  className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary bg-surface"
                />
              </div>
            </div>

            {editingGoal && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary bg-surface"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingGoal
                  ? 'Update Goal'
                  : 'Create Goal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingGoal(null);
                  reset();
                }}
                className="px-4 py-2 border border-border-input rounded-md font-medium hover:bg-surface-hover text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals && goals.length > 0 ? (
          goals.map((goal: any) => (
            <div key={goal.id} className="bg-surface rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-text-primary">
                      {goal.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        goal.status === 'active'
                          ? 'bg-success-surface text-success-text'
                          : goal.status === 'completed'
                          ? 'bg-accent-surface text-accent-surface-text'
                          : 'bg-surface-secondary text-text-secondary'
                      }`}
                    >
                      {goal.status}
                    </span>
                    <span className="text-xs bg-info-surface text-info-text px-2 py-1 rounded-full">
                      {goal.goal_type.replace('_', ' ')}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-text-tertiary mb-3">{goal.description}</p>
                  )}
                  <div className="flex gap-6 text-sm text-text-tertiary">
                    {goal.target_value && (
                      <div>
                        <span className="font-medium">Target:</span> {goal.target_value}
                        {goal.current_value && ` / Current: ${goal.current_value}`}
                      </div>
                    )}
                    {goal.target_date && (
                      <div>
                        <span className="font-medium">Due:</span>{' '}
                        {new Date(goal.target_date).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="text-accent hover:text-accent-hover font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-error hover:text-error font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-surface rounded-lg shadow">
            <p className="text-text-tertiary mb-4">No goals set yet</p>
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingGoal(null);
                reset();
              }}
              className="inline-block bg-accent hover:bg-accent-hover text-accent-fg px-6 py-3 rounded-md font-medium"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
