'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Search,
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

interface ExcelLikeStudentListProps {
  students: Student[];
  onMessageClick?: (studentId: number) => void;
  onScheduleMeeting?: (studentId: number) => void;
  className?: string;
}

export function ExcelLikeStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: ExcelLikeStudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students
  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className={cn('bg-white', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
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
              <Download className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Excel-like List */}
      <div className="divide-y divide-gray-200">
        {filteredStudents.map((student, index) => (
          <div 
            key={student.id}
            className={cn(
              'p-4 hover:bg-gray-50 transition-colors',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            )}
          >
            {/* Student Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-center">
              {/* Registration Number and Name */}
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {student.registration_number}
                  </span>
                  <span className={cn(
                    'inline-flex px-2 py-0.5 text-xs font-medium rounded',
                    getStatusColor(student.status)
                  )}>
                    {student.status}
                  </span>
                </div>
                <div className="text-sm text-gray-900">
                  <span className="font-medium">{student.first_name}</span>
                  <span className="ml-1">{student.last_name}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-1">
                <div className="text-sm text-gray-600 truncate">
                  <span className="font-medium">Email:</span> {student.email}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {student.phone || 'N/A'}
                </div>
              </div>

              {/* Program Info */}
              <div className="space-y-1">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Program:</span> {student.program}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Complete:</span> {formatDate(student.expected_completion_date)}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-1">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Enrolled:</span> {formatDate(student.enrollment_date)}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">ID:</span> {student.user_id}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onMessageClick?.(student.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => onScheduleMeeting?.(student.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-3 w-3" />
                  <span>Meeting</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No students found</p>
        </div>
      )}
    </div>
  );
}

// Ultra-simple Excel-like list (most compact)
export function UltraSimpleExcelList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: ExcelLikeStudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students
  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Get status color
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
      {/* Simple Header */}
      <div className="border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Students ({filteredStudents.length})</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2 top-1.5 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ultra-simple List */}
      <div className="divide-y divide-gray-100">
        {filteredStudents.map((student, index) => (
          <div 
            key={student.id}
            className={cn(
              'p-3 hover:bg-gray-50 transition-colors',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            )}
          >
            {/* Single Row Layout */}
            <div className="flex items-center justify-between">
              {/* Left Side - Basic Info */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="text-xs font-mono text-gray-900">
                    {student.registration_number}
                  </div>
                  <div className={cn('text-xs font-medium mt-1', getStatusColor(student.status))}>
                    {student.status}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {student.first_name} {student.last_name}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {student.program}
                  </div>
                </div>
              </div>

              {/* Right Side - Contact and Actions */}
              <div className="flex items-center space-x-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-xs text-gray-600 truncate max-w-[150px]">
                    {student.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(student.enrollment_date)} - {formatDate(student.expected_completion_date)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onMessageClick?.(student.id)}
                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    title="Send Message"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onScheduleMeeting?.(student.id)}
                    className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                    title="Schedule Meeting"
                  >
                    <Calendar className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No students found</p>
        </div>
      )}
    </div  );
}

// Card-based Excel-like list
export function CardExcelList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: ExcelLikeStudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students
  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className={cn('bg-white', className)}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
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
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <div 
              key={student.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {student.first_name} {student.last_name}
                    </h3>
                    <span className={cn(
                      'inline-flex px-2 py-0.5 text-xs font-medium rounded',
                      getStatusColor(student.status)
                    )}>
                      {student.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-mono">
                    {student.registration_number}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-3">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Email:</span> {student.email}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Phone:</span> {student.phone || 'N/A'}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Program:</span> {student.program}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Enrolled:</span> {formatDate(student.enrollment_date)}
                </div>
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Complete:</span> {formatDate(student.expected_completion_date)}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => onMessageClick?.(student.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => onScheduleMeeting?.(student.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-3 w-3" />
                  <span>Meeting</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No students found</p>
        </div>
      )}
    </div>
  );
}
