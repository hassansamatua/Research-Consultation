'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentSubmission {
  id: number;
  title: string;
  description: string;
  document_type: string;
  file_name: string;
  file_size: number;
  file_url: string;
  status: string;
  submitted_at: string;
  research_stage_name: string;
  research_stage_order: number;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  registration_number: string;
  reviews?: any[];
}

export default function ReviewPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<DocumentSubmission | null>(null);
  const [statistics, setStatistics] = useState({
    pending: 0,
    reviewed: 0,
    approved: 0,
    needs_revision: 0
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reviewData, setReviewData] = useState({
    comments: '',
    rating: 5,
    recommendation: 'approve'
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSubmissions();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Only supervisors can access this page
        if (data.user.role_name !== 'supervisor') {
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

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/documents/submit');
      if (response.ok) {
        const data = await response.json();
        const submissionsData = data.submissions || [];
        setSubmissions(submissionsData);
        console.log('✅ Loaded submissions data:', submissionsData.length, 'submissions');
        
        // Calculate statistics from real data
        const stats = {
          pending: submissionsData.filter(s => s.status === 'pending').length,
          reviewed: submissionsData.filter(s => s.status === 'reviewed').length,
          approved: submissionsData.filter(s => s.status === 'approved').length,
          needs_revision: submissionsData.filter(s => s.status === 'needs_revision').length
        };
        setStatistics(stats);
        
        console.log('✅ Loaded real submissions data:', submissionsData.length, 'submissions');
        console.log('📊 Statistics:', stats);
      } else {
        console.log('⚠️ Failed to fetch submissions, using empty data');
        setSubmissions([]);
        setStatistics({ pending: 0, reviewed: 0, approved: 0, needs_revision: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
      setSubmissions([]);
      setStatistics({ pending: 0, reviewed: 0, approved: 0, needs_revision: 0 });
    }
  };

  const fetchSubmissionDetails = async (submissionId: number) => {
    try {
      const response = await fetch(`/api/documents/submit?id=${submissionId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedSubmission(data.submission);
      }
    } catch (error) {
      console.error('Failed to fetch submission details:', error);
    }
  };

  const handleReviewInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setReviewData({
      ...reviewData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewing(true);
    setError('');
    setSuccess('');

    if (!selectedSubmission) {
      setError('No submission selected');
      setReviewing(false);
      return;
    }

    try {
      const response = await fetch('/api/documents/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submission_id: selectedSubmission.id,
          comments: reviewData.comments,
          rating: reviewData.rating,
          recommendation: reviewData.recommendation
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setReviewData({
          comments: '',
          rating: 5,
          recommendation: 'approve'
        });
        setShowReviewForm(false);
        setSelectedSubmission(null);
        fetchSubmissions();
      } else {
        setError(data.error || 'Failed to submit review');
      }
    } catch (error) {
      setError('An error occurred while submitting the review');
      console.error('Submit review error:', error);
    } finally {
      setReviewing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs_revision': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'approve': return 'bg-green-100 text-green-800';
      case 'reject': return 'bg-red-100 text-red-800';
      case 'resubmit': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const canReview = (submission: DocumentSubmission) => {
    return submission.status === 'pending' || submission.status === 'reviewed';
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Document Review</h1>
        <p className="mt-2 text-gray-600">Review and provide feedback on student submissions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Review</h3>
          <div className="text-3xl font-bold text-yellow-600 mb-2">{statistics.pending}</div>
          <p className="text-sm text-gray-600">Awaiting your review</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviewed</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{statistics.reviewed}</div>
          <p className="text-sm text-gray-600">Currently under review</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{statistics.approved}</div>
          <p className="text-sm text-gray-600">Successfully approved</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Needs Revision</h3>
          <div className="text-3xl font-bold text-red-600 mb-2">{statistics.needs_revision}</div>
          <p className="text-sm text-gray-600">Require changes</p>
        </div>
      </div>

      {/* Submissions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Student Submissions
          </h3>
          
          {/* Filter Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-green-500 font-medium text-sm text-green-600">
                All ({submissions.length})
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Pending ({submissions.filter(s => s.status === 'pending').length})
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Approved ({statistics.approved})
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Needs Revision ({statistics.needs_revision})
              </button>
            </nav>
          </div>

          <div className="space-y-6">
            {submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{submission.title}</h4>
                    <p className="text-sm text-gray-600 mb-1">{submission.description}</p>
                    <p className="text-sm text-gray-600 mb-1">
                      Type: {submission.document_type} • Stage: {submission.research_stage_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Student: {submission.student_first_name} {submission.student_last_name} ({submission.registration_number})
                    </p>
                    <p className="text-sm text-gray-600">
                      Email: {submission.student_email}
                    </p>
                  </div>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      <strong>File:</strong> {submission.file_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Size:</strong> {formatFileSize(submission.file_size)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Submitted:</strong> {new Date(submission.submitted_at).toLocaleDateString()}
                  </div>
                </div>

                {submission.reviews && submission.reviews.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Previous Reviews</h5>
                    <div className="space-y-2">
                      {submission.reviews.map((review) => (
                        <div key={review.id} className="border-l-4 border-gray-200 pl-4">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {review.first_name} {review.last_name}
                              </p>
                              <p className="text-xs text-gray-500">{review.role_name}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRecommendationColor(review.recommendation)}`}>
                              {review.recommendation}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{review.comments}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => fetchSubmissionDetails(submission.id)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50">
                    Download Document
                  </button>
                  {canReview(submission) && (
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowReviewForm(true);
                      }}
                      className="px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50"
                    >
                      Review Document
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">Review Document</h3>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedSubmission(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M6 6v12M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">{selectedSubmission.title}</h4>
              <p className="text-sm text-gray-600 mb-1">
                Student: {selectedSubmission.student_first_name} {selectedSubmission.student_last_name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Type: {selectedSubmission.document_type} • Stage: {selectedSubmission.research_stage_name}
              </p>
              <p className="text-sm text-gray-600">
                File: {selectedSubmission.file_name} ({formatFileSize(selectedSubmission.file_size)})
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-green-200 text-green-600 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                  Rating (1-10)
                </label>
                <select
                  name="rating"
                  id="rating"
                  value={reviewData.rating}
                  onChange={handleReviewInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} - {rating <= 3 ? 'Poor' : rating <= 6 ? 'Fair' : rating <= 8 ? 'Good' : 'Excellent'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="recommendation" className="block text-sm font-medium text-gray-700">
                  Recommendation
                </label>
                <select
                  name="recommendation"
                  id="recommendation"
                  value={reviewData.recommendation}
                  onChange={handleReviewInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                >
                  <option value="approve">Approve</option>
                  <option value="resubmit">Request Revision</option>
                  <option value="reject">Reject</option>
                </select>
              </div>

              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                  Comments
                </label>
                <textarea
                  name="comments"
                  id="comments"
                  value={reviewData.comments}
                  onChange={handleReviewInputChange}
                  rows={6}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Provide detailed feedback on the document..."
                  required
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h5 className="font-medium text-gray-900 mb-2">Review Guidelines:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Check for proper structure and formatting</li>
                  <li>• Verify content accuracy and relevance</li>
                  <li>• Ensure academic writing standards are met</li>
                  <li>• Provide constructive feedback for improvement</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setSelectedSubmission(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {reviewing ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
