'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { plansService } from '@/lib/api/services/plans.service';
import type { PlanStatus } from '@/types/api';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STATUS_LABELS: Record<PlanStatus, string> = {
  active: 'Active',
  queued: 'Queued',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

const STATUS_COLORS: Record<PlanStatus, string> = {
  active: 'bg-green-100 text-green-800',
  queued: 'bg-blue-100 text-blue-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  archived: 'bg-red-100 text-red-800',
};

function getCurrentWeekInCycle(startDate: string, totalWeeks: number): number {
  const start = new Date(startDate);
  const today = new Date();
  const daysDiff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const weeksSinceStart = Math.floor(daysDiff / 7);
  return (weeksSinceStart % totalWeeks) + 1;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PlanDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const planId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: plan, isLoading, isError } = useQuery({
    queryKey: ['workout-plan', planId],
    queryFn: () => plansService.getPlan(planId),
  });

  const { data: today } = useQuery({
    queryKey: ['today-workout', planId],
    queryFn: () => plansService.getTodayWorkout(planId),
    enabled: plan?.status === 'active' && !!plan?.start_date,
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: (status: PlanStatus) => plansService.updateStatus(planId, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['workout-plan', planId] });
      queryClient.invalidateQueries({ queryKey: ['workout-plans'] });
      queryClient.invalidateQueries({ queryKey: ['today-workout'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Failed to update status';
      toast.error(msg);
    },
  });

  const startMutation = useMutation({
    mutationFn: () => plansService.startWorkout(planId),
    onSuccess: () => {
      toast.success("Today's workout started!");
      router.push('/workouts');
    },
    onError: () => toast.error("Failed to start workout"),
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  if (isError || !plan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Plan not found</p>
        <Link href="/plans" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Plans
        </Link>
      </div>
    );
  }

  const currentWeek =
    plan.status === 'active' && plan.start_date && plan.weeks.length > 0
      ? getCurrentWeekInCycle(plan.start_date, plan.weeks.length)
      : null;

  const todayDow = new Date().getDay(); // 0=Sun
  const isoDow = todayDow === 0 ? 6 : todayDow - 1; // 0=Mon

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/plans" className="text-gray-500 hover:text-gray-700 text-sm">
            ← Plans
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{plan.name}</h1>
          {plan.description && (
            <p className="text-gray-600 mt-1">{plan.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          <span
            className={`text-sm font-medium px-3 py-1 rounded-full ${STATUS_COLORS[plan.status]}`}
          >
            {STATUS_LABELS[plan.status]}
          </span>
          <Link
            href={`/plans/${planId}/edit`}
            className="border border-gray-300 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Today's workout card */}
      {plan.status === 'active' && (
        <div className="bg-white rounded-lg shadow p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Today's Workout</h2>
          {today ? (
            today.is_rest_day ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">😴</span>
                <div>
                  <p className="font-medium text-gray-700">Rest Day</p>
                  <p className="text-sm text-gray-500">{today.day_name}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{today.template_name}</p>
                  <p className="text-sm text-gray-500">
                    Week {today.week_number} · {today.day_name}
                  </p>
                  {today.template_description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {today.template_description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50"
                >
                  {startMutation.isPending ? 'Starting...' : '▶ Start Workout'}
                </button>
              </div>
            )
          ) : (
            <p className="text-gray-500 text-sm">Loading today's schedule...</p>
          )}
        </div>
      )}

      {/* Status actions */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Status Actions</h2>
        <div className="flex flex-wrap gap-2">
          {plan.status !== 'active' &&
            plan.status !== 'completed' &&
            plan.status !== 'archived' && (
              <button
                onClick={() => statusMutation.mutate('active')}
                disabled={statusMutation.isPending}
                className="px-3 py-1.5 bg-green-100 text-green-800 rounded-md text-sm font-medium hover:bg-green-200 disabled:opacity-50"
              >
                Activate
              </button>
            )}
          {plan.status === 'active' && (
            <button
              onClick={() => statusMutation.mutate('paused')}
              disabled={statusMutation.isPending}
              className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium hover:bg-yellow-200 disabled:opacity-50"
            >
              Pause
            </button>
          )}
          {(plan.status === 'active' || plan.status === 'paused') && (
            <button
              onClick={() => statusMutation.mutate('completed')}
              disabled={statusMutation.isPending}
              className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              Complete
            </button>
          )}
          {plan.status !== 'archived' && (
            <button
              onClick={() => {
                if (confirm('Archive this plan? This is a terminal state.'))
                  statusMutation.mutate('archived');
              }}
              disabled={statusMutation.isPending}
              className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md text-sm font-medium hover:bg-red-100 disabled:opacity-50"
            >
              Archive
            </button>
          )}
        </div>
      </div>

      {/* Schedule grid */}
      <div className="bg-white rounded-lg shadow p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Schedule{' '}
          <span className="text-sm font-normal text-gray-500">
            ({plan.weeks.length} week cycle)
          </span>
        </h2>

        {plan.weeks.length === 0 ? (
          <p className="text-gray-500 text-sm">No weeks configured.</p>
        ) : (
          <div className="space-y-4">
            {plan.weeks.map((week) => {
              const isCurrent = currentWeek === week.week_number;
              return (
                <div
                  key={week.id}
                  className={`border-2 rounded-lg p-4 ${
                    isCurrent
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-medium text-gray-800">
                      Week {week.week_number}
                      {week.name ? ` — ${week.name}` : ''}
                    </h3>
                    {isCurrent && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Current Week
                      </span>
                    )}
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_NAMES.map((dayName, dow) => {
                      const dayEntry = week.days.find(
                        (d) => d.day_of_week === dow
                      );
                      const isToday = isCurrent && dow === isoDow;
                      return (
                        <div
                          key={dow}
                          className={`rounded p-2 text-center text-xs ${
                            isToday
                              ? 'bg-blue-600 text-white'
                              : dayEntry
                              ? 'bg-green-50 text-green-800 border border-green-200'
                              : 'bg-gray-50 text-gray-400'
                          }`}
                        >
                          <p className="font-medium mb-1">{dayName}</p>
                          {dayEntry ? (
                            <p className="truncate" title={dayEntry.template?.name}>
                              {dayEntry.template?.name ?? 'Template'}
                            </p>
                          ) : (
                            <p className="text-gray-300">—</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
