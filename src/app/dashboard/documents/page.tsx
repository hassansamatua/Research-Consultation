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
  status: string;
  submitted_at: string;
  approved_at?: string;
  research_stage_name: string;
  research_stage_order: number;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  registration_number: string;
  supervisor_first_name: string;
  supervisor_last_name: string;
  supervisor_email: string;
  reviews?: any[];
}

export default function DocumentsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<DocumentSubmission | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
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
        
        // Only admins and super_admins can access this page
        if (data.user.role_name !== 'admin' && data.user.role_name !== 'super_admin') {
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
        setSubmissions(data.submissions);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
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

  const filteredSubmissions = submissions.filter(submission => {
    const matchesFilter = filter === 'all' || submission.status === filter;
    const matchesSearch = searchTerm === '' || 
      submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.student_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.student_last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.supervisor_first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.supervisor_last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="mt-2 text-gray-600">Monitor and review all document submissions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Submissions</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{submissions.length}</div>
          <p className="text-sm text-gray-600">All documents submitted</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Review</h3>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {submissions.filter(s => s.status === 'pending' || s.status === 'reviewed').length}
          </div>
          <p className="text-sm text-gray-600">Awaiting review</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {submissions.filter(s => s.status === 'approved').length}
          </div>
          <p className="text-sm text-gray-600">Successfully approved</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Needs Revision</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {submissions.filter(s => s.status === 'needs_revision').length}
          </div>
          <p className="text-sm text-gray-600">Require changes</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Documents
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, student, supervisor, or registration number..."
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Document Submissions ({filteredSubmissions.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.title}</div>
                        <div className="text-sm text-gray-500">{submission.document_type}</div>
                        <div className="text-xs text-gray-400">{formatFileSize(submission.file_size)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.student_first_name} {submission.student_last_name}
                      </div>
                      <div className="text-sm text-gray-500">{submission.registration_number}</div>
                      <div className="text-xs text-gray-400">{submission.student_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {submission.supervisor_first_name} {submission.supervisor_last_name}
                      </div>
                      <div className="text-sm text-gray-500">{submission.supervisor_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.research_stage_name}</div>
                      <div className="text-xs text-gray-500">Stage {submission.research_stage_order}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(submission.submitted_at).toLocaleDateString()}</div>
                      {submission.approved_at && (
                        <div className="text-xs text-green-600">
                          Approved: {new Date(submission.approved_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => fetchSubmissionDetails(submission.id)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        View Details
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No submissions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M6 6v12M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p className="text-sm"><strong>Title:</strong> {selectedSubmission.title}</p>
                    <p className="text-sm"><strong>Description:</strong> {selectedSubmission.description || 'N/A'}</p>
                    <p className="text-sm"><strong>Type:</strong> {selectedSubmission.document_type}</p>
                    <p className="text-sm"><strong>File:</strong> {selectedSubmission.file_name}</p>
                    <p className="text-sm"><strong>Size:</strong> {formatFileSize(selectedSubmission.file_size)}</p>
                    <p className="text-sm"><strong>Status:</strong> 
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                        {selectedSubmission.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p className="text-sm">
                      <strong>Submitted:</strong> {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                    </p>
                    {selectedSubmission.approved_at && (
                      <p className="text-sm">
                        <strong>Approved:</strong> {new Date(selectedSubmission.approved_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* People Information */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p className="text-sm">
                      <strong>Name:</strong> {selectedSubmission.student_first_name} {selectedSubmission.student_last_name}
                    </p>
                    <p className="text-sm"><strong>Registration:</strong> {selectedSubmission.registration_number}</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedSubmission.student_email}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Supervisor Information</h4>
                  <div className="bg-gray-50 p-4 rounded-md space-y-2">
                    <p className="text-sm">
                      <strong>Name:</strong> {selectedSubmission.supervisor_first_name} {selectedSubmission.supervisor_last_name}
                    </p>
                    <p className="text-sm"><strong>Email:</strong> {selectedSubmission.supervisor_email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {selectedSubmission.reviews && selectedSubmission.reviews.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-4">Reviews and Comments</h4>
                <div className="space-y-4">
                  {selectedSubmission.reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {review.first_name} {review.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{review.role_name}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRecommendationColor(review.recommendation)}`}>
                            {review.recommendation}
                          </span>
                          {review.rating && (
                            <p className="text-xs text-gray-500 mt-1">Rating: {review.rating}/10</p>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-700">{review.comments}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.created_at).toLocaleDateString()} at {new Date(review.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50">
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
