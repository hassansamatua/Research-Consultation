'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: number;
  registration_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  program: string;
  enrollment_date: string;
  expected_completion_date: string;
  status: string;
  user_id: number;
}

interface ExcelStudentListProps {
  students: Student[];
  onMessageClick?: (studentId: number) => void;
  onScheduleMeeting?: (studentId: number) => void;
  className?: string;
}

export function ExcelStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: ExcelStudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Student; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  // Filter students
  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue == null || bValue == null) return 0;
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);

  // Handle sorting
  const handleSort = (key: keyof Student) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-700 bg-green-100';
      case 'inactive': return 'text-red-700 bg-red-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'graduated': return 'text-blue-700 bg-blue-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Table headers
  const headers = [
    { key: 'registration_number', label: 'Reg Number', width: 'w-32' },
    { key: 'first_name', label: 'First Name', width: 'w-28' },
    { key: 'last_name', label: 'Last Name', width: 'w-28' },
    { key: 'status', label: 'Status', width: 'w-20' },
    { key: 'email', label: 'Email', width: 'w-48' },
    { key: 'phone', label: 'Phone', width: 'w-32' },
    { key: 'program', label: 'Program', width: 'w-48' },
    { key: 'enrollment_date', label: 'Enrolled', width: 'w-28' },
    { key: 'expected_completion_date', label: 'Complete', width: 'w-28' },
    { key: 'actions', label: 'Actions', width: 'w-32' }
  ] as const;

  return (
    <div className={cn('bg-white', className)}>
      {/* Header Controls */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Student List</h2>
            <span className="text-sm text-gray-500">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
            
            <button className="p-2 border border-gray-300 rounded hover:bg-gray-50">
              <Download className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Excel-style Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={cn(
                    'px-2 py-2 text-left text-xs font-medium text-gray-700 border border-gray-300 cursor-pointer hover:bg-gray-100',
                    header.width
                  )}
                  onClick={() => header.key !== 'actions' && handleSort(header.key as keyof Student)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{header.label}</span>
                    {header.key !== 'actions' && sortConfig?.key === header.key && (
                      sortConfig.direction === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {paginatedStudents.map((student, index) => (
              <tr 
                key={student.id}
                className={cn(
                  'border border-gray-200 hover:bg-blue-50 transition-colors',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                )}
              >
                {/* Registration Number */}
                <td className="px-2 py-1 text-xs text-gray-900 border border-gray-200 font-mono">
                  {student.registration_number}
                </td>

                {/* First Name */}
                <td className="px-2 py-1 text-xs text-gray-900 border border-gray-200">
                  {student.first_name}
                </td>

                {/* Last Name */}
                <td className="px-2 py-1 text-xs text-gray-900 border border-gray-200">
                  {student.last_name}
                </td>

                {/* Status */}
                <td className="px-2 py-1 border border-gray-200">
                  <span className={cn(
                    'inline-flex px-2 py-0.5 text-xs font-medium rounded',
                    getStatusColor(student.status)
                  )}>
                    {student.status}
                  </span>
                </td>

                {/* Email */}
                <td className="px-2 py-1 text-xs text-gray-900 border border-gray-200 truncate">
                  {student.email}
                </td>

                {/* Phone */}
                <td className="px-2 py-1 text-xs text-gray-900 border border-gray-200">
                  {student.phone || 'N/A'}
                </td>

                {/* Program */}
                <td className="px-2 py-1 text-xs text-gray-900 border border-gray-200 truncate">
                  {student.program}
                </td>

                {/* Enrollment Date */}
                <td className="px-2 py-1 text-xs text-gray-900 border border-gray-200">
                  {formatDate(student.enrollment_date)}
                </td>

                {/* Completion Date */}
                <td className="px-2 py-1 text-xs text-gray-900 border border-gray-200">
                  {formatDate(student.expected_completion_date)}
                </td>

                {/* Actions */}
                <td className="px-2 py-1 border border-gray-200">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onMessageClick?.(student.id)}
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Send Message"
                    >
                      <MessageSquare className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onScheduleMeeting?.(student.id)}
                      className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      title="Schedule Meeting"
                    >
                      <Calendar className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedStudents.length)} of {sortedStudents.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact Excel-style version (even more like Excel)
export function CompactExcelStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: ExcelStudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Student; direction: 'asc' | 'desc' } | null>(null);

  // Filter and sort
  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue == null || bValue == null) return 0;
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: keyof Student) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-700';
      case 'inactive': return 'text-red-700';
      case 'pending': return 'text-yellow-700';
      case 'graduated': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className={cn('bg-white', className)}>
      {/* Search Bar */}
      <div className="border-b border-gray-200 p-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-6 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
            />
          </div>
          
          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
            <Filter className="h-3 w-3 text-gray-600" />
          </button>
          
          <button className="p-1 border border-gray-300 rounded hover:bg-gray-50">
            <Download className="h-3 w-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Excel Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          {/* Header */}
          <thead>
            <tr className="bg-gray-100">
              <th 
                className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('registration_number')}
              >
                <div className="flex items-center space-x-1">
                  <span>Reg No</span>
                  {sortConfig?.key === 'registration_number' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('first_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>First</span>
                  {sortConfig?.key === 'first_name' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('last_name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last</span>
                  {sortConfig?.key === 'last_name' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th 
                className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-200"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {sortConfig?.key === 'status' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </div>
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">
                Email
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">
                Phone
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">
                Program
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">
                Enrolled
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">
                Complete
              </th>
              <th className="border border-gray-300 px-2 py-1 text-left font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedStudents.map((student, index) => (
              <tr 
                key={student.id}
                className={cn(
                  'hover:bg-blue-50',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                )}
              >
                <td className="border border-gray-300 px-2 py-1 font-mono">
                  {student.registration_number}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {student.first_name}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {student.last_name}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <span className={cn('font-medium', getStatusColor(student.status))}>
                    {student.status}
                  </span>
                </td>
                <td className="border border-gray-300 px-2 py-1 truncate">
                  {student.email}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {student.phone || 'N/A'}
                </td>
                <td className="border border-gray-300 px-2 py-1 truncate">
                  {student.program}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {formatDate(student.enrollment_date)}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  {formatDate(student.expected_completion_date)}
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => onMessageClick?.(student.id)}
                      className="p-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                      title="Send Message"
                    >
                      <MessageSquare className="h-2.5 w-2.5" />
                    </button>
                    <button
                      onClick={() => onScheduleMeeting?.(student.id)}
                      className="p-0.5 bg-green-600 text-white rounded hover:bg-green-700"
                      title="Schedule Meeting"
                    >
                      <Calendar className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
