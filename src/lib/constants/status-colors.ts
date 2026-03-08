import type { PlanStatus } from '@/types/api';

/** Tailwind token classes for each plan status badge. */
export const STATUS_COLORS: Record<PlanStatus, string> = {
  active: 'bg-success-surface text-success-text',
  queued: 'bg-accent-surface text-accent-surface-text',
  paused: 'bg-warning-surface text-warning-text',
  completed: 'bg-surface-secondary text-text-secondary',
  archived: 'bg-error-surface text-error-text',
};
