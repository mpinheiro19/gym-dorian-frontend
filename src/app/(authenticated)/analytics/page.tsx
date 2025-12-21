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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-800">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm text-gray-800">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-900"
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
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-800">Total Workouts</p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboard?.total_workouts || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-800">Total Volume</p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboard?.total_volume?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-700">kg</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-800">Total Sets</p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboard?.total_sets || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-800">Total Reps</p>
          <p className="text-3xl font-bold text-gray-900">
            {dashboard?.total_reps || 0}
          </p>
        </div>
      </div>

      {/* Weekly Volume Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Volume Trend</h2>
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Muscle Group Distribution</h2>
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
                  label={(entry) => `${entry.muscle_group}: ${entry.percentage.toFixed(1)}%`}
                  labelLine={{ stroke: '#374151', strokeWidth: 1 }}
                  style={{ fontSize: '14px', fontWeight: '600', fill: '#1F2937' }}
                >
                  {muscleDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-800 text-center py-12">No data available</p>
          )}
        </div>
        {/* Personal Records */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Records</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {personalRecords && personalRecords.length > 0 ? (
              personalRecords.slice(0, 10).map((record: any) => (
                <div
                  key={record.exercise_id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{record.exercise_name}</p>
                    <p className="text-xs text-gray-700">
                      {new Date(record.achieved_date).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      {record.max_weight}
                      <span className="text-sm text-gray-800"> kg</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-800 text-center py-12">No records yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Exercise Progress</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Exercise
          </label>
          <select
            value={selectedExercise || ''}
            onChange={(e) => setSelectedExercise(Number(e.target.value) || null)}
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md text-gray-900"
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
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-800">Starting Weight</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exerciseProgress.starting_weight} kg
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-800">Current Weight</p>
                <p className="text-2xl font-bold text-gray-900">
                  {exerciseProgress.current_weight} kg
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-800">Weight Gain</p>
                <p className="text-2xl font-bold text-green-600">
                  +{exerciseProgress.weight_gain} kg
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-800">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900">
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
          <p className="text-gray-800 text-center py-12">
            Select an exercise to view progress
          </p>
        )}
      </div>
    </div>
  );
}
