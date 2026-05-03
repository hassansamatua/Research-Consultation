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

interface ImageStyleStudentListProps {
  students: Student[];
  onMessageClick?: (studentId: number) => void;
  onScheduleMeeting?: (studentId: number) => void;
  className?: string;
}

export function ImageStyleStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: ImageStyleStudentListProps) {
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

      {/* Image-style List */}
      <div className="divide-y divide-gray-200">
        {filteredStudents.map((student, index) => (
          <div 
            key={student.id}
            className={cn(
              'p-4 hover:bg-gray-50 transition-colors',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            )}
          >
            {/* Student Row - Image Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
              {/* Left Column - Basic Info */}
              <div className="space-y-2">
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
                <div className="text-sm text-gray-900 font-medium">
                  {student.first_name} {student.last_name}
                </div>
                <div className="text-sm text-gray-600">
                  {student.email}
                </div>
                {student.phone && (
                  <div className="text-sm text-gray-600">
                    {student.phone}
                  </div>
                )}
              </div>

              {/* Middle Column - Academic Info */}
              <div className="space-y-2">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Program:</span> {student.program}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Enrolled:</span> {formatDate(student.enrollment_date)}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Expected Completion:</span> {formatDate(student.expected_completion_date)}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">User ID:</span> {student.user_id}
                </div>
              </div>

              {/* Right Column - Actions */}
              <div className="flex items-center space-x-2 lg:col-span-2 xl:col-span-2">
                <button
                  onClick={() => onMessageClick?.(student.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => onScheduleMeeting?.(student.id)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Meeting</span>
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

// Ultra-clean version - closer to image style
export function UltraCleanStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: ImageStyleStudentListProps) {
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
      {/* Simple Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Students ({filteredStudents.length})</h3>
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

      {/* Ultra-Clean List */}
      <div className="divide-y divide-gray-200">
        {filteredStudents.map((student, index) => (
          <div 
            key={student.id}
            className={cn(
              'p-4 hover:bg-gray-50 transition-colors',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            )}
          >
            {/* Clean Row Layout */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
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
                
                <div className="text-sm text-gray-900 font-medium mb-1">
                  {student.first_name} {student.last_name}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Email:</span> {student.email}
                  </div>
                  {student.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {student.phone}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Program:</span> {student.program}
                  </div>
                  <div>
                    <span className="font-medium">Enrolled:</span> {formatDate(student.enrollment_date)}
                  </div>
                  <div>
                    <span className="font-medium">Complete:</span> {formatDate(student.expected_completion_date)}
                  </div>
                  <div>
                    <span className="font-medium">ID:</span> {student.user_id}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => onMessageClick?.(student.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Message</span>
                </button>
                <button
                  onClick={() => onScheduleMeeting?.(student.id)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Meeting</span>
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

// Table-style version - exactly like image
export function TableStyleStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: ImageStyleStudentListProps) {
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
          <h3 className="text-lg font-semibold text-gray-900">Students ({filteredStudents.length})</h3>
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

      {/* Table-style List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Registration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Program
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enrolled
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Complete
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student, index) => (
              <tr key={student.id} className={cn(
                'hover:bg-gray-50',
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              )}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {student.registration_number}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.first_name} {student.last_name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={cn(
                    'inline-flex px-2 py-0.5 text-xs font-medium rounded',
                    getStatusColor(student.status)
                  )}>
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.phone || 'N/A'}
                </td>
                <td className="px-4 py-4 text-sm text-gray-900">
                  {student.program}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(student.enrollment_date)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(student.expected_completion_date)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onMessageClick?.(student.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => onScheduleMeeting?.(student.id)}
                      className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
                    >
                      <Calendar className="h-3 w-3" />
                      <span>Meeting</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No students found</p>
        </div>
      )}
    </div>
  );
}
