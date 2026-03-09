'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/lib/api/services/analytics.service';
import { workoutsService } from '@/lib/api/services/workouts.service';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: analyticsService.getDashboard,
  });

  const { data: weeklyVolume, isLoading: volumeLoading } = useQuery({
    queryKey: ['weekly-volume'],
    queryFn: () => analyticsService.getWeeklyVolume(12),
  });

  const { data: personalRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['personal-records'],
    queryFn: analyticsService.getPersonalRecords,
  });

  const { data: muscleDistribution, isLoading: muscleLoading } = useQuery({
    queryKey: ['muscle-distribution', timeRange],
    queryFn: () => analyticsService.getMuscleDistribution(timeRange),
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => workoutsService.listExercises({ limit: 100 }),
  });

  const { data: exerciseProgress } = useQuery({
    queryKey: ['exercise-progress', selectedExercise, timeRange],
    queryFn: () =>
      selectedExercise
        ? analyticsService.getExerciseProgress(selectedExercise, timeRange)
        : null,
    enabled: !!selectedExercise,
  });

  const isLoading = dashboardLoading || volumeLoading || recordsLoading || muscleLoading;

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Analytics</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm text-text-secondary">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-border-input rounded-md text-text-primary bg-surface"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 6 months</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="text-sm text-text-secondary">Total Workouts</p>
          <p className="text-3xl font-bold text-text-primary">
            {dashboard?.total_workouts || 0}
          </p>
        </div>
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="text-sm text-text-secondary">Total Volume</p>
          <p className="text-3xl font-bold text-text-primary">
            {dashboard?.total_volume?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-text-tertiary">kg</p>
        </div>
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="text-sm text-text-secondary">Total Sets</p>
          <p className="text-3xl font-bold text-text-primary">
            {dashboard?.total_sets || 0}
          </p>
        </div>
        <div className="bg-surface rounded-lg shadow p-6">
          <p className="text-sm text-text-secondary">Total Reps</p>
          <p className="text-3xl font-bold text-text-primary">
            {dashboard?.total_reps || 0}
          </p>
        </div>
      </div>

      {/* Weekly Volume Chart */}
      <div className="bg-surface rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Weekly Volume Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyVolume || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week_start" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_volume" fill="#3B82F6" name="Volume (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Muscle Distribution */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Muscle Group Distribution</h2>
          {muscleDistribution && muscleDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={muscleDistribution}
                  dataKey="percentage"
                  nameKey="muscle_group"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.muscle_group}: ${entry.percentage.toFixed(1)}%`}
                  labelLine={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
                  style={{ fontSize: '14px', fontWeight: '600', fill: 'var(--color-text-primary)' }}
                >
                  {muscleDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-text-secondary text-center py-12">No data available</p>
          )}
        </div>
        {/* Personal Records */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Personal Records</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {personalRecords && personalRecords.length > 0 ? (
              personalRecords.slice(0, 10).map((record: any) => (
                <div
                  key={record.exercise_id}
                  className="flex justify-between items-center p-3 bg-surface-secondary rounded-lg"
                >
                  <div>
                    <p className="font-medium text-text-primary">{record.exercise_name}</p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(record.achieved_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">
                      {record.max_weight}
                      <span className="text-sm text-text-secondary"> kg</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-secondary text-center py-12">No records yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Progress */}
      <div className="bg-surface rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Exercise Progress</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Select Exercise
          </label>
          <select
            value={selectedExercise || ''}
            onChange={(e) => setSelectedExercise(Number(e.target.value) || null)}
            className="w-full md:w-96 px-3 py-2 border border-border-input rounded-md text-text-primary bg-surface"
          >
            <option value="">Choose an exercise...</option>
            {exercises?.map((exercise: any) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>

        {exerciseProgress ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-accent-surface p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Starting Weight</p>
                <p className="text-2xl font-bold text-text-primary">
                  {exerciseProgress.starting_weight} kg
                </p>
              </div>
              <div className="bg-success-surface p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Current Weight</p>
                <p className="text-2xl font-bold text-text-primary">
                  {exerciseProgress.current_weight} kg
                </p>
              </div>
              <div className="bg-info-surface p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Weight Gain</p>
                <p className="text-2xl font-bold text-success-text">
                  +{exerciseProgress.weight_gain} kg
                </p>
              </div>
              <div className="bg-warning-surface p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Total Workouts</p>
                <p className="text-2xl font-bold text-text-primary">
                  {exerciseProgress.total_workouts}
                </p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={exerciseProgress.data_points || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="workout_date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="max_weight"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="Max Weight (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Volume (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-text-secondary text-center py-12">
            Select an exercise to view progress
          </p>
        )}
      </div>
    </div>
  );
}
