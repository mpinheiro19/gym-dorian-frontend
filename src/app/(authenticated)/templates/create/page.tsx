'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { templatesService } from '@/lib/api/services/templates.service';
import { workoutsService } from '@/lib/api/services/workouts.service';
import { ExerciseDiagnostics } from './diagnostics';

// Validation schemas
const templateExerciseSchema = z.object({
  exercise_id: z.number().min(1, 'Please select an exercise'),
  order_index: z.number().min(0),
  target_sets: z.number().min(1).max(20).nullable().optional(),
  notes: z.string().max(500).optional(),
});

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  exercises: z.array(templateExerciseSchema).min(1, 'At least one exercise is required'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function CreateTemplatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch available exercises
  const { data: exercises, isLoading: isLoadingExercises, error: exercisesError } = useQuery({
    queryKey: ['exercises', searchTerm],
    queryFn: () => workoutsService.listExercises({ search: searchTerm, limit: 100 }),
  });

  // Debug logging
  console.log('Exercises query state:', {
    exercises,
    isLoadingExercises,
    exercisesError,
    exercisesCount: exercises?.length
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      description: '',
      exercises: [
        {
          exercise_id: 0,
          order_index: 0,
          target_sets: 3,
          notes: '',
        },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'exercises',
  });

  const createMutation = useMutation({
    mutationFn: templatesService.createTemplate,
    onSuccess: () => {
      toast.success('Template created successfully!');
      queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
      router.push('/templates');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create template');
    },
  });

  const onSubmit = (data: TemplateFormData) => {
    // Update order_index based on current order
    const formattedData = {
      ...data,
      exercises: data.exercises.map((ex, index) => ({
        ...ex,
        order_index: index,
      })),
    };
    createMutation.mutate(formattedData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Workout Template</h1>

      {/* Temporary Diagnostics - Remove after debugging */}
      <ExerciseDiagnostics />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Template Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Template Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="e.g., Treino A - Peito e Tríceps"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="Describe this workout template..."
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Exercises</h2>
            <button
              type="button"
              onClick={() =>
                append({
                  exercise_id: 0,
                  order_index: fields.length,
                  target_sets: 3,
                  notes: '',
                })
              }
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Add Exercise
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start gap-4">
                {/* Order Controls */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => index > 0 && move(index, index - 1)}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <span className="text-center font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => index < fields.length - 1 && move(index, index + 1)}
                    disabled={index === fields.length - 1}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>

                {/* Exercise Form */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exercise *
                    </label>
                    <select
                      {...register(`exercises.${index}.exercise_id`, {
                        valueAsNumber: true,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      disabled={isLoadingExercises}
                    >
                      <option value={0}>
                        {isLoadingExercises ? 'Loading exercises...' :
                         exercisesError ? 'Error loading exercises' :
                         !exercises || exercises.length === 0 ? 'No exercises found' :
                         'Select an exercise...'}
                      </option>
                      {exercises?.map((ex: any) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                          {ex.agonist_muscle_group && ` (${ex.agonist_muscle_group})`}
                        </option>
                      ))}
                    </select>
                    {exercisesError && (
                      <p className="mt-1 text-sm text-red-600">
                        Failed to load exercises. Please try refreshing the page.
                      </p>
                    )}
                    {errors.exercises?.[index]?.exercise_id && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.exercises[index]?.exercise_id?.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Sets
                      </label>
                      <input
                        type="number"
                        {...register(`exercises.${index}.target_sets`, {
                          valueAsNumber: true,
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <input
                      type="text"
                      {...register(`exercises.${index}.notes`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                      placeholder="e.g., Focus on form, go slow..."
                    />
                  </div>
                </div>

                {/* Remove Button */}
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium disabled:opacity-50"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Template'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
