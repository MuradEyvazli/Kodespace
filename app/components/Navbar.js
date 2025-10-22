'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const popupRef = useRef(null);

  // Fetch real-time stats when popup opens
  useEffect(() => {
    const fetchRealTimeStats = async () => {
      if (isProfilePopupOpen && session?.user?.id) {
        setIsLoadingStats(true);
        try {
          const response = await fetch(`/api/profile/${session.user.id}`);
          const data = await response.json();
          if (data.success) {
            setRealTimeStats(data.user.stats);
          }
        } catch (error) {
          console.error('Error fetching real-time stats:', error);
        } finally {
          setIsLoadingStats(false);
        }
      }
    };

    fetchRealTimeStats();
  }, [isProfilePopupOpen, session?.user?.id]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsProfilePopupOpen(false);
      }
    };

    if (isProfilePopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfilePopupOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const isActivePath = (path) => pathname === path;

  const getRoleInfo = (role) => {
    const roleMap = {
      'junior-developer': { name: 'Junior Developer', color: 'from-green-500 to-emerald-500' },
      'mid-level-developer': { name: 'Mid-Level Developer', color: 'from-blue-500 to-cyan-500' },
      'senior-developer': { name: 'Senior Developer', color: 'from-purple-500 to-pink-500' },
      'lead-developer': { name: 'Lead Developer', color: 'from-orange-500 to-red-500' },
      'principal-engineer': { name: 'Principal Engineer', color: 'from-indigo-500 to-purple-500' },
      'moderator': { name: 'Moderator', color: 'from-yellow-500 to-orange-500' },
      'admin': { name: 'Admin', color: 'from-red-500 to-pink-500' }
    };
    return roleMap[role] || roleMap['junior-developer'];
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent group-hover:animate-pulse">
                KODESPACE
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {session && (
              <>
                <Link
                  href="/dashboard"
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActivePath('/dashboard')
                      ? 'text-purple-700 bg-purple-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="relative z-10">Dashboard</span>
                  {isActivePath('/dashboard') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg"></div>
                  )}
                </Link>
                <Link
                  href="/snippets"
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActivePath('/snippets')
                      ? 'text-purple-700 bg-purple-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="relative z-10">Browse Code</span>
                  {isActivePath('/snippets') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg"></div>
                  )}
                </Link>
                <Link
                  href="/about"
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActivePath('/about')
                      ? 'text-purple-700 bg-purple-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="relative z-10">About</span>
                  {isActivePath('/about') && (
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg"></div>
                  )}
                </Link>
                <Link
                  href="/create-snippet"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:shadow-glow hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>New Snippet</span>
                </Link>
              </>
            )}

            {!session && (
              <Link
                href="/snippets"
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActivePath('/snippets')
                    ? 'text-purple-700 bg-purple-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="relative z-10">Explore</span>
                {isActivePath('/snippets') && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg"></div>
                )}
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-20 h-4 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-4 relative" ref={popupRef}>
                {/* User Info - Clickable */}
                <button
                  onClick={() => setIsProfilePopupOpen(!isProfilePopupOpen)}
                  className="hidden sm:flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-all duration-300"
                >
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{session.user.name}</div>
                    <div className="text-xs text-gray-600 capitalize">{getRoleInfo(session.user.role).name}</div>
                  </div>
                  <div className={`w-10 h-10 bg-gradient-to-br ${getRoleInfo(session.user.role).color} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-sm">
                      {session.user.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <svg className={`w-4 h-4 text-gray-600 transition-transform ${isProfilePopupOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Popup */}
                {isProfilePopupOpen && (
                  <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${getRoleInfo(session.user.role).color} p-6 text-white`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                          <span className="text-white font-bold text-2xl">
                            {session.user.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{session.user.name}</h3>
                          <p className="text-white/90 text-sm">{session.user.email}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-medium">
                          {getRoleInfo(session.user.role).name}
                        </div>
                        <div className="text-sm">
                          {isLoadingStats ? (
                            <div className="w-16 h-5 bg-white/20 animate-pulse rounded"></div>
                          ) : (
                            <>
                              <span className="font-semibold">{realTimeStats?.reputation || 0}</span>
                              <span className="text-white/80 ml-1">points</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-2">
                      {session.user.bio && (
                        <p className="text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                          {session.user.bio}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        {isLoadingStats ? (
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="text-center">
                                <div className="h-7 bg-gray-200 animate-pulse rounded mb-1"></div>
                                <div className="h-3 bg-gray-200 animate-pulse rounded"></div>
                              </div>
                            ))}
                          </div>
                        ) : realTimeStats ? (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="font-bold text-lg text-gray-900">{realTimeStats.snippetsShared || 0}</div>
                              <div className="text-xs text-gray-600">Snippets</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg text-gray-900">{realTimeStats.snippetsVerified || 0}</div>
                              <div className="text-xs text-gray-600">Verified</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg text-gray-900">{realTimeStats.verificationsMade || 0}</div>
                              <div className="text-xs text-gray-600">Reviews</div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="font-bold text-lg text-gray-900">0</div>
                              <div className="text-xs text-gray-600">Snippets</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg text-gray-900">0</div>
                              <div className="text-xs text-gray-600">Verified</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-lg text-gray-900">0</div>
                              <div className="text-xs text-gray-600">Reviews</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Skills Preview */}
                      {session.user.skills && session.user.skills.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-200">
                          <div className="text-xs font-medium text-gray-700 mb-2">Top Skills</div>
                          <div className="flex flex-wrap gap-1">
                            {session.user.skills.slice(0, 4).map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                            {session.user.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                +{session.user.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <Link
                        href={`/profile/${session.user.id}`}
                        onClick={() => setIsProfilePopupOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">View Profile</span>
                      </Link>

                      <Link
                        href="/profile/edit"
                        onClick={() => setIsProfilePopupOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Edit Profile</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setIsProfilePopupOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700">Dashboard</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsProfilePopupOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Logout Button - Keep for mobile */}
                <button
                  onClick={handleSignOut}
                  className="sm:hidden px-4 py-2 bg-gray-100 text-gray-700 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Join Us
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 mt-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/snippets"
                    className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Browse Code
                  </Link>
                  <Link
                    href="/create-snippet"
                    className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    New Snippet
                  </Link>
                </>
              ) : (
                <Link
                  href="/snippets"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Explore
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}