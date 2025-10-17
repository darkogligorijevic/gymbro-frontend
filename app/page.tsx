'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const features = [
    {
      icon: <Icons.Dumbbell className="w-12 h-12" />,
      title: "Track Your Lifts",
      description: "Log every rep, set, and weight with precision"
    },
    {
      icon: <Icons.Target className="w-12 h-12" />,
      title: "Custom Templates",
      description: "Create personalized workout routines"
    },
    {
      icon: <Icons.Fire className="w-12 h-12" />,
      title: "Stay Motivated",
      description: "Monitor progress and crush your goals"
    },
    {
      icon: <Icons.Trophy className="w-12 h-12" />,
      title: "Track Progress",
      description: "Visualize your strength gains over time"
    }
  ];

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gym-pattern opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/10"></div>
      
      {/* Hero Section */}
      <div className="relative z-10">
        <nav className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <Link href={'/'} className="flex items-center gap-3">
              <Icons.Lightning className="w-10 h-10 text-primary-500" />
              <span className="text-3xl font-bold gradient-text">Gymbro</span>
            </Link>
            <div className=" hidden sm:flex gap-4">
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-6 py-2 mb-8">
              <Icons.Lightning className="w-5 h-5 text-primary-500" />
              <span className="text-primary-400 font-semibold">Your Personal Fitness Companion</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 text-shadow">
              Transform Your
              <span className="gradient-text"> Workout Game</span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Track every rep, monitor your progress, and achieve your fitness goals with the most intuitive gym tracking app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/register" className="btn-primary text-lg py-4 px-8 group">
                Start Training Free
                <Icons.ArrowRight className="w-5 h-5 inline ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="btn-secondary text-lg py-4 px-8">
                Sign In
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">100+</div>
                <div className="text-gray-400">Exercises</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">∞</div>
                <div className="text-gray-400">Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-500 mb-2">24/7</div>
                <div className="text-gray-400">Tracking</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-gray-400 text-lg">Powerful features designed for serious lifters</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="card-hover group px-6 py-8 rounded-2xl overflow-hidden border border-gray-800 hover:border-primary-500 transition-all shadow-md hover:shadow-primary-500/20">
                <div className="text-primary-500 mb-4 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-6 py-20">
          <div className="card bg-gradient-to-r from-primary-600 to-primary-500 text-center max-w-4xl mx-auto">
            <Icons.Fire className="w-16 h-16 text-white mx-auto mb-6 animate-bounce-slow" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/90 text-lg mb-8">
              Join thousands of athletes tracking their progress
            </p>
            <Link href="/register" className="inline-block bg-white text-primary-600 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105">
              Create Free Account
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 border-t border-dark-200">
          <div className="text-center text-gray-400">
            <p>© 2025 Gymbro. Built for athletes, by codilio.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}