'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Calendar, 
  Mail, 
  Phone, 
  User,
  GraduationCap,
  Clock,
  CheckCircle
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

interface SimpleStudentListProps {
  students: Student[];
  onMessageClick?: (studentId: number) => void;
  onScheduleMeeting?: (studentId: number) => void;
  className?: string;
}

export function SimpleStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: SimpleStudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'graduated': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No students found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {filteredStudents.map((student) => (
          <SimpleStudentCard
            key={student.id}
            student={student}
            onMessageClick={onMessageClick}
            onScheduleMeeting={onScheduleMeeting}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-600">No students found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

function SimpleStudentCard({ 
  student, 
  onMessageClick, 
  onScheduleMeeting 
}: {
  student: Student;
  onMessageClick?: (studentId: number) => void;
  onScheduleMeeting?: (studentId: number) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'graduated': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statusColor = getStatusColor(student.status);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {student.first_name} {student.last_name}
            </h3>
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
              statusColor
            )}>
              {student.status}
            </span>
          </div>
          <p className="text-xs text-gray-600 font-mono">
            {student.registration_number}
          </p>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">
            {student.first_name[0]}{student.last_name[0]}
          </span>
        </div>
      </div>

      {/* Program and Contact Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-700">{student.program}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Mail className="h-3 w-3 text-gray-400" />
          <span className="text-xs text-gray-700 truncate">{student.email}</span>
        </div>
        
        {student.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-700">{student.phone}</span>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Enrolled: {formatDate(student.enrollment_date)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Complete: {formatDate(student.expected_completion_date)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onMessageClick?.(student.id)}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          <span>Send Message</span>
        </button>
        <button
          onClick={() => onScheduleMeeting?.(student.id)}
          className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
        >
          <Calendar className="h-3 w-3" />
          <span>Schedule Meeting</span>
        </button>
      </div>
    </div>
  );
}

// Compact version for tighter spacing
export function CompactStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: SimpleStudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'graduated': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No students found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Compact Student List */}
      <div className="space-y-1">
        {filteredStudents.map((student) => (
          <CompactStudentCard
            key={student.id}
            student={student}
            onMessageClick={onMessageClick}
            onScheduleMeeting={onScheduleMeeting}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-600">No students found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

function CompactStudentCard({ 
  student, 
  onMessageClick, 
  onScheduleMeeting 
}: {
  student: Student;
  onMessageClick?: (studentId: number) => void;
  onScheduleMeeting?: (studentId: number) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'graduated': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const statusColor = getStatusColor(student.status);

  return (
    <div className="bg-white border border-gray-200 rounded p-3 hover:bg-gray-50 transition-colors">
      {/* Main Info Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">
              {student.first_name[0]}{student.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {student.first_name} {student.last_name}
              </h3>
              <span className={cn('text-xs font-medium', statusColor)}>
                {student.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-mono truncate">
              {student.registration_number}
            </p>
          </div>
        </div>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 text-xs">
        <div>
          <span className="text-gray-500">Program:</span>
          <span className="text-gray-700 ml-1">{student.program}</span>
        </div>
        <div>
          <span className="text-gray-500">Email:</span>
          <span className="text-gray-700 ml-1 truncate">{student.email}</span>
        </div>
        {student.phone && (
          <div>
            <span className="text-gray-500">Phone:</span>
            <span className="text-gray-700 ml-1">{student.phone}</span>
          </div>
        )}
        <div>
          <span className="text-gray-500">Complete:</span>
          <span className="text-gray-700 ml-1">
            {new Date(student.expected_completion_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onMessageClick?.(student.id)}
          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="h-3 w-3" />
          <span>Message</span>
        </button>
        <button
          onClick={() => onScheduleMeeting?.(student.id)}
          className="flex-1 flex items-center justify-center space-x-1 px-2 py-1 border border-gray-300 text-gray-700 text-xs rounded hover:bg-gray-50 transition-colors"
        >
          <Calendar className="h-3 w-3" />
          <span>Meeting</span>
        </button>
      </div>
    </div>
  );
}

// Ultra-compact version for maximum density
export function UltraCompactStudentList({ 
  students, 
  onMessageClick, 
  onScheduleMeeting,
  className = '' 
}: SimpleStudentListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(student =>
    student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'graduated': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No students found</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>

      {/* Ultra-Compact Student List */}
      <div className="space-y-1">
        {filteredStudents.map((student) => (
          <UltraCompactStudentCard
            key={student.id}
            student={student}
            onMessageClick={onMessageClick}
            onScheduleMeeting={onScheduleMeeting}
          />
        ))}
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-600">No students found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

function UltraCompactStudentCard({ 
  student, 
  onMessageClick, 
  onScheduleMeeting 
}: {
  student: Student;
  onMessageClick?: (studentId: number) => void;
  onScheduleMeeting?: (studentId: number) => void;
}) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'graduated': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const statusColor = getStatusColor(student.status);

  return (
    <div className="bg-white border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        {/* Student Info */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">
              {student.first_name[0]}{student.last_name[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-semibold text-gray-900 truncate">
                {student.first_name} {student.last_name}
              </h3>
              <span className={cn('text-xs font-medium', statusColor)}>
                {student.status}
              </span>
            </div>
            <p className="text-xs text-gray-600 font-mono truncate">
              {student.registration_number}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {student.program}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          <button
            onClick={() => onMessageClick?.(student.id)}
            className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="Send Message"
          >
            <MessageSquare className="h-3 w-3" />
          </button>
          <button
            onClick={() => onScheduleMeeting?.(student.id)}
            className="p-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            title="Schedule Meeting"
          >
            <Calendar className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
