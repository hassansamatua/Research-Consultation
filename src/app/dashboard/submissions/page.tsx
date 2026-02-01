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
  supervisor_first_name: string;
  supervisor_last_name: string;
  reviews?: any[];
}

interface ResearchStage {
  id: number;
  name: string;
  description: string;
  stage_order: number;
  is_required: boolean;
  completed_count: number;
}

interface DocumentType {
  id: number;
  name: string;
  description: string;
  file_types: string;
  max_size_mb: number;
}

export default function SubmissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<DocumentSubmission[]>([]);
  const [researchStages, setResearchStages] = useState<ResearchStage[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<DocumentSubmission | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: '',
    research_stage_id: '',
    file: null as File | null
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSubmissions();
    fetchResearchStages();
    fetchDocumentTypes();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Only students can access this page
        if (data.user.role_name !== 'student') {
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

  const fetchResearchStages = async () => {
    try {
      const response = await fetch('/api/research/stages');
      if (response.ok) {
        const data = await response.json();
        setResearchStages(data.stages);
      }
    } catch (error) {
      console.error('Failed to fetch research stages:', error);
    }
  };

  const fetchDocumentTypes = async () => {
    try {
      const response = await fetch('/api/documents/types');
      if (response.ok) {
        const data = await response.json();
        setDocumentTypes(data.documentTypes);
      }
    } catch (error) {
      console.error('Failed to fetch document types:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.file) {
      setError('Please select a file to upload');
      setSubmitting(false);
      return;
    }

    try {
      // In a real application, you would upload the file to a storage service
      // For now, we'll simulate the upload with a mock URL
      const fileUrl = `/uploads/documents/${formData.file.name}`;
      
      const response = await fetch('/api/documents/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          document_type: formData.document_type,
          file_url: fileUrl,
          file_name: formData.file.name,
          file_size: formData.file.size,
          research_stage_id: formData.research_stage_id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          title: '',
          description: '',
          document_type: '',
          research_stage_id: '',
          file: null
        });
        setShowSubmitForm(false);
        fetchSubmissions();
      } else {
        setError(data.error || 'Failed to submit document');
      }
    } catch (error) {
      setError('An error occurred while submitting the document');
      console.error('Submit document error:', error);
    } finally {
      setSubmitting(false);
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

  const canSubmitStage = (stage: ResearchStage) => {
    // Check if previous stages are completed
    if (stage.stage_order === 1) return true;
    
    const previousStageCompleted = submissions.some(sub => 
      sub.research_stage_order === stage.stage_order - 1 && 
      sub.status === 'approved'
    );
    
    return previousStageCompleted;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <h1 className="text-3xl font-bold text-gray-900">Document Submissions</h1>
        <p className="mt-2 text-gray-600">Submit and track your research documents</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Research Progress</h3>
          <div className="space-y-4">
            {researchStages.map((stage) => (
              <div key={stage.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{stage.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      submissions.some(sub => sub.research_stage_order === stage.stage_order && sub.status === 'approved')
                        ? 'bg-green-100 text-green-800'
                        : canSubmitStage(stage)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {submissions.some(sub => sub.research_stage_order === stage.stage_order && sub.status === 'approved')
                        ? 'Completed'
                        : canSubmitStage(stage)
                        ? 'Available'
                        : 'Locked'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
                <div className="ml-4">
                  {canSubmitStage(stage) && (
                    <button
                      onClick={() => {
                        setFormData({ ...formData, research_stage_id: stage.id.toString() });
                        setShowSubmitForm(true);
                      }}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Submit Document
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Submissions</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{submissions.length}</div>
          <p className="text-sm text-gray-600">Documents submitted</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {submissions.filter(s => s.status === 'approved').length}
          </div>
          <p className="text-sm text-gray-600">Successfully approved</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Review</h3>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {submissions.filter(s => s.status === 'pending' || s.status === 'reviewed').length}
          </div>
          <p className="text-sm text-gray-600">Awaiting review</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Needs Revision</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {submissions.filter(s => s.status === 'needs_revision').length}
          </div>
          <p className="text-sm text-gray-600">Require changes</p>
        </div>
      </div>

      {/* Submission Form Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">Submit Document</h3>
              <button
                onClick={() => setShowSubmitForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M6 6v12M6 6l12 12" />
                </svg>
              </button>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Document Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Brief description of your document"
                />
              </div>

              <div>
                <label htmlFor="document_type" className="block text-sm font-medium text-gray-700">
                  Document Type
                </label>
                <select
                  name="document_type"
                  id="document_type"
                  value={formData.document_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                  Upload Document
                </label>
                <input
                  type="file"
                  name="file"
                  id="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                />
                {formData.file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formData.file.name} ({formatFileSize(formData.file.size)})
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            My Submissions
          </h3>
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
                      Supervisor: {submission.supervisor_first_name} {submission.supervisor_last_name}
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

                {submission.approved_at && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>Approved on:</strong> {new Date(submission.approved_at).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedSubmission(submission)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50">
                    Download
                  </button>
                  {submission.status === 'needs_revision' && (
                    <button
                      onClick={() => {
                        setFormData({ ...formData, research_stage_id: submission.research_stage_order.toString() });
                        setShowSubmitForm(true);
                      }}
                      className="px-4 py-2 border border-orange-300 rounded-md shadow-sm text-sm font-medium text-orange-700 bg-white hover:bg-orange-50"
                    >
                      Resubmit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
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

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{selectedSubmission.title}</h4>
                <p className="text-sm text-gray-600">{selectedSubmission.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Document Type</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.document_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Research Stage</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.research_stage_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Status</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Submitted Date</p>
                  <p className="text-sm text-gray-600">{new Date(selectedSubmission.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">File Information</p>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Name:</strong> {selectedSubmission.file_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Size:</strong> {formatFileSize(selectedSubmission.file_size)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Supervisor</p>
                <p className="text-sm text-gray-600">
                  {selectedSubmission.supervisor_first_name} {selectedSubmission.supervisor_last_name}
                </p>
              </div>

              {selectedSubmission.reviews && selectedSubmission.reviews.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Reviews</p>
                  <div className="space-y-3">
                    {selectedSubmission.reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {review.first_name} {review.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{review.role_name}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            review.recommendation === 'approve' ? 'bg-green-100 text-green-800' :
                            review.recommendation === 'reject' ? 'bg-red-100 text-red-800' :
                            'bg-orange-100 text-orange-800'
                          }`}>
                            {review.recommendation}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{review.comments}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
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
        </div>
      )}
    </div>
  );
}
