'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import CodeBlock from '../../components/CodeBlock';

export default function SnippetDetail({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [snippet, setSnippet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Verification state
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);

  const fetchSnippet = useCallback(async () => {
    try {
      const response = await fetch(`/api/snippets/${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Snippet not found');
        return;
      }

      setSnippet(data.snippet);
      setError('');
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchSnippet();
  }, [resolvedParams.id, fetchSnippet]);

  const handleLike = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch(`/api/snippets/${resolvedParams.id}/like`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh snippet data
        fetchSnippet();
      }
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    try {
      const response = await fetch(`/api/snippets/${resolvedParams.id}/bookmark`, {
        method: 'POST',
      });

      if (response.ok) {
        // Refresh snippet data
        fetchSnippet();
      }
    } catch (error) {
      console.error('Bookmark error:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await fetch(`/api/snippets/${resolvedParams.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchSnippet(); // Refresh to show new comment
      }
    } catch (error) {
      console.error('Comment error:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!session) return;

    setVerificationLoading(true);
    try {
      const response = await fetch(`/api/snippets/${resolvedParams.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: verificationNotes }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationNotes('');
        fetchSnippet(); // Refresh to show verification
      } else {
        alert(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleRemoveVerification = async () => {
    if (!session) return;

    if (!confirm('Are you sure you want to remove verification?')) return;

    try {
      const response = await fetch(`/api/snippets/${resolvedParams.id}/verify`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSnippet(); // Refresh to show changes
      }
    } catch (error) {
      console.error('Remove verification error:', error);
    }
  };

  const handleEdit = () => {
    router.push(`/snippets/${resolvedParams.id}/edit`);
  };

  const handleDelete = async () => {
    if (!session) return;

    if (!confirm('Are you sure you want to delete this snippet? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/snippets/${resolvedParams.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/snippets');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete snippet');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong while deleting');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      alert('Code copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getRoleColor = (role) => {
    const colors = {
      'junior-developer': 'bg-green-100 text-green-800',
      'mid-level-developer': 'bg-blue-100 text-blue-800',
      'senior-developer': 'bg-purple-100 text-purple-800',
      'lead-developer': 'bg-orange-100 text-orange-800',
      'principal-engineer': 'bg-red-100 text-red-800',
      'moderator': 'bg-gray-100 text-gray-800',
      'admin': 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const canVerify = session && ['senior-developer', 'lead-developer', 'principal-engineer', 'moderator', 'admin'].includes(session.user.role);
  const canRemoveVerification = session && snippet && (
    (snippet.verifiedBy && snippet.verifiedBy._id === session.user.id) ||
    ['lead-developer', 'principal-engineer', 'moderator', 'admin'].includes(session.user.role)
  );

  const isOwner = session && snippet && snippet.author._id === session.user.id;
  const isLiked = session && snippet && snippet.likedBy.includes(session.user.id);
  const isBookmarked = session && snippet && snippet.bookmarkedBy.includes(session.user.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16">
        <Navbar />
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
            <p className="text-gray-600 font-medium animate-pulse">Loading snippet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-16">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Snippet Not Found</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/snippets" className="text-purple-600 hover:text-purple-700">
              ← Back to Snippets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">
      <Navbar />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{snippet.title}</h1>
                  {snippet.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <Link
                    href={`/profile/${snippet.author._id}`}
                    className="flex items-center group hover:bg-gray-50 px-2 py-1 rounded-lg transition-all duration-300"
                  >
                    <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-medium mr-2 group-hover:scale-110 transition-transform">
                      <span className="text-white">{snippet.author.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium group-hover:text-purple-600 transition-colors">{snippet.author.name}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getRoleColor(snippet.author.role)}`}>
                      {snippet.author.role.replace('-', ' ')}
                    </span>
                  </Link>
                  <span>•</span>
                  <span>{formatDate(snippet.createdAt)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {snippet.language}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getDifficultyColor(snippet.difficulty)}`}>
                    {snippet.difficulty}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {snippet.category.replace('-', ' ')}
                  </span>
                  {snippet.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {session && (
                  <>
                    <button
                      onClick={handleLike}
                      className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isLiked
                          ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                      }`}
                    >
                      <span className="transition-transform group-hover:scale-110">❤️</span>
                      <span>{snippet.usage.likes}</span>
                    </button>
                    <button
                      onClick={handleBookmark}
                      className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isBookmarked
                          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-200'
                      }`}
                    >
                      <span className="transition-transform group-hover:scale-110">🔖</span>
                      <span>{snippet.usage.bookmarks}</span>
                    </button>
                  </>
                )}
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm">
                  <span>👀</span>
                  <span>{snippet.usage.views}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4">
            <p className="text-gray-700">{snippet.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Code Block */}
            <div className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Code - {snippet.language}
                </span>
                <span className="text-xs text-gray-500">
                  {snippet.license} License
                </span>
              </div>
              <div className="p-6">
                <CodeBlock
                  code={snippet.code}
                  language={snippet.language}
                  showCopyButton={true}
                  maxHeight="500px"
                />
              </div>
            </div>

            {/* Comments */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Comments ({snippet.comments.length})
                </h3>
              </div>

              <div className="p-6">
                {/* Add Comment Form */}
                {session ? (
                  <form onSubmit={handleAddComment} className="mb-6">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      rows={3}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-500">{newComment.length}/500 characters</span>
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="group flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                      >
                        <span>💬</span>
                        <span>{commentLoading ? 'Adding...' : 'Add Comment'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-md">
                    <p className="text-gray-600">
                      <Link href="/auth/signin" className="text-indigo-600 hover:text-indigo-700">
                        Sign in
                      </Link>
                      {' '}to add a comment
                    </p>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {snippet.comments.map((comment, index) => (
                    <div key={index} className="flex space-x-3">
                      <Link href={`/profile/${comment.author._id}`} className="flex-shrink-0">
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-sm font-medium hover:scale-110 transition-transform cursor-pointer">
                          <span className="text-white">{comment.author.name.charAt(0).toUpperCase()}</span>
                        </div>
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <Link href={`/profile/${comment.author._id}`} className="font-medium text-gray-900 hover:text-purple-600 transition-colors">
                            {comment.author.name}
                          </Link>
                          <span className={`px-2 py-1 rounded text-xs ${getRoleColor(comment.author.role)}`}>
                            {comment.author.role.replace('-', ' ')}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {snippet.comments.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No comments yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Verification */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Verification</h3>

              {snippet.isVerified ? (
                <div>
                  <div className="flex items-center text-green-600 mb-2">
                    <span className="mr-2">✓</span>
                    Verified by Expert
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Verified by{' '}
                    <Link href={`/profile/${snippet.verifiedBy._id}`} className="font-medium text-purple-600 hover:text-purple-700 hover:underline">
                      {snippet.verifiedBy.name}
                    </Link>
                    {' '}on {formatDate(snippet.verifiedAt)}
                  </p>
                  {snippet.verificationNotes && (
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm text-green-800">{snippet.verificationNotes}</p>
                    </div>
                  )}

                  {canRemoveVerification && (
                    <button
                      onClick={handleRemoveVerification}
                      className="mt-3 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove Verification
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">This snippet hasn&apos;t been verified yet.</p>

                  {canVerify && (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 mb-2">
                          🎯 As a {session.user.role.replace('-', ' ')}, you can verify this snippet
                        </p>
                      </div>
                      <textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Add verification notes (optional)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        rows={3}
                      />
                      <button
                        onClick={handleVerify}
                        disabled={verificationLoading}
                        className="w-full group flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                      >
                        <span>✅</span>
                        <span>{verificationLoading ? 'Verifying...' : 'Verify Snippet'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Snippet Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">License</dt>
                  <dd className="text-sm text-gray-900">{snippet.license}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="text-sm text-gray-900">{formatDate(snippet.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="text-sm text-gray-900">{formatDate(snippet.updatedAt)}</dd>
                </div>
              </dl>
            </div>

            {/* Actions */}
            {isOwner && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Snippet</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleEdit}
                    className="w-full group flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium"
                  >
                    <span>✏️</span>
                    <span>Edit Snippet</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full group flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 font-medium"
                  >
                    <span>🗑️</span>
                    <span>Delete Snippet</span>
                  </button>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    💡 You can edit or delete this snippet because you&apos;re the author
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}