'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Comment {
  id: number;
  submission_id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_role: string;
  comments: string;
  rating: number | null;
  recommendation: string;
  review_type: string;
  created_at: string;
  updated_at: string;
}

interface Submission {
  id: number;
  title: string;
  description: string;
  document_type: string;
  file_url: string;
  file_name: string;
  file_size: number;
  status: string;
  student_name: string;
  student_email: string;
  registration_number: string;
  submitted_at: string;
  research_stage_name: string;
  research_stage_order: number;
  supervisor_name: string;
  supervisor_email: string;
}

export default function CommentsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [statistics, setStatistics] = useState<any>({});
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [recommendation, setRecommendation] = useState<string>('approve');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchCommentsAndSubmissions();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user has permission to view comments
        if (!['admin', 'super_admin', 'supervisor'].includes(data.user.role_name)) {
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommentsAndSubmissions = async () => {
    try {
      // Fetch real data from our new dashboard-stats API
      const response = await fetch('/api/comments/dashboard-stats');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setComments(data.reviews || []);
          setSubmissions(data.submissions || []);
          setStatistics(data.statistics || {});
          console.log('✅ Loaded real comments and submissions data');
        } else {
          console.log('⚠️ API returned error, using empty data');
          setComments([]);
          setSubmissions([]);
        }
      } else {
        console.log('⚠️ Failed to fetch data, using empty data');
        setComments([]);
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching comments and submissions:', error);
      setComments([]);
      setSubmissions([]);
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return 'bg-green-100 text-green-800';
      case 'reject': return 'bg-red-100 text-red-800';
      case 'resubmit': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedSubmission) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/documents/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: selectedSubmission.id,
          comments: newComment,
          rating: rating,
          recommendation: recommendation,
          review_type: user?.role_name === 'supervisor' ? 'supervisor' : 'admin'
        }),
      });

      if (response.ok) {
        setNewComment('');
        setRating(5);
        setRecommendation('approve');
        setSuccess('Review submitted successfully!');
        // Refresh comments and submissions
        fetchCommentsAndSubmissions();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('An error occurred while adding your comment');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComments = selectedSubmission 
    ? comments.filter(comment => comment.submission_id === selectedSubmission.id)
    : comments;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Comments & Feedback</h1>
        <p className="mt-2 text-gray-600">View and manage feedback on document submissions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Comments</h3>
          <div className="text-3xl font-bold text-blue-600">{statistics.total_comments || 0}</div>
          <p className="text-sm text-gray-600">All feedback provided</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
          <div className="text-3xl font-bold text-orange-600">{statistics.pending_reviews || 0}</div>
          <p className="text-sm text-gray-600">Awaiting feedback</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <div className="text-3xl font-bold text-green-600">{statistics.approved_submissions || 0}</div>
          <p className="text-sm text-gray-600">Completed submissions</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Needs Revision</h3>
          <div className="text-3xl font-bold text-red-600">{statistics.needs_revision || 0}</div>
          <p className="text-sm text-gray-600">Require changes</p>
        </div>
      </div>

      {/* Submissions and Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Submissions List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Document Submissions</h3>
            
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-gray-400">📄</span>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">No Submissions Found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  No document submissions have been made yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div 
                    key={submission.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedSubmission?.id === submission.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{submission.title}</h4>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Student:</span> {submission.student_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Type:</span> {submission.document_type}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Stage:</span> {submission.research_stage_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Submitted:</span> {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                          submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          submission.status === 'reviewed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {selectedSubmission ? `Comments for "${selectedSubmission.title}"` : 'All Comments'}
            </h3>
            
            {selectedSubmission && (
              <div className="mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Selected Document</h4>
                  <p className="text-sm text-blue-800">{selectedSubmission.title}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    by {selectedSubmission.student_name} • {selectedSubmission.document_type} • {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {/* Add Comment Form */}
            {selectedSubmission && user.role_name !== 'student' && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Add Review & Feedback</h4>
                
                {/* Error and Success Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="text-2xl focus:outline-none"
                        >
                          {star <= rating ? '⭐' : '☆'}
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">({rating}/5)</span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recommendation</label>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="approve">Approve</option>
                      <option value="resubmit">Resubmit with Changes</option>
                      <option value="reject">Reject</option>
                    </select>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Provide your feedback and recommendations..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setNewComment('');
                        setRating(5);
                        setRecommendation('approve');
                        setError('');
                        setSuccess('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || submitting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {filteredComments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-gray-400">💭</span>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">No Comments Found</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedSubmission 
                      ? 'No feedback has been provided for this document yet.'
                      : 'No comments found in the system.'
                    }
                  </p>
                </div>
              ) : (
                filteredComments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm text-blue-600">👨‍🏫</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{comment.reviewer_name}</h4>
                          <p className="text-xs text-gray-500">{comment.reviewer_role}</p>
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-md p-3 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {comment.rating && (
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-sm">
                                  {star <= (comment.rating || 0) ? '⭐' : '☆'}
                                </span>
                              ))}
                            </div>
                          )}
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRecommendationColor(comment.recommendation)}`}>
                            {comment.recommendation}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comments}</p>
                      {comment.review_type && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">
                            Review Type: {comment.review_type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
