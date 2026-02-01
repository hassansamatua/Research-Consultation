'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Submission {
  id: number;
  student_name: string;
  registration_number: string;
  research_title: string;
  stage_name: string;
  submission_date: string;
  status: string;
  file_name: string;
  file_size: number;
  supervisor_notes?: string;
}

export default function AllSubmissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState({
    stage: '',
    status: '',
    date_range: ''
  });
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
        
        // Check if user has admin privileges
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
    // Mock submissions data
    const mockSubmissions: Submission[] = [
      {
        id: 1,
        student_name: 'Ali Hassan',
        registration_number: 'ZU/PG/2023/001',
        research_title: 'Machine Learning Applications in Healthcare',
        stage_name: 'Proposal',
        submission_date: '2024-01-10T10:30:00Z',
        status: 'under_review',
        file_name: 'proposal_ali_hassan.pdf',
        file_size: 2048576,
        supervisor_notes: 'Good methodology section, but needs more literature review.'
      },
      {
        id: 2,
        student_name: 'Fatma Omar',
        registration_number: 'ZU/PG/2023/002',
        research_title: 'Digital Transformation Strategies in SMEs',
        stage_name: 'Chapter One',
        submission_date: '2024-01-08T14:20:00Z',
        status: 'approved',
        file_name: 'chapter1_fatma_omar.pdf',
        file_size: 1536000
      },
      {
        id: 3,
        student_name: 'Omar Said',
        registration_number: 'ZU/PG/2023/003',
        research_title: 'Impact of Technology on Modern Education',
        stage_name: 'Proposal',
        submission_date: '2024-01-05T09:15:00Z',
        status: 'revision_required',
        file_name: 'proposal_omar_said.pdf',
        file_size: 3072000,
        supervisor_notes: 'Research questions need to be more specific. Please revise and resubmit.'
      },
      {
        id: 4,
        student_name: 'Ali Hassan',
        registration_number: 'ZU/PG/2023/001',
        research_title: 'Machine Learning Applications in Healthcare',
        stage_name: 'Chapter One',
        submission_date: '2024-01-03T16:45:00Z',
        status: 'approved',
        file_name: 'chapter1_ali_hassan.pdf',
        file_size: 1792000
      },
      {
        id: 5,
        student_name: 'Fatma Omar',
        registration_number: 'ZU/PG/2023/002',
        research_title: 'Digital Transformation Strategies in SMEs',
        stage_name: 'Chapter Two',
        submission_date: '2024-01-02T11:30:00Z',
        status: 'submitted',
        file_name: 'chapter2_fatma_omar.pdf',
        file_size: 2560000
      }
    ];
    setSubmissions(mockSubmissions);
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.research_title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStage = !filter.stage || submission.stage_name === filter.stage;
    const matchesStatus = !filter.status || submission.status === filter.status;
    
    return matchesSearch && matchesStage && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'revision_required': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
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
        <h1 className="text-3xl font-bold text-gray-900">All Submissions</h1>
        <p className="mt-2 text-gray-600">Monitor and manage all research document submissions</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Submissions</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{submissions.length}</div>
          <p className="text-sm text-gray-600">All time</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitted</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {submissions.filter(s => s.status === 'submitted').length}
          </div>
          <p className="text-sm text-gray-600">Awaiting review</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Under Review</h3>
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {submissions.filter(s => s.status === 'under_review').length}
          </div>
          <p className="text-sm text-gray-600">Being reviewed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {submissions.filter(s => s.status === 'approved').length}
          </div>
          <p className="text-sm text-gray-600">Completed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Revision</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {submissions.filter(s => s.status === 'revision_required').length}
          </div>
          <p className="text-sm text-gray-600">Require changes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Student, registration, or research"
              />
            </div>

            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
                Research Stage
              </label>
              <select
                name="stage"
                id="stage"
                value={filter.stage}
                onChange={(e) => setFilter({...filter, stage: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Stages</option>
                <option value="Proposal">Proposal</option>
                <option value="Chapter One">Chapter One</option>
                <option value="Chapter Two">Chapter Two</option>
                <option value="Chapter Three">Chapter Three</option>
                <option value="Chapter Four">Chapter Four</option>
                <option value="Chapter Five">Chapter Five</option>
                <option value="Final Dissertation">Final Dissertation</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                value={filter.status}
                onChange={(e) => setFilter({...filter, status: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="revision_required">Revision Required</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label htmlFor="date_range" className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                name="date_range"
                id="date_range"
                value={filter.date_range}
                onChange={(e) => setFilter({...filter, date_range: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Submissions ({filteredSubmissions.length})
            </h3>
            <div className="flex space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Export
              </button>
              <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                Generate Report
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Research
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr key={submission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{submission.student_name}</div>
                        <div className="text-sm text-gray-500">{submission.registration_number}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {submission.research_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{submission.stage_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(submission.submission_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(submission.submission_date).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {submission.file_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(submission.file_size)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(submission.status)}`}>
                        {submission.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        Download
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Review
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
