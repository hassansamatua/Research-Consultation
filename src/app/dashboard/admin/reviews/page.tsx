'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Review {
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
  submission_title: string;
  submission_status: string;
  student_name: string;
  student_email: string;
  document_type: string;
  research_stage_name: string;
}

export default function AdminReviewsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchReviews();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user has admin role
        if (!['admin', 'super_admin'].includes(data.user.role_name)) {
          router.push('/dashboard');
          return;
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

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
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

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'supervisor') return review.review_type === 'supervisor';
    if (filter === 'admin') return review.review_type === 'admin';
    if (filter === 'approve') return review.recommendation === 'approve';
    if (filter === 'reject') return review.recommendation === 'reject';
    if (filter === 'resubmit') return review.recommendation === 'resubmit';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Reviews</h1>
        <p className="mt-2 text-gray-600">
          View and manage all document reviews and supervisor feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Reviews</h3>
          <div className="text-3xl font-bold text-blue-600">{reviews.length}</div>
          <p className="text-sm text-gray-600">All reviews in system</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Supervisor Reviews</h3>
          <div className="text-3xl font-bold text-green-600">
            {reviews.filter(r => r.review_type === 'supervisor').length}
          </div>
          <p className="text-sm text-gray-600">From supervisors</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <div className="text-3xl font-bold text-green-600">
            {reviews.filter(r => r.recommendation === 'approve').length}
          </div>
          <p className="text-sm text-gray-600">Approved submissions</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Revision</h3>
          <div className="text-3xl font-bold text-yellow-600">
            {reviews.filter(r => r.recommendation === 'resubmit').length}
          </div>
          <p className="text-sm text-gray-600">Require changes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Filter Reviews</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => setFilter('supervisor')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'supervisor' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Supervisor Reviews
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'admin' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin Reviews
            </button>
            <button
              onClick={() => setFilter('approve')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'approve' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('resubmit')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'resubmit' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Need Revision
            </button>
            <button
              onClick={() => setFilter('reject')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'reject' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Reviews ({filteredReviews.length})</h3>
          
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-gray-400">📝</span>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">No Reviews Found</h3>
              <p className="mt-2 text-sm text-gray-600">
                {filter === 'all' 
                  ? 'No reviews have been submitted yet.'
                  : `No reviews found for the selected filter: ${filter}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{review.submission_title}</h4>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Student:</span> {review.student_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Document:</span> {review.document_type} • {review.research_stage_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Reviewed by:</span> {review.reviewer_name} ({review.reviewer_role})
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRecommendationColor(review.recommendation)}`}>
                        {review.recommendation}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {review.rating && (
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className="text-sm">
                                {star <= (review.rating || 0) ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          Review Type: {review.review_type}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        Submission Status: {review.submission_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comments}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
