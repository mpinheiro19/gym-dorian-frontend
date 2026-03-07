'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { workoutsService } from '@/lib/api/services/workouts.service';

export default function WorkoutsPage() {
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: '',
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['workout-sessions', dateFilter],
    queryFn: () => workoutsService.listSessions(dateFilter),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Workouts</h1>
        <Link
          href="/workouts/log"
          className="bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium"
        >
          + Log Workout
        </Link>
      </div>

      {/* Date Filters */}
      <div className="bg-surface rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Start Date
            </label>
            <input
              type="date"
                lang="pt-BR"
                placeholder="dd/mm/aaaa"
              value={dateFilter.start_date}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, start_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              End Date
            </label>
            <input
              type="date"
                lang="pt-BR"
                placeholder="dd/mm/aaaa"
              value={dateFilter.end_date}
              onChange={(e) =>
                setDateFilter({ ...dateFilter, end_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-border-input rounded-md bg-surface text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Workout Sessions List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading workouts...</p>
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session: any) => (
            <Link
              key={session.id}
              href={`/workouts/${session.id}`}
              className="block bg-surface rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {new Date(session.workout_date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  {session.duration_minutes && (
                    <p className="text-sm text-text-tertiary mt-1">
                      ⏱️ {session.duration_minutes} minutes
                    </p>
                  )}
                  {session.notes && (
                    <p className="text-sm text-text-tertiary mt-2">{session.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block bg-accent-surface text-accent-surface-text text-sm px-3 py-1 rounded-full">
                    {session.exercises_done?.length || 0} exercises
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-lg shadow">
          <p className="text-text-tertiary mb-4">No workouts logged yet</p>
          <Link
            href="/workouts/log"
            className="inline-block bg-accent hover:bg-accent-hover text-accent-fg px-6 py-3 rounded-md font-medium"
          >
            Log Your First Workout
          </Link>
        </div>
      )}
    </div>
  );
}
