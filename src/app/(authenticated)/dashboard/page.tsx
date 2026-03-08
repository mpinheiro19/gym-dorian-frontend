'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/auth.store';
import apiClient from '@/lib/api/client';
import { plansService } from '@/lib/api/services/plans.service';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch basic stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/workouts/stats');
      return response.data;
    },
  });

  // Fetch today's workout from active plan
  const { data: todayWorkout, isLoading: isTodayLoading } = useQuery({
    queryKey: ['active-today-workout'],
    queryFn: () => plansService.getActiveTodayWorkout(),
    retry: false,
  });

  // Start workout from today's plan
  const startWorkoutMutation = useMutation({
    mutationFn: (planId: number) => plansService.startWorkout(planId),
    onSuccess: (session) => {
      toast.success('Workout session started!');
      queryClient.invalidateQueries({ queryKey: ['workout-sessions'] });
      // Navigate to workouts list
      window.location.href = '/workouts';
    },
    onError: () => {
      toast.error('Failed to start workout');
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Dashboard</h1>

      {/* Welcome Card */}
      <div className="bg-surface rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Welcome, {user?.full_name || 'Athlete'}!
        </h2>
        <p className="text-text-secondary">
          Track your workouts, monitor your progress, and achieve your fitness
          goals.
        </p>
      </div>

      {/* Today's Workout Widget */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Today&apos;s Workout</h2>
        {isTodayLoading ? (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Checking your plan...</span>
          </div>
        ) : !todayWorkout ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-3">No active workout plan. Start by creating one!</p>
            <Link
              href="/plans/create"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-medium text-sm"
            >
              Create Your First Plan
            </Link>
          </div>
        ) : todayWorkout.is_rest_day ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl">😴</span>
            <div>
              <p className="font-semibold text-gray-900">Rest Day</p>
              <p className="text-sm text-gray-600">{todayWorkout.plan_name} — Week {todayWorkout.week_number}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 text-lg">{todayWorkout.template_name}</p>
              <p className="text-sm text-gray-600">{todayWorkout.plan_name} — Week {todayWorkout.week_number}, {todayWorkout.day_name}</p>
              {todayWorkout.template_description && (
                <p className="text-sm text-gray-500 mt-1">{todayWorkout.template_description}</p>
              )}
            </div>
            <button
              onClick={() => startWorkoutMutation.mutate(todayWorkout.plan_id)}
              disabled={startWorkoutMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md font-medium text-sm disabled:opacity-50"
            >
              {startWorkoutMutation.isPending ? 'Starting...' : 'Start Workout'}
            </button>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Workouts</p>
              <p className="text-3xl font-bold text-text-primary">
                {isLoading ? '...' : stats?.total_workouts || 0}
              </p>
            </div>
            <div className="text-4xl">💪</div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Exercises Logged</p>
              <p className="text-3xl font-bold text-text-primary">
                {isLoading ? '...' : stats?.total_exercises_logged || 0}
              </p>
            </div>
            <div className="text-4xl">🏋️</div>
          </div>
        </div>

        <div className="bg-surface rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">This Week</p>
              <p className="text-3xl font-bold text-text-primary">
                {isLoading ? '...' : stats?.workouts_this_week || 0}
              </p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/workouts"
          className="bg-accent hover:bg-accent-hover text-accent-fg rounded-lg shadow p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold text-accent-fg mb-2">Log a Workout</h3>
          <p className="text-accent-fg/70">Start tracking your exercises now</p>
        </Link>

        <Link
          href="/analytics"
          className="bg-success hover:bg-success/90 text-white rounded-lg shadow p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-2">View Progress</h3>
          <p className="text-white/70">Check your analytics and improvements</p>
        </Link>
      </div>
    </div>
  );
}
