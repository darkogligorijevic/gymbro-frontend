'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, logout, checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark">
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-2xl font-bold text-primary">
                💪 Gym Tracker
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/exercises"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition"
                >
                  Exercises
                </Link>
                <Link
                  href="/templates"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition"
                >
                  Templates
                </Link>
                <Link
                  href="/workout"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md transition"
                >
                  Workout
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">
                {user.firstName || user.username}
              </span>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}