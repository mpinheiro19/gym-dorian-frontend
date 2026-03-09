'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { plansService } from '@/lib/api/services/plans.service';
import { STATUS_COLORS } from '@/lib/constants/status-colors';
import type { WorkoutPlan, PlanStatus } from '@/types/api';

const STATUS_LABELS: Record<PlanStatus, string> = {
  active: 'Active',
  queued: 'Queued',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS_FILTER_OPTIONS: { value: PlanStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'queued', label: 'Queued' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function PlansPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<PlanStatus | 'all'>('all');

  const { data: plans, isLoading } = useQuery({
    queryKey: ['workout-plans', statusFilter],
    queryFn: () =>
      statusFilter === 'all'
        ? plansService.listPlans()
        : plansService.listPlans(statusFilter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PlanStatus }) =>
      plansService.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Plan status updated');
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['today-workout'] });
    },
    onError: () => toast.error('Failed to update status'),
  });

  const deleteMutation = useMutation({
    mutationFn: plansService.deletePlan,
    onSuccess: () => {
      toast.success('Plan deleted');
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
    },
    onError: () => toast.error('Failed to delete plan'),
  });

  const handleToggleActive = (plan: WorkoutPlan) => {
    if (plan.status === 'active') {
      statusMutation.mutate({ id: plan.id, status: 'paused' });
    } else if (plan.status === 'queued' || plan.status === 'paused') {
      statusMutation.mutate({ id: plan.id, status: 'active' });
    }
  };

  const handleDelete = (plan: WorkoutPlan) => {
    if (confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(plan.id);
    }
  };

  const getDaysSummary = (plan: WorkoutPlan): string => {
    if (!plan.weeks || plan.weeks.length === 0) return 'No schedule';
    const week1 = plan.weeks[0];
    if (!week1.days || week1.days.length === 0) return 'Rest week';
    const dayNames = week1.days
      .map((d) => DAY_NAMES[d.day_of_week])
      .join(', ');
    return dayNames;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Workout Plans</h1>
        <Link
          href="/plans/create"
          className="bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium"
        >
          + Create Plan
        </Link>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-accent text-accent-fg'
                : 'bg-surface-secondary text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Plans List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto" />
          <p className="mt-4 text-text-secondary">Loading plans...</p>
        </div>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-surface rounded-lg shadow hover:shadow-md transition-shadow p-6 flex flex-col"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary truncate">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-sm text-text-tertiary mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                </div>
                <span
                  className={`ml-2 flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
                    STATUS_COLORS[plan.status]
                  }`}
                >
                  {STATUS_LABELS[plan.status]}
                </span>
              </div>

              {/* Meta */}
              <div className="flex gap-3 mb-3 text-sm text-text-tertiary">
                <span>📅 {plan.weeks?.length ?? 0} week{plan.weeks?.length !== 1 ? 's' : ''}</span>
                {plan.start_date && (
                  <span>🗓 Since {new Date(plan.start_date).toLocaleDateString()}</span>
                )}
              </div>

              {/* Days preview */}
              <p className="text-sm text-text-secondary mb-4">
                <strong>Week 1:</strong> {getDaysSummary(plan)}
              </p>

              {/* Actions */}
              <div className="mt-auto flex flex-col gap-2">
                <Link
                  href={`/plans/${plan.id}`}
                  className="w-full text-center bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md text-sm font-medium"
                >
                  View Plan
                </Link>
                <div className="flex gap-2">
                  <Link
                    href={`/plans/${plan.id}/edit`}
                    className="flex-1 text-center px-3 py-2 border border-border-input rounded-md text-sm font-medium hover:bg-surface-hover text-text-secondary"
                  >
                    Edit
                  </Link>
                  {(plan.status === 'active' ||
                    plan.status === 'queued' ||
                    plan.status === 'paused') && (
                    <button
                      onClick={() => handleToggleActive(plan)}
                      disabled={statusMutation.isPending}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 ${
                        plan.status === 'active'
                          ? 'bg-warning-surface text-warning-text hover:bg-warning-surface/80'
                          : 'bg-success-surface text-success-text hover:bg-success-surface/80'
                      }`}
                    >
                      {plan.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(plan)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-2 border border-error text-error rounded-md text-sm font-medium hover:bg-error-surface disabled:opacity-50"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-lg shadow">
          <p className="text-4xl mb-4">📅</p>
          <p className="text-text-tertiary mb-2">No plans found</p>
          <p className="text-sm text-text-muted mb-6">
            Create a workout plan to organize your training weeks
          </p>
          <Link
            href="/plans/create"
            className="inline-block bg-accent hover:bg-accent-hover text-accent-fg px-6 py-3 rounded-md font-medium"
          >
            Create Your First Plan
          </Link>
        </div>
      )}
    </div>
  );
}
