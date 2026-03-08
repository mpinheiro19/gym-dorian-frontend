'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { workoutsService } from '@/lib/api/services/workouts.service';

const setSchema = z.object({
  set_number: z.number().min(1),
  reps: z.number().min(1, 'Reps must be at least 1'),
  weight: z.number().min(0, 'Weight must be positive'),
  rpe: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().optional(),
  rest_time_seconds: z.number().min(0).nullable().optional(),
});

const exerciseSchema = z.object({
  exercise_id: z.number().min(1, 'Please select an exercise'),
  sets: z.array(setSchema).min(1, 'At least one set is required'),
});

const workoutSchema = z.object({
  workout_date: z.string().min(1, 'Date is required'),
  duration_minutes: z.number().min(0).nullable().optional(),
  notes: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1, 'At least one exercise is required'),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

export default function LogWorkoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch exercises for selection
  const { data: exercises } = useQuery({
    queryKey: ['exercises', searchTerm],
    queryFn: () => workoutsService.listExercises({ search: searchTerm, limit: 50 }),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      workout_date: new Date().toISOString().split('T')[0],
      exercises: [
        {
          exercise_id: 0,
          sets: [{ set_number: 1, reps: 10, weight: 0 }],
        },
      ],
    },
  });

  const { fields: exerciseFields, append: appendExercise, remove: removeExercise } = useFieldArray({
    control,
    name: 'exercises',
  });

  const createWorkoutMutation = useMutation({
    mutationFn: workoutsService.createQuickWorkout,
    onSuccess: () => {
      toast.success('Workout logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      router.push('/workouts');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to log workout');
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    createWorkoutMutation.mutate(data as any);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Log Workout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Workout Details */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Workout Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Date *
              </label>
              <input
                type="date"
                lang="pt-BR"
                placeholder="dd/mm/aaaa"
                {...register('workout_date')}
                className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary"
              />
              {errors.workout_date && (
                <p className="mt-1 text-sm text-error">{errors.workout_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                {...register('duration_minutes', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary placeholder-text-muted"
                placeholder="60"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary placeholder-text-muted"
              placeholder="How did it feel?"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-text-primary">Exercises</h2>
            <button
              type="button"
              onClick={() =>
                appendExercise({
                  exercise_id: 0,
                  sets: [{ set_number: 1, reps: 10, weight: 0 }],
                })
              }
              className="bg-success hover:bg-success/90 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Add Exercise
            </button>
          </div>

          {exerciseFields.map((exercise, exerciseIndex) => (
            <ExerciseForm
              key={exercise.id}
              exerciseIndex={exerciseIndex}
              exercises={exercises || []}
              control={control}
              register={register}
              watch={watch}
              errors={errors}
              onRemove={() => removeExercise(exerciseIndex)}
              canRemove={exerciseFields.length > 1}
            />
          ))}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createWorkoutMutation.isPending}
            className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg px-6 py-3 rounded-md font-medium disabled:opacity-50"
          >
            {createWorkoutMutation.isPending ? 'Saving...' : 'Save Workout'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-border-input rounded-md font-medium hover:bg-surface-hover text-text-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function ExerciseForm({
  exerciseIndex,
  exercises,
  control,
  register,
  watch,
  errors,
  onRemove,
  canRemove,
}: any) {
  const { fields: setFields, append: appendSet, remove: removeSet } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <div className="bg-surface rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Exercise *
          </label>
          <select
            {...register(`exercises.${exerciseIndex}.exercise_id`, {
              valueAsNumber: true,
            })}
            className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary"
          >
            <option value={0}>Select an exercise...</option>
            {exercises.map((ex: any) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} {ex.agonist_muscle_group && `(${ex.agonist_muscle_group})`}
              </option>
            ))}
          </select>
          {errors.exercises?.[exerciseIndex]?.exercise_id && (
            <p className="mt-1 text-sm text-error">
              {errors.exercises[exerciseIndex].exercise_id.message}
            </p>
          )}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-4 text-error hover:opacity-80 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {/* Sets */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-text-secondary">Sets</h4>
          <button
            type="button"
            onClick={() =>
              appendSet({
                set_number: setFields.length + 1,
                reps: 10,
                weight: 0,
              })
            }
            className="text-sm text-accent hover:text-accent-hover font-medium"
          >
            + Add Set
          </button>
        </div>

        <div className="grid grid-cols-12 gap-2 text-xs font-medium text-text-tertiary px-2">
          <div className="col-span-1">Set</div>
          <div className="col-span-3">Reps</div>
          <div className="col-span-3">Weight</div>
          <div className="col-span-2">RPE</div>
          <div className="col-span-2">Rest (s)</div>
          <div className="col-span-1"></div>
        </div>

        {setFields.map((set, setIndex) => (
          <div key={set.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-center font-medium text-text-tertiary">
              {setIndex + 1}
            </div>
            <div className="col-span-3">
              <input
                type="number"
                {...register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`, {
                  valueAsNumber: true,
                })}
                className="w-full px-2 py-1 border border-border-input rounded text-sm bg-surface text-text-primary"
                min="1"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                step="0.5"
                {...register(`exercises.${exerciseIndex}.sets.${setIndex}.weight`, {
                  valueAsNumber: true,
                })}
                className="w-full px-2 py-1 border border-border-input rounded text-sm bg-surface text-text-primary"
                min="0"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                {...register(`exercises.${exerciseIndex}.sets.${setIndex}.rpe`, {
                  valueAsNumber: true,
                })}
                className="w-full px-2 py-1 border border-border-input rounded text-sm bg-surface text-text-primary placeholder-text-muted"
                min="1"
                max="10"
                placeholder="1-10"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                {...register(
                  `exercises.${exerciseIndex}.sets.${setIndex}.rest_time_seconds`,
                  { valueAsNumber: true }
                )}
                className="w-full px-2 py-1 border border-border-input rounded text-sm bg-surface text-text-primary placeholder-text-muted"
                min="0"
                placeholder="60"
              />
            </div>
            <div className="col-span-1">
              {setFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSet(setIndex)}
                  className="text-error hover:opacity-80 text-sm"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
