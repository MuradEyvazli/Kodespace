'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Snippets() {
  const { data: session } = useSession();
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    language: '',
    verified: '',
    difficulty: '',
    sortBy: 'newest',
    page: 1
  });

  const categories = [
    {
      value: '',
      label: 'All Categories',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" /></svg>
    },
    {
      value: 'algorithm',
      label: 'Algorithm',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    },
    {
      value: 'data-structure',
      label: 'Data Structure',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    },
    {
      value: 'web-development',
      label: 'Web Development',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
    },
    {
      value: 'mobile-development',
      label: 'Mobile Development',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" /></svg>
    },
    {
      value: 'api',
      label: 'API',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
    },
    {
      value: 'database',
      label: 'Database',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
    },
    {
      value: 'ui-component',
      label: 'UI Component',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" /></svg>
    },
    {
      value: 'utility',
      label: 'Utility',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    },
    {
      value: 'performance',
      label: 'Performance',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    },
    {
      value: 'security',
      label: 'Security',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    },
    {
      value: 'other',
      label: 'Other',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    }
  ];

  const languages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin'
  ];

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.language) params.append('language', filters.language);
      if (filters.verified) params.append('verified', filters.verified);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      params.append('page', filters.page.toString());
      params.append('limit', viewMode === 'grid' ? '12' : '8');

      const response = await fetch(`/api/snippets?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch snippets');
        return;
      }

      setSnippets(data.snippets);
      setPagination(data.pagination);
      setError('');
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [filters, viewMode]);

  useEffect(() => {
    fetchSnippets();
  }, [filters, fetchSnippets]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyInfo = (difficulty) => {
    const info = {
      beginner: { color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/20', textColor: 'text-green-300', icon: '🌱' },
      intermediate: { color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-300', icon: '⚡' },
      advanced: { color: 'from-red-500 to-pink-500', bgColor: 'bg-red-500/20', textColor: 'text-red-300', icon: '🔥' }
    };
    return info[difficulty] || info['beginner'];
  };

  const getRoleInfo = (role) => {
    const roleMap = {
      'junior-developer': { icon: '🌱', color: 'from-green-500 to-emerald-500', name: 'Junior' },
      'mid-level-developer': { icon: '⚡', color: 'from-blue-500 to-cyan-500', name: 'Mid-Level' },
      'senior-developer': { icon: '👑', color: 'from-purple-500 to-pink-500', name: 'Senior' },
      'lead-developer': { icon: '🎯', color: 'from-orange-500 to-red-500', name: 'Lead' },
      'principal-engineer': { icon: '🚀', color: 'from-indigo-500 to-purple-500', name: 'Principal' },
      'moderator': { icon: '🛡️', color: 'from-slate-500 to-slate-600', name: 'Moderator' }
    };
    return roleMap[role] || roleMap['junior-developer'];
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="relative mb-12">
          {/* Background Decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 rounded-3xl backdrop-blur-sm"></div>
          <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"></div>
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl"></div>

          <div className="relative bg-white rounded-3xl p-8 border border-gray-200 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-8 lg:mb-0">
                {/* Main Title */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                      ✓
                    </div>
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent mb-2">
                      Code Gallery
                    </h1>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200">
                        ✨ Premium Collection
                      </span>
                      <span className="px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                        🚀 Production Ready
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 text-lg font-medium mb-2 max-w-2xl">
                  Discover, learn, and contribute to the world's most innovative code snippets
                </p>
                <p className="text-gray-600 text-base max-w-2xl">
                  Curated by developers, for developers. Find battle-tested solutions and share your expertise with the community.
                </p>

                {/* Stats Row */}
                <div className="flex items-center space-x-6 mt-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📊</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">{pagination.total || 0}+</div>
                      <div className="text-gray-600 text-xs">Snippets</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">👥</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">50K+</div>
                      <div className="text-gray-600 text-xs">Developers</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">⚡</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">24/7</div>
                      <div className="text-gray-600 text-xs">Updated</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 glass rounded-xl p-1 border border-gray-300">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow scale-105'
                        : 'text-gray-600 hover:text-white hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="hidden sm:block text-sm font-medium">Grid</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow scale-105'
                        : 'text-gray-600 hover:text-white hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    <span className="hidden sm:block text-sm font-medium">List</span>
                  </button>
                </div>

                {session && (
                  <Link
                    href="/create-snippet"
                    className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-glow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-3">
                      <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <span>Create Snippet</span>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="glass-strong rounded-3xl p-8 mb-8 border border-purple-500/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Smart Filters</h3>
              <p className="text-gray-600 text-sm">Find exactly what you're looking for</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Query</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-purple-400 transition-colors duration-300">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search snippets, tags, or authors..."
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-300 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-gray-400 shadow-sm"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-12 py-4 bg-white border-2 border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-gray-400 appearance-none cursor-pointer shadow-sm"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-white text-gray-900 py-2">
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-12 py-4 bg-white border-2 border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-gray-400 appearance-none cursor-pointer shadow-sm"
                  value={filters.language}
                  onChange={(e) => handleFilterChange('language', e.target.value)}
                >
                  <option value="" className="bg-white text-gray-900">💻 All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang} className="bg-white text-gray-900">{lang}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-12 py-4 bg-white border-2 border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-gray-400 appearance-none cursor-pointer shadow-sm"
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                >
                  <option value="" className="bg-white text-gray-900">📊 All Levels</option>
                  <option value="beginner" className="bg-white text-gray-900">🌱 Beginner</option>
                  <option value="intermediate" className="bg-white text-gray-900">⚡ Intermediate</option>
                  <option value="advanced" className="bg-white text-gray-900">🔥 Advanced</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <div className="relative">
                <select
                  className="w-full pl-4 pr-12 py-4 bg-white border-2 border-gray-300 rounded-2xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-gray-400 appearance-none cursor-pointer shadow-sm"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="newest" className="bg-white text-gray-900">📅 Newest First</option>
                  <option value="popular" className="bg-white text-gray-900">🔥 Most Popular</option>
                  <option value="mostLiked" className="bg-white text-gray-900">❤️ Most Liked</option>
                  <option value="verified" className="bg-white text-gray-900">✅ Verified Only</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <span className="text-gray-800 text-sm font-medium">Quick Filters</span>
            </div>
            <div className="flex flex-wrap gap-3 w-full">
              <button
                onClick={() => handleFilterChange('verified', filters.verified === 'true' ? '' : 'true')}
                className={`group relative px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 overflow-hidden ${
                  filters.verified === 'true'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-2 border-emerald-500/40 shadow-glow scale-105'
                    : 'bg-slate-800/40 text-gray-600 border-2 border-slate-700/50 hover:bg-slate-700/60 hover:text-white hover:border-emerald-500/30 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    filters.verified === 'true' ? 'bg-emerald-500/30' : 'bg-slate-700/50 group-hover:bg-emerald-500/20'
                  }`}>
                    <svg className={`w-4 h-4 ${filters.verified === 'true' ? 'text-emerald-200' : 'text-gray-600 group-hover:text-emerald-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span>Verified Only</span>
                  {filters.verified === 'true' && (
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleFilterChange('difficulty', filters.difficulty === 'beginner' ? '' : 'beginner')}
                className={`group relative px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 overflow-hidden ${
                  filters.difficulty === 'beginner'
                    ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-2 border-green-500/40 shadow-glow scale-105'
                    : 'bg-slate-800/40 text-gray-600 border-2 border-slate-700/50 hover:bg-slate-700/60 hover:text-white hover:border-green-500/30 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    filters.difficulty === 'beginner' ? 'bg-green-500/30' : 'bg-slate-700/50 group-hover:bg-green-500/20'
                  }`}>
                    <svg className={`w-4 h-4 ${filters.difficulty === 'beginner' ? 'text-green-200' : 'text-gray-600 group-hover:text-green-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span>Beginner Friendly</span>
                  {filters.difficulty === 'beginner' && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleFilterChange('sortBy', filters.sortBy === 'popular' ? 'newest' : 'popular')}
                className={`group relative px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 overflow-hidden ${
                  filters.sortBy === 'popular'
                    ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-2 border-orange-500/40 shadow-glow scale-105'
                    : 'bg-slate-800/40 text-gray-600 border-2 border-slate-700/50 hover:bg-slate-700/60 hover:text-white hover:border-orange-500/30 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    filters.sortBy === 'popular' ? 'bg-orange-500/30' : 'bg-slate-700/50 group-hover:bg-orange-500/20'
                  }`}>
                    <svg className={`w-4 h-4 ${filters.sortBy === 'popular' ? 'text-orange-200' : 'text-gray-600 group-hover:text-orange-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span>Trending</span>
                  {filters.sortBy === 'popular' && (
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleFilterChange('sortBy', filters.sortBy === 'mostLiked' ? 'newest' : 'mostLiked')}
                className={`group relative px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 overflow-hidden ${
                  filters.sortBy === 'mostLiked'
                    ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-2 border-pink-500/40 shadow-glow scale-105'
                    : 'bg-slate-800/40 text-gray-600 border-2 border-slate-700/50 hover:bg-slate-700/60 hover:text-white hover:border-pink-500/30 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    filters.sortBy === 'mostLiked' ? 'bg-pink-500/30' : 'bg-slate-700/50 group-hover:bg-pink-500/20'
                  }`}>
                    <svg className={`w-4 h-4 ${filters.sortBy === 'mostLiked' ? 'text-pink-200' : 'text-gray-600 group-hover:text-pink-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span>Most Loved</span>
                  {filters.sortBy === 'mostLiked' && (
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>

              <button
                onClick={() => handleFilterChange('difficulty', filters.difficulty === 'advanced' ? '' : 'advanced')}
                className={`group relative px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center space-x-3 overflow-hidden ${
                  filters.difficulty === 'advanced'
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-2 border-red-500/40 shadow-glow scale-105'
                    : 'bg-slate-800/40 text-gray-600 border-2 border-slate-700/50 hover:bg-slate-700/60 hover:text-white hover:border-red-500/30 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    filters.difficulty === 'advanced' ? 'bg-red-500/30' : 'bg-slate-700/50 group-hover:bg-red-500/20'
                  }`}>
                    <svg className={`w-4 h-4 ${filters.difficulty === 'advanced' ? 'text-red-200' : 'text-gray-600 group-hover:text-red-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <span>Expert Level</span>
                  {filters.difficulty === 'advanced' && (
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <div className="glass-strong rounded-2xl p-6 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {pagination.total || 0}
                  </div>
                  <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Code Snippets</div>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white group-hover:text-red-300 transition-colors">
                    1.2K
                  </div>
                  <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Upvotes</div>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {Math.floor((pagination.total || 0) * 0.6)}
                  </div>
                  <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Verified</div>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-6 border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4H5a2 2 0 00-2 2v4.01M17 4h2a2 2 0 012 2v4.01M3 10.01V19a2 2 0 002 2h3.5M21 10.01V19a2 2 0 01-2 2H10M8 21h8" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white group-hover:text-orange-300 transition-colors">
                    847
                  </div>
                  <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Saved</div>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    24.5K
                  </div>
                  <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Analytics</div>
                </div>
              </div>
            </div>

            <div className="glass-strong rounded-2xl p-6 border border-gradient-to-r from-yellow-500/20 to-orange-500/20 hover:border-yellow-500/40 transition-all duration-300 group hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    ELITE
                  </div>
                  <div className="text-gray-600 text-sm font-medium uppercase tracking-wide">Tier</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Info */}
        {!loading && !error && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 glass rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <div className="text-white font-semibold">
                  Showing {snippets.length} of {pagination.total || 0} snippets
                </div>
                <div className="text-gray-600 text-sm">
                  {viewMode === 'grid' ? 'Grid View' : 'List View'} • {filters.sortBy.charAt(0).toUpperCase() + filters.sortBy.slice(1)} Sort
                </div>
              </div>
            </div>

            {(filters.search || filters.category || filters.language || filters.verified || filters.difficulty) && (
              <button
                onClick={() => setFilters({ search: '', category: '', language: '', verified: '', difficulty: '', sortBy: 'newest', page: 1 })}
                className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 rounded-xl border border-red-500/30 hover:bg-gradient-to-r hover:from-red-500/30 hover:to-pink-500/30 hover:border-red-500/50 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium">Clear Filters</span>
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-purple-500 mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                KODESPACE
              </h3>
              <p className="text-gray-600 font-medium animate-pulse">Discovering amazing code snippets...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-strong rounded-2xl p-6 mb-8 border border-red-500/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-red-300 font-medium">Something went wrong</h3>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Snippets Display */}
        {!loading && !error && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
                {snippets.map((snippet) => {
                  const difficultyInfo = getDifficultyInfo(snippet.difficulty);
                  const roleInfo = getRoleInfo(snippet.author.role);

                  return (
                    <div key={snippet._id} className="card hover-lift group">
                      <div className="relative">
                        {snippet.isVerified && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm z-10 shadow-glow">
                            ✓
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                              <Link href={`/snippets/${snippet._id}`}>
                                {snippet.title}
                              </Link>
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {snippet.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 rounded-lg bg-slate-700/50 text-gray-700 text-sm font-medium">
                            {snippet.language}
                          </span>
                          <span className={`px-3 py-1 rounded-lg ${difficultyInfo.bgColor} ${difficultyInfo.textColor} text-sm font-medium flex items-center space-x-1`}>
                            <span>{difficultyInfo.icon}</span>
                            <span className="capitalize">{snippet.difficulty}</span>
                          </span>
                          {snippet.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm">
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <Link href={`/profile/${snippet.author._id}`} className="flex items-center space-x-3 group">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleInfo.color} flex items-center justify-center text-sm font-bold text-white group-hover:scale-110 transition-transform`}>
                              {roleInfo.icon}
                            </div>
                            <div>
                              <div className="text-gray-900 text-sm font-medium group-hover:text-purple-600 transition-colors">{snippet.author.name}</div>
                              <div className="text-gray-600 text-xs">{roleInfo.name}</div>
                            </div>
                          </Link>
                          <div className="text-gray-600 text-xs">
                            {formatDate(snippet.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1 text-gray-600">
                              <span>👀</span>
                              <span>{snippet.usage?.views || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-gray-600">
                              <span>❤️</span>
                              <span>{snippet.usage?.likes || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-gray-600">
                              <span>🔖</span>
                              <span>{snippet.usage?.bookmarks || 0}</span>
                            </span>
                          </div>
                          <Link
                            href={`/snippets/${snippet._id}`}
                            className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-300 flex items-center space-x-1"
                          >
                            <span>View</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6 mb-12">
                {snippets.map((snippet) => {
                  const difficultyInfo = getDifficultyInfo(snippet.difficulty);
                  const roleInfo = getRoleInfo(snippet.author.role);

                  return (
                    <div key={snippet._id} className="card hover-lift">
                      <div className="flex items-start space-x-6">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors duration-300">
                                  <Link href={`/snippets/${snippet._id}`}>
                                    {snippet.title}
                                  </Link>
                                </h3>
                                {snippet.isVerified && (
                                  <span className="px-2 py-1 rounded-lg bg-green-500/20 text-green-300 text-xs font-medium flex items-center space-x-1">
                                    <span>✓</span>
                                    <span>Verified</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {snippet.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 rounded-lg bg-slate-700/50 text-gray-700 text-sm font-medium">
                              {snippet.language}
                            </span>
                            <span className={`px-3 py-1 rounded-lg ${difficultyInfo.bgColor} ${difficultyInfo.textColor} text-sm font-medium flex items-center space-x-1`}>
                              <span>{difficultyInfo.icon}</span>
                              <span className="capitalize">{snippet.difficulty}</span>
                            </span>
                            {snippet.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-sm">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Link href={`/profile/${snippet.author._id}`} className="flex items-center space-x-3 group">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleInfo.color} flex items-center justify-center text-sm font-bold text-white group-hover:scale-110 transition-transform`}>
                                  {roleInfo.icon}
                                </div>
                                <div>
                                  <div className="text-gray-900 text-sm font-medium group-hover:text-purple-600 transition-colors">{snippet.author.name}</div>
                                  <div className="text-gray-600 text-xs">{roleInfo.name} • {formatDate(snippet.createdAt)}</div>
                                </div>
                              </Link>

                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center space-x-1 text-gray-600">
                                  <span>👀</span>
                                  <span>{snippet.usage?.views || 0}</span>
                                </span>
                                <span className="flex items-center space-x-1 text-gray-600">
                                  <span>❤️</span>
                                  <span>{snippet.usage?.likes || 0}</span>
                                </span>
                                <span className="flex items-center space-x-1 text-gray-600">
                                  <span>🔖</span>
                                  <span>{snippet.usage?.bookmarks || 0}</span>
                                </span>
                              </div>
                            </div>

                            <Link
                              href={`/snippets/${snippet._id}`}
                              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-glow hover:scale-105 transition-all duration-300"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="px-4 py-2 rounded-lg bg-slate-800/50 text-gray-700 border border-slate-600 hover:bg-gray-100 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let page;
                    if (pagination.pages <= 5) {
                      page = i + 1;
                    } else if (filters.page <= 3) {
                      page = i + 1;
                    } else if (filters.page >= pagination.pages - 2) {
                      page = pagination.pages - 4 + i;
                    } else {
                      page = filters.page - 2 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                          page === filters.page
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow'
                            : 'bg-slate-800/50 text-gray-700 border border-slate-600 hover:bg-gray-100 hover:text-white'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(pagination.pages, filters.page + 1))}
                    disabled={filters.page === pagination.pages}
                    className="px-4 py-2 rounded-lg bg-slate-800/50 text-gray-700 border border-slate-600 hover:bg-gray-100 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {snippets.length === 0 && (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-6xl">
                  🔍
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No snippets found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find any snippets matching your criteria. Try adjusting your filters or search terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setFilters({ search: '', category: '', language: '', verified: '', difficulty: '', sortBy: 'newest', page: 1 })}
                    className="px-6 py-3 bg-slate-700/50 text-gray-700 rounded-xl border border-slate-600 hover:bg-slate-600/50 hover:text-white transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                  {session && (
                    <Link
                      href="/create-snippet"
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-glow hover:scale-105 transition-all duration-300"
                    >
                      Share First Snippet
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}