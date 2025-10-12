'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function Header() {

      const router = useRouter();
      const pathname = usePathname();
      const { user, logout, checkAuth } = useAuth();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
      useEffect(() => {
        checkAuth();
      }, [checkAuth]);
    
      useEffect(() => {
        if (!user) {
          router.push('/login');
        }
      }, [user, router]);
    
      if (!user) return null;
    
      const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: <Icons.Fire className="w-5 h-5" /> },
        { href: '/exercises', label: 'Exercises', icon: <Icons.Dumbbell className="w-5 h-5" /> },
        { href: '/templates', label: 'Templates', icon: <Icons.Target className="w-5 h-5" /> },
        { href: '/workout', label: 'Workout', icon: <Icons.Lightning className="w-5 h-5" /> },
      ];
  return (
    <nav className="glass border-b border-dark-200 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center gap-2 group">
                <Icons.Dumbbell className="w-8 h-8 text-primary-500 group-hover:rotate-12 transition-transform" />
                <span className="text-2xl font-bold gradient-text">Gymbro</span>
              </Link>
              
              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                          : 'text-gray-400 hover:text-white hover:bg-dark-300'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm text-gray-400">Welcome back,</div>
                <div className="text-white font-semibold">
                  {user.firstName || user.username}
                </div>
              </div>
              <button
                onClick={logout}
                className="hidden md:block bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-xl transition-all font-medium"
              >
                Logout
              </button>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dark-200 bg-dark-400">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-dark-300'
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>
  )
}
