'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import CodeBlock from '../components/CodeBlock';

export default function CreateSnippet() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    tags: '',
    category: 'utility',
    difficulty: 'beginner',
    license: 'MIT',
    isPrivate: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/signin');
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Process tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch('/api/snippets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // Success - redirect to snippet detail page
      router.push(`/snippets/${data.snippet._id}`);
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const languages = [
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go',
    'rust', 'typescript', 'swift', 'kotlin', 'dart', 'html', 'css',
    'sql', 'bash', 'powershell', 'dockerfile', 'yaml', 'json', 'xml'
  ];

  const categories = [
    { value: 'algorithm', label: 'Algorithm' },
    { value: 'data-structure', label: 'Data Structure' },
    { value: 'web-development', label: 'Web Development' },
    { value: 'mobile-development', label: 'Mobile Development' },
    { value: 'api', label: 'API' },
    { value: 'database', label: 'Database' },
    { value: 'ui-component', label: 'UI Component' },
    { value: 'utility', label: 'Utility' },
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'other', label: 'Other' }
  ];

  const licenses = [
    'MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC', 'Public Domain'
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
              Create New Snippet
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Share your code with the developer community and contribute to the collective knowledge
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Snippet Details</h2>
                <p className="text-sm text-gray-600">Fill in the information about your code snippet</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-2">
                Snippet Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                maxLength="200"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., React Custom Hook for API Calls"
                value={formData.title}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Choose a clear, descriptive title for your code snippet
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                id="description"
                required
                maxLength="1000"
                rows={4}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                placeholder="Describe what your code does, its purpose, and how other developers can use it..."
                value={formData.description}
                onChange={handleInputChange}
              />
              <div className="mt-2 flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Provide a detailed description to help other developers understand your code
                </p>
                <span className="text-xs text-gray-400">
                  {formData.description.length}/1000
                </span>
              </div>
            </div>

            {/* Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-semibold text-gray-800 mb-2">
                Source Code *
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Code Input */}
                <div>
                  <div className="relative">
                    <textarea
                      name="code"
                      id="code"
                      required
                      rows={14}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 font-mono text-sm resize-none"
                      placeholder="// Paste your code here
const example = () => {
  return 'Hello, KODESPACE!';
};"
                      value={formData.code}
                      onChange={handleInputChange}
                    />
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                        {formData.language}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Code Preview */}
                <div>
                  <div className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-800">Live Preview</span>
                      </div>
                    </div>
                    <div className="h-[336px] overflow-auto">
                      {formData.code ? (
                        <CodeBlock
                          code={formData.code}
                          language={formData.language}
                          showCopyButton={false}
                          theme="light"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                          <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                          </svg>
                          <span>Your code preview will appear here</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Write clean, well-documented code that other developers can easily understand and learn from
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Snippet Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language */}
                <div>
                  <label htmlFor="language" className="block text-sm font-semibold text-gray-800 mb-2">
                    Programming Language *
                  </label>
                  <select
                    name="language"
                    id="language"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    value={formData.language}
                    onChange={handleInputChange}
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-gray-800 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    id="category"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label htmlFor="difficulty" className="block text-sm font-semibold text-gray-800 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty"
                    id="difficulty"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="beginner">🌱 Beginner</option>
                    <option value="intermediate">⚡ Intermediate</option>
                    <option value="advanced">🚀 Advanced</option>
                  </select>
                </div>

                {/* License */}
                <div>
                  <label htmlFor="license" className="block text-sm font-semibold text-gray-800 mb-2">
                    License
                  </label>
                  <select
                    name="license"
                    id="license"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    value={formData.license}
                    onChange={handleInputChange}
                  >
                    {licenses.map((license) => (
                      <option key={license} value={license}>
                        {license}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-semibold text-gray-800 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                placeholder="e.g., react, hooks, api, frontend, typescript (comma-separated)"
                value={formData.tags}
                onChange={handleInputChange}
              />
              <p className="mt-2 text-xs text-gray-500">
                Add relevant tags to help other developers find your snippet (separate with commas)
              </p>
            </div>

            {/* Visibility Settings */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Visibility Settings
              </h3>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="isPrivate"
                  id="isPrivate"
                  className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  checked={formData.isPrivate}
                  onChange={handleInputChange}
                />
                <div className="flex-1">
                  <label htmlFor="isPrivate" className="block text-sm font-medium text-gray-800">
                    Make this snippet private
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
                    Private snippets are only visible to you and won't appear in public searches
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Submit buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </div>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 border border-transparent rounded-xl hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300"
              >
                <div className="flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Publishing snippet...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                      Share with Community
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}