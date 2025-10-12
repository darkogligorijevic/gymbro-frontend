'use client';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWorkout } from '@/hooks/useWorkout';
import { useTemplates } from '@/hooks/useTemplates';
import Link from 'next/link';
import { format } from 'date-fns';
import { Icons } from '@/components/Icons';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeWorkout, workoutHistory, getActiveWorkout, fetchHistory } = useWorkout();
  const { templates, fetchTemplates } = useTemplates();

  useEffect(() => {
    getActiveWorkout();
    fetchHistory();
    fetchTemplates();
  }, []);

  const thisWeekWorkouts = workoutHistory.filter((w) => {
    const date = new Date(w.clockIn);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const stats = [
    {
      label: 'Total Workouts',
      value: workoutHistory.length,
      icon: <Icons.Trophy className="w-8 h-8" />,
      color: 'from-primary-500 to-orange-500',
      bgColor: 'bg-primary-500/10',
    },
    {
      label: 'Templates',
      value: templates.length,
      icon: <Icons.Target className="w-8 h-8" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'This Week',
      value: thisWeekWorkouts,
      icon: <Icons.Fire className="w-8 h-8" />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-orange-500 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gym-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Fire className="w-10 h-10 text-white animate-bounce-slow" />
            <h1 className="text-4xl md:text-5xl font-bold text-white text-shadow">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
          </div>
          <p className="text-white/90 text-lg md:text-xl mb-6">
            Ready to crush your goals today? Let's make it count! 💪
          </p>
          {!activeWorkout && (
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              <Icons.Lightning className="w-5 h-5" />
              Start New Workout
            </Link>
          )}
        </div>
      </div>

      {/* Active Workout Banner */}
      {activeWorkout && (
        <div className="card bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 animate-glow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white/90 font-semibold">ACTIVE WORKOUT</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {activeWorkout.workoutTemplate?.name || 'Custom Workout'}
              </h2>
              <p className="text-white/80">
                Started {format(new Date(activeWorkout.clockIn), 'h:mm a')}
              </p>
            </div>
            <Link
              href="/workout"
              className="btn-primary bg-white text-green-600 hover:bg-gray-100 whitespace-nowrap"
            >
              Continue Workout →
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card-hover group">
            <div className={`${stat.bgColor} rounded-2xl p-4 mb-4 inline-block group-hover:scale-110 transition-transform`}>
              <div className={`text-transparent bg-gradient-to-r ${stat.color} bg-clip-text`}>
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-semibold mb-2">{stat.label}</h3>
            <p className="text-5xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/templates" className="card-hover group">
          <div className="flex items-center gap-4">
            <div className="bg-primary-500/10 p-4 rounded-2xl group-hover:bg-primary-500/20 transition-colors">
              <Icons.Target className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Browse Templates</h3>
              <p className="text-gray-400">Start a structured workout</p>
            </div>
            <Icons.ArrowRight className="w-6 h-6 text-gray-400 ml-auto group-hover:text-primary-500 group-hover:translate-x-2 transition-all" />
          </div>
        </Link>

        <Link href="/exercises" className="card-hover group">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-4 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
              <Icons.Dumbbell className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Exercise Library</h3>
              <p className="text-gray-400">Explore all exercises</p>
            </div>
            <Icons.ArrowRight className="w-6 h-6 text-gray-400 ml-auto group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent Workouts */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icons.Calendar className="w-8 h-8 text-primary-500" />
            Recent Workouts
          </h2>
          <Link
            href="/workout"
            className="text-primary-500 hover:text-primary-400 transition flex items-center gap-2 font-semibold"
          >
            View All
            <Icons.ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="card text-center py-12">
            <Icons.Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">No workouts yet</p>
            <Link href="/templates" className="btn-primary inline-block">
              Start Your First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutHistory.slice(0, 5).map((workout) => (
              <div
                key={workout.id}
                className="card hover:border-primary-500/50 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-500/10 p-3 rounded-xl group-hover:bg-primary-500/20 transition-colors">
                      <Icons.Check className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {workout.workoutTemplate?.name || 'Custom Workout'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="w-4 h-4" />
                          {format(new Date(workout.clockIn), 'MMM dd, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Clock className="w-4 h-4" />
                          {workout.durationMinutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                  {workout.isWorkoutFinished && (
                    <div className="badge bg-green-500/10 text-green-500 border border-green-500/30">
                      <Icons.Check className="w-4 h-4 mr-1" />
                      Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Quote */}
      <div className="card bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 text-center">
        <Icons.Trophy className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <p className="text-xl md:text-2xl font-bold text-white mb-2">
          "The only bad workout is the one that didn't happen."
        </p>
        <p className="text-gray-400">Keep pushing forward! 💪</p>
      </div>
    </div>
  );
}