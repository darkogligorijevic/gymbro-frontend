'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api';
import { Icons } from '@/components/Icons';
import { format } from 'date-fns';
import type { UserProfile } from '@/lib/types';
import Link from 'next/link';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const id = params.id as string;
  const isOwnProfile = currentUser?.id === id;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const getAvatarUrl = (avatarPath?: string) => {
    if (!avatarPath) return '/default-avatar.png';
    if (avatarPath.startsWith('http')) return avatarPath;
    return `${API_URL}${avatarPath}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await usersApi.getProfile(id);
        setProfile(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="card text-center py-12">
        <Icons.AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
        <p className="text-gray-400 mb-6">{error || 'User does not exist'}</p>
        <button onClick={() => router.push('/dashboard')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { user, stats, recentWorkouts } = profile;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-purple-600/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={user.avatarUrl ? `${API_URL}${user.avatarUrl}` : '/default-avatar.png'}
              alt={user.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary-500 shadow-2xl"
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-white">
                  {user.firstName || user.username}
                  {user.lastName && ` ${user.lastName}`}
                </h1>
                {isOwnProfile && (
                  <Link href="/settings" className="text-gray-400 hover:text-primary-500 transition">
                    <Icons.Settings className="w-6 h-6" />
                  </Link>
                )}
              </div>
              <p className="text-gray-400 text-lg mb-3">@{user.username}</p>
              <p className="text-gray-500">
                Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
              </p>
            </div>

            {isOwnProfile && (
              <Link href="/settings" className="btn-primary">
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card-hover group">
          <div className="bg-primary-500/10 rounded-2xl p-4 mb-4 inline-block group-hover:scale-110 transition-transform">
            <Icons.Trophy className="w-8 h-8 text-primary-500" />
          </div>
          <h3 className="text-gray-400 text-sm font-semibold mb-2">Total Workouts</h3>
          <p className="text-5xl font-bold text-white">{stats.totalWorkouts}</p>
        </div>

        <div className="card-hover group">
          <div className="bg-green-500/10 rounded-2xl p-4 mb-4 inline-block group-hover:scale-110 transition-transform">
            <Icons.Check className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-gray-400 text-sm font-semibold mb-2">Completed</h3>
          <p className="text-5xl font-bold text-white">{stats.completedWorkouts}</p>
        </div>

        <div className="card-hover group">
          <div className="bg-purple-500/10 rounded-2xl p-4 mb-4 inline-block group-hover:scale-110 transition-transform">
            <Icons.Fire className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-gray-400 text-sm font-semibold mb-2">This Week</h3>
          <p className="text-5xl font-bold text-white">{stats.thisWeekWorkouts}</p>
        </div>
      </div>

      {/* Personal Records */}
      {stats.topPRs.length > 0 && (
        <div className="card">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Icons.Trophy className="w-8 h-8 text-primary-500" />
            Personal Records
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {stats.topPRs.map((pr, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-primary-500/10 to-orange-500/10 rounded-xl p-4 border border-primary-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{pr.exerciseName}</h3>
                    <p className="text-gray-400 text-sm">
                      {format(new Date(pr.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-500">{pr.weight}</div>
                    <div className="text-sm text-gray-400">kg</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Favorite Exercises */}
      {stats.favoriteExercises.length > 0 && (
        <div className="card">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <Icons.Dumbbell className="w-8 h-8 text-primary-500" />
            Favorite Exercises
          </h2>
          
          <div className="space-y-3">
            {stats.favoriteExercises.map((exercise, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-dark-300 rounded-xl hover:bg-dark-200 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary-500/10 p-3 rounded-xl">
                    <Icons.Dumbbell className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{exercise.exerciseName}</h3>
                    <p className="text-gray-400 text-sm capitalize">
                      {exercise.muscleGroup.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-500">{exercise.count}</div>
                  <div className="text-sm text-gray-400">times</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Workouts */}
      <div className="card">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
          <Icons.Calendar className="w-8 h-8 text-primary-500" />
          Recent Activity
        </h2>

        {recentWorkouts.length === 0 ? (
          <div className="text-center py-12">
            <Icons.Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No recent workouts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className={`p-4 bg-dark-300 rounded-xl border border-dark-200 ${
                  isOwnProfile ? 'hover:border-primary-500/50 transition-all cursor-pointer' : ''
                }`}
                onClick={() => isOwnProfile && router.push(`/workouts/${workout.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      workout.isCompleted ? 'bg-green-500/10' : 'bg-primary-500/10'
                    }`}>
                      <Icons.Check className={`w-6 h-6 ${
                        workout.isCompleted ? 'text-green-500' : 'text-primary-500'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{workout.templateName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Icons.Calendar className="w-4 h-4" />
                          {format(new Date(workout.date), 'MMM dd, yyyy')}
                        </span>
                        {workout.duration && (
                          <span className="flex items-center gap-1">
                            <Icons.Clock className="w-4 h-4" />
                            {workout.duration} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {workout.isCompleted && (
                    <div className="badge bg-green-500/10 text-green-500 border border-green-500/30">
                      Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State for New Users */}
      {stats.totalWorkouts === 0 && (
        <div className="card text-center py-12 bg-gradient-to-br from-primary-600/10 to-purple-600/10">
          <Icons.Fire className="w-20 h-20 text-primary-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {isOwnProfile ? 'Start Your Fitness Journey!' : `${user.username} hasn't started yet`}
          </h3>
          <p className="text-gray-400 mb-6">
            {isOwnProfile 
              ? 'Begin tracking your workouts and watch your progress grow!' 
              : 'Check back later to see their progress'}
          </p>
          {isOwnProfile && (
            <Link href="/templates" className="btn-primary inline-block">
              <Icons.Lightning className="w-5 h-5 inline mr-2" />
              Start First Workout
            </Link>
          )}
        </div>
      )}
    </div>
  );
}