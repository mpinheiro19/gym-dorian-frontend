'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { plansService } from '@/lib/api/services/plans.service';
import { templatesService } from '@/lib/api/services/templates.service';
import type { WorkoutPlanUpdate } from '@/types/api';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface WeekDraft {
  week_number: number;
  name: string;
  days: Record<number, number>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPlanPage({ params }: PageProps) {
  const { id } = use(params);
  const planId = Number(id);
  const router = useRouter();

  const { data: plan, isLoading } = useQuery({
    queryKey: ['workout-plan', planId],
    queryFn: () => plansService.getPlan(planId),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['workout-templates'],
    queryFn: () => templatesService.listTemplates(),
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState<WeekDraft[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (plan && !initialized) {
      setName(plan.name);
      setDescription(plan.description ?? '');
      setSchedule(
        plan.weeks.map((w) => ({
          week_number: w.week_number,
          name: w.name ?? '',
          days: Object.fromEntries(w.days.map((d) => [d.day_of_week, d.template_id])),
        }))
      );
      setInitialized(true);
    }
  }, [plan, initialized]);

  const updateMutation = useMutation({
    mutationFn: (data: WorkoutPlanUpdate) => plansService.updatePlan(planId, data),
    onSuccess: () => {
      toast.success('Plan updated!');
      router.push(`/plans/${planId}`);
    },
    onError: () => toast.error('Failed to update plan'),
  });

  const addWeek = () => {
    setSchedule((prev) => [
      ...prev,
      { week_number: prev.length + 1, name: '', days: {} },
    ]);
  };

  const removeWeek = (index: number) => {
    setSchedule((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.map((w, i) => ({ ...w, week_number: i + 1 }));
    });
  };

  const handleDayTemplate = (weekIndex: number, dow: number, templateId: number) => {
    setSchedule((prev) => {
      const next = [...prev];
      const week = { ...next[weekIndex], days: { ...next[weekIndex].days } };
      if (templateId === 0) {
        delete week.days[dow];
      } else {
        week.days[dow] = templateId;
      }
      next[weekIndex] = week;
      return next;
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    const payload: WorkoutPlanUpdate = {
      name: name.trim(),
      description: description.trim() || null,
      weeks: schedule.map((w) => ({
        week_number: w.week_number,
        name: w.name.trim() || null,
        days: Object.entries(w.days)
          .filter(([, tid]) => tid > 0)
          .map(([dow, tid]) => ({
            day_of_week: Number(dow),
            template_id: tid,
          })),
      })),
    };
    updateMutation.mutate(payload);
  };

  if (isLoading || !initialized) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-text-tertiary">Plan not found</p>
        <Link href="/plans" className="text-accent hover:underline mt-4 inline-block">
          ← Back to Plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/plans/${planId}`} className="text-text-muted hover:text-text-secondary">
          ← Back
        </Link>
        <h1 className="text-3xl font-bold text-text-primary">Edit Plan</h1>
      </div>

      <div className="bg-surface rounded-lg shadow p-6 space-y-6">
        {/* Name & Description */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Plan Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-surface text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full border border-border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-surface text-text-primary"
            />
          </div>
        </div>

        {/* Weeks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-text-secondary">Schedule</h2>
            <button
              onClick={addWeek}
              className="text-sm text-accent hover:underline"
            >
              + Add Week
            </button>
          </div>

          {schedule.length === 0 && (
            <p className="text-sm text-text-muted mb-3">
              No weeks yet. Add weeks to define your training cycle.
            </p>
          )}

          <div className="space-y-4">
            {schedule.map((week, wi) => (
              <div
                key={wi}
                className="border border-border rounded-lg p-4 relative"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-medium text-text-secondary">
                    Week {week.week_number}
                  </span>
                  <input
                    type="text"
                    value={week.name}
                    onChange={(e) =>
                      setSchedule((prev) => {
                        const next = [...prev];
                        next[wi] = { ...next[wi], name: e.target.value };
                        return next;
                      })
                    }
                    placeholder="Week label (optional)"
                    className="flex-1 border border-border-input rounded px-2 py-1 text-sm bg-surface text-text-primary placeholder-text-muted"
                  />
                  {schedule.length > 1 && (
                    <button
                      onClick={() => removeWeek(wi)}
                      className="text-error hover:text-error-text text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DAY_NAMES.map((dayName, dow) => (
                    <div key={dow} className="flex items-center gap-2">
                      <span className="text-sm text-text-tertiary w-8">
                        {DAY_SHORT[dow]}
                      </span>
                      <select
                        value={week.days[dow] ?? 0}
                        onChange={(e) =>
                          handleDayTemplate(wi, dow, Number(e.target.value))
                        }
                        className="flex-1 border border-border-input rounded px-2 py-1 text-sm bg-surface text-text-primary"
                      >
                        <option value={0}>— Rest Day —</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="w-full bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium disabled:opacity-50"
        >
          {updateMutation.isPending ? 'Saving...' : '✓ Save Changes'}
        </button>
      </div>
    </div>
  );
}
