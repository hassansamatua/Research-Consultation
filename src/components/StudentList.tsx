'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  UserIcon, 
  EnvelopeIcon as MailIcon, 
  PhoneIcon, 
  AcademicCapIcon, 
  CalendarIcon 
} from '@heroicons/react/24/outline';

interface Allocation {
  id: number;
  supervisor_id: number;
  student_id: number;
  allocation_date: string;
  status: string;
  notes?: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  student_phone: string;
  registration_number: string;
  program: string;
  enrollment_date: string;
  expected_completion_date: string;
  student_user_id: number;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_records: number;
  records_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

interface StudentListProps {
  onMessageStudent: (studentId: number) => void;
  onScheduleMeeting: (studentId: number) => void;
}

export default function StudentList({ onMessageStudent, onScheduleMeeting }: StudentListProps) {
  const [user, setUser] = useState<any>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log('StudentList - Authenticated user:', data.user);
        } else {
          console.log('StudentList - Authentication failed');
        }
      } catch (error) {
        console.error('StudentList - Auth error:', error);
      }
    };

    checkAuth();
  }, []);

  // Fetch allocations when user is authenticated
  useEffect(() => {
    if (user) {
      fetchAllocations(currentPage, recordsPerPage);
    }
  }, [user, currentPage, recordsPerPage]);

  // Determine API endpoint based on user role
  const getAllocationsEndpoint = () => {
    if (user?.role_name === 'admin' || user?.role_name === 'super_admin') {
      return '/api/admin/allocations';
    } else if (user?.role_name === 'supervisor') {
      return '/api/supervisor/allocations';
    } else {
      return '/api/supervisor/allocations'; // fallback
    }
  };

  const fetchAllocations = async (page: number = 1, limit: number = 10) => {
    if (!user) {
      console.log('User not authenticated yet, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      const endpoint = getAllocationsEndpoint();
      console.log('Fetching allocations from:', `${endpoint}?page=${page}&limit=${limit}`);
      
      const response = await fetch(`${endpoint}?page=${page}&limit=${limit}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok - Status:', response.status);
        console.error('Response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: errorText };
        }
        
        console.error('Parsed API Error:', errorData);
        throw new Error(errorData.error || errorText || 'Failed to fetch allocations');
      }
      
      let data;
      try {
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new Error('Invalid response format from server');
      }
      
      console.log('Parsed data:', data);
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      setAllocations(data.allocations || []);
      setPagination(data.pagination || null);
      setError(null);
    } catch (error) {
      console.error('Error fetching allocations:', error);
      setError('Failed to load student data');
      setAllocations([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations(currentPage, recordsPerPage);
  }, [currentPage, recordsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && pagination && newPage <= pagination.total_pages) {
      setCurrentPage(newPage);
    }
  };

  const handleRecordsPerPageChange = (newLimit: number) => {
    setRecordsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing records per page
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading students...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-8">
          <div className="text-center">
            <div className="text-red-600 mb-2">⚠️ {error}</div>
            <button
              onClick={() => fetchAllocations(currentPage, recordsPerPage)}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with pagination controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assigned Students</h3>
              {pagination && (
                <p className="text-sm text-gray-500 mt-1">
                  Showing {((pagination.current_page - 1) * pagination.records_per_page) + 1} to{' '}
                  {Math.min(pagination.current_page * pagination.records_per_page, pagination.total_records)} of{' '}
                  {pagination.total_records} students
                </p>
              )}
            </div>
            
            {/* Records per page selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={recordsPerPage}
                onChange={(e) => handleRecordsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>

        {/* Student cards */}
        <div className="p-6">
          {allocations.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students assigned</h3>
              <p className="mt-1 text-sm text-gray-500">No students have been assigned to you yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              {allocations.map((allocation) => (
                <div
                  key={`allocation-${allocation.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Student header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-gray-900">
                          {allocation.student_first_name} {allocation.student_last_name}
                        </h4>
                        <p className="text-sm text-gray-500">{allocation.registration_number}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      allocation.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {allocation.status}
                    </span>
                  </div>

                  {/* Student details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <MailIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600 truncate">{allocation.student_email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{allocation.student_phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <AcademicCapIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{allocation.program}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          Enrolled: {formatDate(allocation.enrollment_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expected completion date */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        Expected Completion: {formatDate(allocation.expected_completion_date)}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onMessageStudent(allocation.student_id)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      Send Message
                    </button>
                    <button
                      onClick={() => onScheduleMeeting(allocation.student_id)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors duration-200"
                    >
                      Schedule Meeting
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {pagination.current_page} of {pagination.total_pages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev}
                  className={`p-2 rounded-md border ${
                    pagination.has_prev
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                
                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    let pageNum;
                    if (pagination.total_pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.current_page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.current_page >= pagination.total_pages - 2) {
                      pageNum = pagination.total_pages - 4 + i;
                    } else {
                      pageNum = pagination.current_page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm rounded-md ${
                          pageNum === pagination.current_page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next}
                  className={`p-2 rounded-md border ${
                    pagination.has_next
                      ? 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
