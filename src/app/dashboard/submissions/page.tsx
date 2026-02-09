'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DocumentSubmission {
  id: number;
  title: string;
  description: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  status: string;
  submitted_at: string;
  approved_at?: string;
  research_stage_name: string;
  research_stage_order: number;
  supervisor_first_name: string;
  supervisor_last_name: string;
  student_name?: string;
  student_email?: string;
  reviews?: any[];
}

interface ResearchStage {
  id: number;
  name: string;
  description: string;
  order_index: number;
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
        
        if (!['student', 'supervisor'].includes(data.user.role_name)) {
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
        setSubmissions(data.submissions || []);
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
        setResearchStages(data.stages || []);
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
        setDocumentTypes(data.documentTypes || []);
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
      setError('An error occurred while submitting document');
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
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.role_name === 'supervisor' ? 'Student Submissions to Review' : 'Document Submissions'}
        </h1>
        <p className="mt-2 text-gray-600">
          {user?.role_name === 'supervisor' 
            ? 'Review and provide feedback on student document submissions'
            : 'Submit and track your research documents'
          }
        </p>
      </div>

      {user?.role_name === 'supervisor' ? (
        <div className="space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Submissions</h3>
            
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl text-gray-400">📄</span>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">No Submissions Found</h3>
                <p className="mt-2 text-sm text-gray-600">
                  No student document submissions have been made yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{submission.title}</h4>
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Student:</span> {submission.student_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {submission.student_email}
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
                          submission.status === 'revision_required' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {submission.status}
                        </span>
                        
                        <div className="text-right text-sm text-gray-500">
                          {submission.approved_at && (
                            <p>Approved: {new Date(submission.approved_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Details
                        </button>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = submission.file_url;
                            link.download = submission.file_name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Submissions</h3>
              <div className="text-3xl font-bold text-blue-600">{submissions.length}</div>
              <p className="text-sm text-gray-600">All documents submitted</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Review</h3>
              <div className="text-3xl font-bold text-orange-600">
                {submissions.filter(s => s.status === 'pending').length}
              </div>
              <p className="text-sm text-gray-600">Awaiting review</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
              <div className="text-3xl font-bold text-green-600">
                {submissions.filter(s => s.status === 'approved').length}
              </div>
              <p className="text-sm text-gray-600">Completed submissions</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Needs Revision</h3>
              <div className="text-3xl font-bold text-red-600">
                {submissions.filter(s => s.status === 'needs_revision').length}
              </div>
              <p className="text-sm text-gray-600">Require changes</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">My Submissions</h3>
                <button
                  onClick={() => setShowSubmitForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit New Document
                </button>
              </div>
              
              {submissions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl text-gray-400">📄</span>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    You haven't submitted any documents yet. Click "Submit New Document" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{submission.title}</h4>
                          <div className="mt-1">
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
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                          
                          <div className="text-right text-sm text-gray-500">
                            {submission.approved_at && (
                              <p>Approved: {new Date(submission.approved_at).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = submission.file_url;
                              link.download = submission.file_name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
                          >
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {showSubmitForm && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Submit Document</h3>
                  <button
                    onClick={() => setShowSubmitForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      rows={4}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <label htmlFor="research_stage_id" className="block text-sm font-medium text-gray-700">
                      Research Stage
                    </label>
                    <select
                      name="research_stage_id"
                      id="research_stage_id"
                      value={formData.research_stage_id}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="">Select research stage</option>
                      {researchStages.map((stage) => (
                        <option key={stage.id} value={stage.id.toString()}>
                          {stage.name}
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
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit Document'}
                    </button>
                  </div>
                </form>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-gray-900">{selectedSubmission.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedSubmission.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Document Type</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.document_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Research Stage</p>
                  <p className="text-sm text-gray-600">{selectedSubmission.research_stage_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Submitted Date</p>
                  <p className="text-sm text-gray-600">{new Date(selectedSubmission.submitted_at).toLocaleDateString()}</p>
                </div>
              </div>

              {user?.role_name === 'supervisor' && selectedSubmission.student_name && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Student Name</p>
                    <p className="text-sm text-gray-600">{selectedSubmission.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Student Email</p>
                    <p className="text-sm text-gray-600">{selectedSubmission.student_email}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-gray-700">File Information</p>
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">File Name:</span> {selectedSubmission.file_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">File Size:</span> {formatFileSize(selectedSubmission.file_size)}
                  </p>
                </div>
              </div>

              {selectedSubmission.approved_at && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Approved Date</p>
                  <p className="text-sm text-gray-600">{new Date(selectedSubmission.approved_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = selectedSubmission.file_url;
                  link.download = selectedSubmission.file_name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
              >
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
