'use client';

import { useState, useEffect } from 'react';

export default function InteractiveStats() {
  const [stats] = useState({
    totalUsers: 12847,
    codeSnippets: 89523,
    verifiedSnippets: 34289,
    activeToday: 2847
  });

  const [animatedStats, setAnimatedStats] = useState({
    totalUsers: 0,
    codeSnippets: 0,
    verifiedSnippets: 0,
    activeToday: 0
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation when component mounts
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const animate = (key, targetValue) => {
      let currentStep = 0;
      const increment = targetValue / steps;

      const timer = setInterval(() => {
        currentStep++;
        const currentValue = Math.min(Math.floor(increment * currentStep), targetValue);

        setAnimatedStats(prev => ({ ...prev, [key]: currentValue }));

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);

      return timer;
    };

    const timers = [
      animate('totalUsers', stats.totalUsers),
      animate('codeSnippets', stats.codeSnippets),
      animate('verifiedSnippets', stats.verifiedSnippets),
      animate('activeToday', stats.activeToday)
    ];

    return () => timers.forEach(timer => clearInterval(timer));
  }, [isVisible, stats]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const statsData = [
    {
      key: 'totalUsers',
      label: 'Active Developers',
      value: animatedStats.totalUsers,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-cyan-500',
      description: 'Growing community'
    },
    {
      key: 'codeSnippets',
      label: 'Code Snippets',
      value: animatedStats.codeSnippets,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      description: 'Shared & verified'
    },
    {
      key: 'verifiedSnippets',
      label: 'Expert Verified',
      value: animatedStats.verifiedSnippets,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-500',
      description: 'Quality guaranteed'
    },
    {
      key: 'activeToday',
      label: 'Active Today',
      value: animatedStats.activeToday,
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-500',
      description: 'Real-time activity'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <div
          key={stat.key}
          className={`group relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 transition-all duration-500 hover:transform hover:scale-105 shadow-lg hover:shadow-xl ${
            isVisible ? 'animate-slide-up' : 'opacity-0'
          }`}
          style={{
            animationDelay: `${index * 200}ms`,
            animationFillMode: 'forwards'
          }}
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {stat.icon}
          </div>

          {/* Stats */}
          <div className="relative z-10">
            <div className="flex items-baseline space-x-2 mb-2">
              <h3 className="text-3xl font-bold text-gray-900">
                {formatNumber(stat.value)}
              </h3>
              {stat.key === 'activeToday' && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="ml-1 text-xs text-green-600 font-medium">LIVE</span>
                </div>
              )}
            </div>
            <p className="text-lg font-semibold text-gray-700 mb-1">{stat.label}</p>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </div>

          {/* Hover Effect */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      ))}
    </div>
  );
}