'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { templatesService } from '@/lib/api/services/templates.service';
import { workoutsService } from '@/lib/api/services/workouts.service';

// Validation schemas (reutilizados do log page)
const setSchema = z.object({
  set_number: z.number().min(1),
  reps: z.number().min(1, 'Reps must be at least 1'),
  weight: z.number().min(0, 'Weight must be positive'),
  rpe: z.number().min(1).max(10).nullable().optional(),
  notes: z.string().optional(),
  rest_time_seconds: z.number().min(0).nullable().optional(),
});

const exerciseSchema = z.object({
  exercise_id: z.number().min(1),
  sets: z.array(setSchema).min(1, 'At least one set is required'),
});

const workoutSchema = z.object({
  workout_date: z.string().min(1, 'Date is required'),
  duration_minutes: z.number().min(0).nullable().optional(),
  notes: z.string().optional(),
  exercises: z.array(exerciseSchema).min(1),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

export default function ExecuteTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const templateId = Number(searchParams.get('template_id'));

  // Fetch prepared template data
  const { data: preparedData, isLoading } = useQuery({
    queryKey: ['prepare-template', templateId],
    queryFn: () => templatesService.prepareWorkoutFromTemplate({
      template_id: templateId,
      workout_date: new Date().toISOString().split('T')[0],
    }),
    enabled: !!templateId,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      workout_date: new Date().toISOString().split('T')[0],
      exercises: [],
    },
  });

  const { fields: exerciseFields } = useFieldArray({
    control,
    name: 'exercises',
  });

  // Populate form when template data loads
  useEffect(() => {
    if (preparedData?.exercises) {
      const formattedExercises = preparedData.exercises.map((te: any) => ({
        exercise_id: te.exercise_id,
        sets: Array.from({ length: te.target_sets || 3 }, (_, i) => ({
          set_number: i + 1,
          reps: 0,      // EMPTY - user fills
          weight: 0,    // EMPTY - user fills
          rpe: null,
          notes: '',
          rest_time_seconds: null,
        })),
      }));

      reset({
        workout_date: preparedData.workout_date,
        exercises: formattedExercises,
      });
    }
  }, [preparedData, reset]);

  const createWorkoutMutation = useMutation({
    mutationFn: workoutsService.createQuickWorkout,
    onSuccess: () => {
      toast.success('Workout completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      router.push('/workouts');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to save workout');
    },
  });

  const onSubmit = (data: WorkoutFormData) => {
    createWorkoutMutation.mutate(data as any);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-text-secondary">Preparing workout...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">
          Execute: {preparedData?.template_name}
        </h1>
        <p className="text-text-tertiary mt-2">
          Fill in your sets, reps, and weights for each exercise
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Workout Details */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Workout Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Date *
              </label>
              <input
                type="date"
                {...register('workout_date')}
                className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                {...register('duration_minutes', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary"
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
              rows={2}
              className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary"
              placeholder="How did it feel?"
            />
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text-primary">Exercises</h2>

          {exerciseFields.map((exercise, exerciseIndex) => {
            const exerciseData = preparedData?.exercises[exerciseIndex];

            return (
              <ExecuteExerciseForm
                key={exercise.id}
                exerciseIndex={exerciseIndex}
                exerciseData={exerciseData}
                control={control}
                register={register}
                errors={errors}
              />
            );
          })}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={createWorkoutMutation.isPending}
            className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg px-6 py-3 rounded-md font-medium disabled:opacity-50"
          >
            {createWorkoutMutation.isPending ? 'Saving...' : 'Finish Workout'}
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

// Exercise form component
function ExecuteExerciseForm({ exerciseIndex, exerciseData, control, register, errors }: any) {
  const { fields: setFields, append, remove } = useFieldArray({
    control,
    name: `exercises.${exerciseIndex}.sets`,
  });

  return (
    <div className="bg-surface rounded-lg shadow p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {exerciseIndex + 1}. {exerciseData?.exercise.name}
        </h3>
        {exerciseData?.exercise.agonist_muscle_group && (
          <p className="text-sm text-text-tertiary">
            {exerciseData.exercise.agonist_muscle_group}
          </p>
        )}
        {exerciseData?.notes && (
          <p className="text-sm text-accent mt-1 italic">
            Note: {exerciseData.notes}
          </p>
        )}
      </div>

      {/* Sets Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-text-secondary">Sets</h4>
          <button
            type="button"
            onClick={() =>
              append({
                set_number: setFields.length + 1,
                reps: 0,
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
                className="w-full px-2 py-1 border border-border-input rounded text-sm bg-surface text-text-primary"
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
                className="w-full px-2 py-1 border border-border-input rounded text-sm bg-surface text-text-primary"
                min="0"
                placeholder="60"
              />
            </div>
            <div className="col-span-1">
              {setFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(setIndex)}
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
