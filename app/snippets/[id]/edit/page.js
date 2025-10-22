'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import CodeBlock from '../../../components/CodeBlock';

export default function EditSnippet({ params }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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

  // Fetch snippet data
  useEffect(() => {
    const fetchSnippet = async () => {
      try {
        const response = await fetch(`/api/snippets/${resolvedParams.id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Snippet not found');
          return;
        }

        const snippetData = data.snippet;
        setSnippet(snippetData);

        // Populate form with existing data
        setFormData({
          title: snippetData.title,
          description: snippetData.description,
          code: snippetData.code,
          language: snippetData.language,
          tags: snippetData.tags.join(', '),
          category: snippetData.category,
          difficulty: snippetData.difficulty,
          license: snippetData.license,
          isPrivate: snippetData.isPrivate
        });

        setError('');
      } catch (error) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [resolvedParams.id]);

  // Authentication and ownership check
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/auth/signin');
    if (snippet && session && snippet.author._id !== session.user.id) {
      router.push(`/snippets/${resolvedParams.id}`);
    }
  }, [session, status, snippet, router, resolvedParams.id]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/snippets" className="text-indigo-600 hover:text-indigo-700">
              ← Back to Snippets
            </Link>
          </div>
        </div>
      </div>
    );
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
    setSaving(true);
    setError('');

    try {
      // Process tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(`/api/snippets/${resolvedParams.id}`, {
        method: 'PUT',
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
      router.push(`/snippets/${resolvedParams.id}`);
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setSaving(false);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Snippet</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Update your code snippet
                </p>
              </div>
              <Link
                href={`/snippets/${resolvedParams.id}`}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Cancel
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                maxLength="200"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                name="description"
                id="description"
                required
                maxLength="1000"
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={formData.description}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Code */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Code *
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Code Input */}
                <div>
                  <textarea
                    name="code"
                    id="code"
                    required
                    rows={12}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Code Preview */}
                <div>
                  <div className="mt-1 border border-gray-300 rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 border-b border-gray-300">
                      <span className="text-xs font-medium text-gray-700">Preview</span>
                    </div>
                    <div className="h-[288px] overflow-auto">
                      {formData.code ? (
                        <CodeBlock
                          code={formData.code}
                          language={formData.language}
                          showCopyButton={false}
                          theme="light"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          Code preview will appear here
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language */}
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Programming Language *
                </label>
                <select
                  name="language"
                  id="language"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                  Difficulty Level *
                </label>
                <select
                  name="difficulty"
                  id="difficulty"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              {/* License */}
              <div>
                <label htmlFor="license" className="block text-sm font-medium text-gray-700">
                  License
                </label>
                <select
                  name="license"
                  id="license"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
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

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., react, hooks, api, frontend (comma-separated)"
                value={formData.tags}
                onChange={handleInputChange}
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate tags with commas
              </p>
            </div>

            {/* Private checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPrivate"
                id="isPrivate"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={formData.isPrivate}
                onChange={handleInputChange}
              />
              <label htmlFor="isPrivate" className="ml-2 block text-sm text-gray-700">
                Make this snippet private (only visible to you)
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href={`/snippets/${resolvedParams.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="group flex items-center space-x-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>💾</span>
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}