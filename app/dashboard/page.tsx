'use client';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkout } from '@/hooks/useWorkout';
import { useTemplates } from '@/hooks/useTemplates';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeWorkout, workoutHistory, getActiveWorkout, fetchHistory } = useWorkout();
  const { templates, fetchTemplates } = useTemplates();

  useEffect(() => {
    getActiveWorkout();
    fetchHistory();
    fetchTemplates();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Welcome back, {user?.firstName || user?.username}! 💪
        </h1>
        <p className="text-gray-400">Ready to crush your workout today?</p>
      </div>

      {activeWorkout && (
        <div className="bg-gradient-to-r from-primary to-orange-600 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-2">Active Workout</h2>
          <p className="text-white mb-4">
            {activeWorkout.workoutTemplate?.name || 'Custom Workout'}
          </p>
          <Link
            href="/workout"
            className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Continue Workout →
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Total Workouts</h3>
          <p className="text-4xl font-bold text-primary">{workoutHistory.length}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2">Templates</h3>
          <p className="text-4xl font-bold text-primary">{templates.length}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-2">This Week</h3>
          <p className="text-4xl font-bold text-primary">
            {workoutHistory.filter((w) => {
              const date = new Date(w.clockIn);
              const now = new Date();
              const diff = now.getTime() - date.getTime();
              return diff < 7 * 24 * 60 * 60 * 1000;
            }).length}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Recent Workouts</h2>
          <Link
            href="/workout"
            className="text-primary hover:text-orange-600 transition"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {workoutHistory.slice(0, 5).map((workout) => (
            <div
              key={workout.id}
              className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="text-white font-semibold">
                  {workout.workoutTemplate?.name || 'Custom Workout'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {format(new Date(workout.clockIn), 'MMM dd, yyyy')} •{' '}
                  {workout.durationMinutes} min
                </p>
              </div>
              <span className="text-green-500 text-sm">✓ Completed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}