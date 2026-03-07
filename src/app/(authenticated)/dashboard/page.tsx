'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth.store';
import apiClient from '@/lib/api/client';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch some basic stats for the dashboard
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await apiClient.get('/workouts/stats');
      return response.data;
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
        <a
          href="/workouts"
          className="bg-accent hover:bg-accent-hover text-accent-fg rounded-lg shadow p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold text-accent-fg mb-2">Log a Workout</h3>
          <p className="text-accent-fg/70">Start tracking your exercises now</p>
        </a>

        <a
          href="/analytics"
          className="bg-success hover:bg-success/90 text-white rounded-lg shadow p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold text-white mb-2">View Progress</h3>
          <p className="text-white/70">Check your analytics and improvements</p>
        </a>
      </div>
    </div>
  );
}
