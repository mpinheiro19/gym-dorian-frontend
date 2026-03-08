'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { plansService } from '@/lib/api/services/plans.service';
import { templatesService } from '@/lib/api/services/templates.service';
import type { WorkoutPlanCreate, PlanWeekCreate, PlanDayCreate } from '@/types/api';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type Step = 1 | 2 | 3;

interface WeekDraft {
  week_number: number;
  name: string;
  days: Record<number, number>; // day_of_week → template_id
}

function buildPayload(
  name: string,
  description: string,
  weeks: WeekDraft[]
): WorkoutPlanCreate {
  return {
    name: name.trim(),
    description: description.trim() || null,
    weeks: weeks.map((w) => ({
      week_number: w.week_number,
      name: w.name.trim() || null,
      days: Object.entries(w.days)
        .filter(([, tid]) => tid > 0)
        .map(([dow, tid]) => ({
          day_of_week: Number(dow),
          template_id: tid,
        } as PlanDayCreate)),
    } as PlanWeekCreate)),
  };
}

export default function CreatePlanPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: weeks
  const [weekCount, setWeekCount] = useState(1);
  const [weekNames, setWeekNames] = useState<string[]>(['']);

  // Step 3: schedule per week
  const [schedule, setSchedule] = useState<WeekDraft[]>([
    { week_number: 1, name: '', days: {} },
  ]);

  const { data: templates = [] } = useQuery({
    queryKey: ['workout-templates'],
    queryFn: () => templatesService.listTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: plansService.createPlan,
    onSuccess: (plan) => {
      toast.success('Plan created successfully!');
      router.push(`/plans/${plan.id}`);
    },
    onError: () => toast.error('Failed to create plan'),
  });

  // ---- Step navigation ----
  const goToStep2 = () => {
    if (!name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    // Sync weekNames array to weekCount
    setWeekNames((prev) => {
      const next = [...prev];
      while (next.length < weekCount) next.push('');
      return next.slice(0, weekCount);
    });
    setStep(2);
  };

  const goToStep3 = () => {
    // Build schedule drafts preserving existing data
    setSchedule((prev) => {
      const next: WeekDraft[] = [];
      for (let i = 0; i < weekCount; i++) {
        next.push(
          prev[i] ?? { week_number: i + 1, name: weekNames[i] ?? '', days: {} }
        );
        next[i] = { ...next[i], name: weekNames[i] ?? '', week_number: i + 1 };
      }
      return next;
    });
    setStep(3);
  };

  const handleWeekCountChange = (n: number) => {
    const count = Math.max(1, Math.min(12, n));
    setWeekCount(count);
    setWeekNames((prev) => {
      const next = [...prev];
      while (next.length < count) next.push('');
      return next.slice(0, count);
    });
  };

  const handleDayTemplate = (
    weekIndex: number,
    day: number,
    templateId: number
  ) => {
    setSchedule((prev) => {
      const next = [...prev];
      const week = { ...next[weekIndex], days: { ...next[weekIndex].days } };
      if (templateId === 0) {
        delete week.days[day];
      } else {
        week.days[day] = templateId;
      }
      next[weekIndex] = week;
      return next;
    });
  };

  const handleSubmit = () => {
    const anyDay = schedule.some((w) => Object.keys(w.days).length > 0);
    if (!anyDay) {
      toast.error('Add at least one workout day to your plan');
      return;
    }
    const payload = buildPayload(name, description, schedule);
    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() =>
            step === 1
              ? router.push('/plans')
              : setStep((s) => (s - 1) as Step)
          }
          className="text-text-muted hover:text-text-secondary"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-text-primary">Create Workout Plan</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? 'bg-accent text-accent-fg'
                  : 'bg-surface-secondary text-text-muted'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-12 ${step > s ? 'bg-accent' : 'bg-surface-secondary'}`}
              />
            )}
          </div>
        ))}
        <div className="ml-2 text-sm text-text-muted">
          {step === 1 && 'Plan Details'}
          {step === 2 && 'Define Weeks'}
          {step === 3 && 'Schedule'}
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow p-6">
        {/* ---- STEP 1: Name & Description ---- */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Plan Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., PPL 6-day — Volume Block"
                className="w-full border border-border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-surface text-text-primary placeholder-text-muted"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this plan is for..."
                rows={3}
                className="w-full border border-border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-surface text-text-primary placeholder-text-muted"
              />
            </div>
            <button
              onClick={goToStep2}
              className="w-full bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium"
            >
              Next: Define Weeks →
            </button>
          </div>
        )}

        {/* ---- STEP 2: Week count & names ---- */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Number of Weeks in Cycle
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={weekCount}
                onChange={(e) => handleWeekCountChange(Number(e.target.value))}
                className="w-24 border border-border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent bg-surface text-text-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                The cycle repeats from your start date. Max 12 weeks.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-text-secondary">
                Week Labels (optional)
              </p>
              {Array.from({ length: weekCount }, (_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-text-muted w-20">Week {i + 1}</span>
                  <input
                    type="text"
                    value={weekNames[i] ?? ''}
                    onChange={(e) => {
                      const next = [...weekNames];
                      next[i] = e.target.value;
                      setWeekNames(next);
                    }}
                    placeholder="e.g., Heavy Week"
                    className="flex-1 border border-border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface text-text-primary placeholder-text-muted"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-border-input rounded-md px-4 py-2 font-medium hover:bg-surface-hover text-text-secondary"
              >
                ← Back
              </button>
              <button
                onClick={goToStep3}
                className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium"
              >
                Next: Schedule →
              </button>
            </div>
          </div>
        )}

        {/* ---- STEP 3: Schedule grid ---- */}
        {step === 3 && (
          <div className="space-y-6">
            <p className="text-sm text-text-tertiary">
              Assign a template to each training day. Leave blank for rest days.
            </p>

            {schedule.map((week, wi) => (
              <div key={wi} className="border border-border rounded-lg p-4">
                <h3 className="font-semibold text-text-secondary mb-3">
                  Week {week.week_number}
                  {week.name ? ` — ${week.name}` : ''}
                </h3>
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
                        className="flex-1 border border-border-input rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent bg-surface text-text-primary"
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

            {templates.length === 0 && (
              <div className="text-sm text-warning-text bg-warning-surface rounded-md p-3">
                ⚠️ No templates found. Create templates first to assign to days.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-border-input rounded-md px-4 py-2 font-medium hover:bg-surface-hover text-text-secondary"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || templates.length === 0}
                className="flex-1 bg-success hover:bg-success/90 text-accent-fg px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : '✓ Create Plan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
