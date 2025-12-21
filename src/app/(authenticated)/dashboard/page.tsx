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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Welcome Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Welcome, {user?.full_name || 'Athlete'}!
        </h2>
        <p className="text-gray-700">
          Track your workouts, monitor your progress, and achieve your fitness
          goals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Workouts</p>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : stats?.total_workouts || 0}
              </p>
            </div>
            <div className="text-4xl">💪</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Exercises Logged</p>
              <p className="text-3xl font-bold text-gray-900">
                {isLoading ? '...' : stats?.total_exercises_logged || 0}
              </p>
            </div>
            <div className="text-4xl">🏋️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">This Week</p>
              <p className="text-3xl font-bold text-gray-900">
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
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Log a Workout</h3>
          <p className="text-blue-100">Start tracking your exercises now</p>
        </a>

        <a
          href="/analytics"
          className="bg-green-600 hover:bg-green-700 text-white rounded-lg shadow p-6 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">View Progress</h3>
          <p className="text-green-100">Check your analytics and improvements</p>
        </a>
      </div>
    </div>
  );
}
