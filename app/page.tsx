'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-secondary to-dark">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-white mb-4">💪 Gym Tracker</h1>
        <p className="text-xl text-gray-300 mb-8">
          Track your workouts, build strength, achieve goals
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-white hover:bg-gray-100 text-dark px-8 py-3 rounded-lg font-semibold transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
