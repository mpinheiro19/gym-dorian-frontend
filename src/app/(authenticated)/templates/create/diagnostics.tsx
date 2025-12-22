'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workoutsService } from '@/lib/api/services/workouts.service';

/**
 * Diagnostic component to debug exercise loading
 * Add this temporarily to the create page
 */
export function ExerciseDiagnostics() {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ['exercises-debug'],
    queryFn: () => workoutsService.listExercises({ limit: 100 }),
  });

  useEffect(() => {
    console.group('🔍 Exercise Loading Diagnostics');
    console.log('Query State:', { isLoading, isError });
    console.log('Token:', localStorage.getItem('access_token') ? 'EXISTS' : 'MISSING');
    console.log('Exercises Count:', data?.length ?? 0);
    console.log('Exercises Data:', data);
    console.log('Error:', error);
    console.groupEnd();
  }, [data, isLoading, error, isError]);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
      <h3 className="font-semibold text-yellow-800 mb-2">🔍 Diagnostics</h3>
      <div className="text-sm space-y-1">
        <p>Loading: {isLoading ? '✅ Yes' : '❌ No'}</p>
        <p>Error: {isError ? '❌ Yes' : '✅ No'}</p>
        <p>Token: {typeof window !== 'undefined' && localStorage.getItem('access_token') ? '✅ Found' : '❌ Missing'}</p>
        <p>Exercises: {data?.length ?? 0} found</p>
        {error && (
          <p className="text-red-600">Error: {(error as any)?.message || 'Unknown error'}</p>
        )}
      </div>
    </div>
  );
}
