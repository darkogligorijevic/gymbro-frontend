'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usersApi } from '@/lib/api';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import type { User } from '@/lib/types';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, checkAuth } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Desktop search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Mobile search
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileSearchResults, setMobileSearchResults] = useState<User[]>([]);
  const [showMobileSearchResults, setShowMobileSearchResults] = useState(false);
  const [isMobileSearching, setIsMobileSearching] = useState(false);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // user dropdown
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsHydrated(true), []);

  useEffect(() => {
    if (isHydrated) checkAuth();
  }, [isHydrated, checkAuth]);

  useEffect(() => {
    if (isHydrated && !user) router.push('/login');
  }, [isHydrated, user, router]);

  // Desktop Search functionality (debounced)
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const response = await usersApi.search(searchQuery);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Mobile Search functionality (debounced)
  useEffect(() => {
    const searchUsers = async () => {
      if (mobileSearchQuery.trim().length < 2) {
        setMobileSearchResults([]);
        return;
      }
      setIsMobileSearching(true);
      try {
        const response = await usersApi.search(mobileSearchQuery);
        setMobileSearchResults(response.data);
      } catch (error) {
        console.error('Mobile search error:', error);
        setMobileSearchResults([]);
      } finally {
        setIsMobileSearching(false);
      }
    };
    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [mobileSearchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchResults(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(target)) {
        setShowMobileSearchResults(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isHydrated || !user) return null;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <Icons.Fire className="w-5 h-5" /> },
    { href: '/exercises', label: 'Exercises', icon: <Icons.Dumbbell className="w-5 h-5" /> },
    { href: '/templates', label: 'Templates', icon: <Icons.Target className="w-5 h-5" /> },
    { href: '/workouts', label: 'Workouts', icon: <Icons.Lightning className="w-5 h-5" /> },
  ];

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
            {/* Desktop Search Bar */}
            <div className="hidden lg:block relative" ref={searchRef}>
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-64 pl-10 pr-4 py-2 bg-dark-300 text-white rounded-xl border-2 border-dark-200 focus:border-primary-500 focus:outline-none transition-all"
                />
              </div>

              {/* Desktop Search Results Dropdown */}
              {showSearchResults && (searchResults.length > 0 || isSearching || searchQuery.length >= 2) && (
                <div className="absolute top-full mt-2 w-full bg-dark-300 rounded-xl border border-dark-200 shadow-2xl max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/profile/${result.id}`}
                        onClick={() => {
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-dark-200 transition-colors border-b border-dark-200 last:border-b-0"
                      >
                        <img
                          src={result.avatarUrl ? `${API_URL}${result.avatarUrl}` : '/default-avatar.png'}
                          alt={result.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-white font-semibold">{result.username}</div>
                          {(result.firstName || result.lastName) && (
                            <div className="text-sm text-gray-400">
                              {result.firstName} {result.lastName}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">No users found</div>
                  )}
                </div>
              )}
            </div>

            {/* User dropdown (desktop) */}
            <div className="hidden sm:block relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-3 hover:bg-dark-300 px-3 py-2 rounded-xl transition-all"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
              >
                <img
                  src={user.avatarUrl ? `${API_URL}${user.avatarUrl}` : 'https://www.svgrepo.com/show/452030/avatar-default.svg'}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="text-right">
                  <div className="text-white font-semibold">
                    {user.firstName || user.username}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
                </svg>
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-dark-300 border border-dark-200 rounded-xl shadow-2xl overflow-hidden"
                >
                  <Link 
                    href={`/profile/${user.id}`} 
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-dark-200 transition-colors"
                    role="menuitem"
                  >
                    <Icons.User className="w-5 h-5 text-gray-300" />
                    <span className="text-white">My profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-dark-200 transition-colors"
                    role="menuitem"
                  >
                    <Icons.Settings className="w-5 h-5 text-gray-300" />
                    <span className="text-white">Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-red-400"
                    role="menuitem"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

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
            {/* Mobile Search - WITH FULL FUNCTIONALITY */}
            <div className="mb-4" ref={mobileSearchRef}>
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={mobileSearchQuery}
                  onChange={(e) => {
                    setMobileSearchQuery(e.target.value);
                    setShowMobileSearchResults(true);
                  }}
                  onFocus={() => setShowMobileSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2 bg-dark-300 text-white rounded-xl border-2 border-dark-200 focus:border-primary-500 focus:outline-none"
                />
              </div>

              {/* Mobile Search Results */}
              {showMobileSearchResults && (mobileSearchResults.length > 0 || isMobileSearching || mobileSearchQuery.length >= 2) && (
                <div className="mt-2 bg-dark-300 rounded-xl border border-dark-200 shadow-xl max-h-64 overflow-y-auto">
                  {isMobileSearching ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  ) : mobileSearchResults.length > 0 ? (
                    mobileSearchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/profile/${result.id}`}
                        onClick={() => {
                          setShowMobileSearchResults(false);
                          setMobileSearchQuery('');
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-dark-200 transition-colors border-b border-dark-200 last:border-b-0"
                      >
                        <img
                          src={result.avatarUrl ? `${API_URL}${result.avatarUrl}` : '/default-avatar.png'}
                          alt={result.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-white font-semibold">{result.username}</div>
                          {(result.firstName || result.lastName) && (
                            <div className="text-sm text-gray-400">
                              {result.firstName} {result.lastName}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">No users found</div>
                  )}
                </div>
              )}
            </div>

            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive ? 'bg-primary-500 text-white' : 'text-gray-400 hover:text-white hover:bg-dark-300'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Link 
              href={`/profile/${user.id}`} 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-dark-300 transition-all"
              role="menuitem"
            >
              <Icons.User className="w-5 h-5" />
              <span className="font-medium">My profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-dark-300 transition-all"
            >
              <Icons.Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>

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
  );
}