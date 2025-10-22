'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CommunityShowcase() {
  const [activeSnippet, setActiveSnippet] = useState(0);

  const featuredSnippets = [
    {
      id: 1,
      title: "Advanced React Hook for API Calls",
      author: "Sarah Chen",
      role: "Senior Developer",
      avatar: "SC",
      language: "React",
      code: `const useAPI = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(url, options);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};`,
      likes: 234,
      verified: true,
      category: "React",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Python Data Pipeline with Async",
      author: "Marcus Kim",
      role: "Lead Developer",
      avatar: "MK",
      language: "Python",
      code: `import asyncio
import aiohttp
from typing import List, Dict

async def process_data_batch(
    urls: List[str],
    batch_size: int = 10
) -> List[Dict]:
    results = []

    async with aiohttp.ClientSession() as session:
        for i in range(0, len(urls), batch_size):
            batch = urls[i:i + batch_size]
            tasks = [
                fetch_and_process(session, url)
                for url in batch
            ]
            batch_results = await asyncio.gather(*tasks)
            results.extend(batch_results)

    return results

async def fetch_and_process(session, url):
    async with session.get(url) as response:
        data = await response.json()
        return transform_data(data)`,
      likes: 189,
      verified: true,
      category: "Python",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      id: 3,
      title: "TypeScript Generic Utility Functions",
      author: "Elena Rodriguez",
      role: "Principal Engineer",
      avatar: "ER",
      language: "TypeScript",
      code: `type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

type NonNullable<T> = T extends null | undefined
  ? never
  : T;

const createTypeSafeUpdater = <T extends Record<string, any>>(
  initialState: T
) => {
  return (updates: DeepPartial<T>): T => {
    return {
      ...initialState,
      ...updates,
    };
  };
};

// Usage example
interface UserProfile {
  name: string;
  email: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

const updateUser = createTypeSafeUpdater<UserProfile>({
  name: 'John',
  email: 'john@example.com',
  preferences: { theme: 'light', notifications: true }
});`,
      likes: 312,
      verified: true,
      category: "TypeScript",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSnippet((prev) => (prev + 1) % featuredSnippets.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredSnippets.length]);

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full border border-purple-200 mb-6">
            <span className="text-purple-700 text-sm font-mono">// Community Spotlight</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Featured Code from Our Community
          </h2>
          <p className="text-xl text-gray-600">
            Discover amazing code snippets verified by expert developers
          </p>
        </div>

        {/* Featured Snippet Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Code Display */}
          <div className="order-2 lg:order-1">
            <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              {/* Code Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-gray-400 text-sm font-mono">
                    {featuredSnippets[activeSnippet].title.toLowerCase().replace(/\s+/g, '-')}.{featuredSnippets[activeSnippet].language.toLowerCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                    VERIFIED
                  </div>
                  <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium">
                    {featuredSnippets[activeSnippet].language}
                  </div>
                </div>
              </div>

              {/* Code Content */}
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm text-gray-100 font-mono leading-relaxed">
                  <code>{featuredSnippets[activeSnippet].code}</code>
                </pre>
              </div>

              {/* Code Footer */}
              <div className="px-6 py-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{featuredSnippets[activeSnippet].likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Copy</span>
                  </button>
                </div>
                <Link
                  href={`/snippets/${featuredSnippets[activeSnippet].id}`}
                  className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                >
                  View Full Snippet →
                </Link>
              </div>
            </div>
          </div>

          {/* Snippet Info and Navigation */}
          <div className="order-1 lg:order-2 space-y-6">
            {/* Current Snippet Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-16 h-16 bg-gradient-to-br ${featuredSnippets[activeSnippet].gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                  {featuredSnippets[activeSnippet].avatar}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {featuredSnippets[activeSnippet].title}
                  </h3>
                  <p className="text-gray-600">
                    by <span className="font-medium">{featuredSnippets[activeSnippet].author}</span>
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">{featuredSnippets[activeSnippet].role}</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                      <span className="text-sm text-green-600 font-medium">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span className="font-medium text-gray-900">{featuredSnippets[activeSnippet].likes}</span>
                  </div>
                  <div className={`px-3 py-1 bg-gradient-to-r ${featuredSnippets[activeSnippet].gradient} text-white rounded-full text-sm font-medium`}>
                    {featuredSnippets[activeSnippet].category}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center space-x-3">
              {featuredSnippets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSnippet(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeSnippet
                      ? 'bg-purple-500 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">99%</div>
                <div className="text-sm text-gray-600">Verified</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Community CTA */}
        <div className="text-center">
          <Link
            href="/snippets"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <span>Explore More Snippets</span>
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}