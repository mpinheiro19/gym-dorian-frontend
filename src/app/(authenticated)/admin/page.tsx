'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function AdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user?.is_superuser) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboard,
    enabled: user?.is_superuser,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.listUsers({ limit: 100 }),
    enabled: user?.is_superuser,
  });

  if (!user?.is_superuser) {
    return (
      <div className="text-center py-12">
        <p className="text-error">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const isLoading = dashboardLoading || usersLoading;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Admin Dashboard</h1>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="text-sm text-text-secondary">Total Users</p>
          <p className="text-3xl font-bold text-text-primary">
            {dashboard?.user_stats?.total_users || 0}
          </p>
          <p className="text-xs text-success-text mt-1">
            {dashboard?.user_stats?.active_users || 0} active
          </p>
        </div>
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="text-sm text-text-secondary">Total Workouts</p>
          <p className="text-3xl font-bold text-text-primary">
            {dashboard?.workout_stats?.total_workouts || 0}
          </p>
        </div>
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="text-sm text-text-secondary">Total Exercises</p>
          <p className="text-3xl font-bold text-text-primary">
            {dashboard?.workout_stats?.total_exercises_logged || 0}
          </p>
        </div>
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="text-sm text-text-secondary">Total Goals</p>
          <p className="text-3xl font-bold text-text-primary">
            {dashboard?.goal_stats?.total_goals || 0}
          </p>
          <p className="text-xs text-success-text mt-1">
            {dashboard?.goal_stats?.completed_goals || 0} completed
          </p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-surface rounded-lg shadow">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-text-primary">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-border">
              {users && users.length > 0 ? (
                users.map((u: any) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text-primary">
                        {u.full_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text-primary">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          u.is_active
                            ? 'bg-success-surface text-success-text'
                            : 'bg-error-surface text-error-text'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          u.is_superuser
                            ? 'bg-info-surface text-info-text'
                            : 'bg-surface-secondary text-text-secondary'
                        }`}
                      >
                        {u.is_superuser ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-accent hover:text-accent-hover mr-3">
                        View
                      </button>
                      <button className="text-text-tertiary hover:text-text-primary">
                        {u.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-text-muted">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
