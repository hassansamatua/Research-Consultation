'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, RefreshCw, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: number;
  registration_number: string;
  program: string;
  degree_level: 'Masters' | 'PhD';
  enrollment_date: string;
  expected_completion_date: string;
  created_at: string;
  updated_at: string;
  current_stage: number;
  current_stage_id: number;
  last_approval_date: string;
  progress_percentage: number;
  status: 'active' | 'completed' | 'suspended';
  completion_date: string;
  user_id: number;
}

interface StudentBotProps {
  currentUser: any;
  onStudentCreated?: (student: Student) => void;
}

export function StudentBot({ currentUser, onStudentCreated }: StudentBotProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    registration_number: '',
    program: '',
    degree_level: 'Masters',
    status: 'active',
    current_stage: 1,
    progress_percentage: 0
  });

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'supervisor';

  // Load all students for admin
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        
        // For admin, load all students including newly created ones
        if (isAdmin) {
          // Get all students from API
          const response = await fetch('/api/students/all');
          if (response.ok) {
            const data = await response.json();
            setStudents(data.students || []);
          } else {
            // Fallback to mock data if API fails
            const mockStudents: Student[] = [
              {
                id: 1,
                registration_number: 'ZU/PG/2023/001',
                first_name: 'Ali',
                last_name: 'Hassan',
                email: 'student1@zumis.ac.tz',
                phone: '+255 777 123460',
                program: 'Computer Science',
                enrollment_date: '2023-09-01',
                expected_completion_date: '2025-09-01',
                status: 'active',
                user_id: 2860151,
                created_at: '2023-09-01T10:00:00Z'
              },
              {
                id: 2,
                registration_number: '2860151',
                first_name: 'Samatua',
                last_name: 'Hassan',
                email: 'student20@gmail.com',
                phone: 'N/A',
                program: 'Masters in Business Administration',
                enrollment_date: '2026-03-28',
                expected_completion_date: '2028-03-27',
                status: 'active',
                user_id: 2860152,
                created_at: '2026-03-28T10:00:00Z'
              }
            ];
            setStudents(mockStudents);
          }
        }
      } catch (error) {
        console.error('Error loading students:', error);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [isAdmin]);

  // Handle creating new student
  const handleCreateStudent = async () => {
    try {
      const studentData = {
        ...newStudent,
        enrollment_date: new Date().toISOString().split('T')[0],
        expected_completion_date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        user_id: currentUser?.id || 1,
        created_at: new Date().toISOString()
      };

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        const createdStudent = await response.json();
        
        // Add the new student to the list immediately
        setStudents(prev => [createdStudent, ...prev]);
        
        // Reset form
        setNewStudent({
          registration_number: '',
          program: '',
          degree_level: 'Masters',
          status: 'active',
          current_stage: 1,
          progress_percentage: 0
        });
        setShowCreateForm(false);
        
        // Notify parent component
        if (onStudentCreated) {
          onStudentCreated(createdStudent);
        }
        
        // Show success message
        alert('Student created successfully!');
      } else {
        alert('Failed to create student');
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error creating student');
    }
  };

  // Handle delete student
  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove student from list immediately
        setStudents(prev => prev.filter(s => s.id !== studentId));
        alert('Student deleted successfully!');
      } else {
        alert('Failed to delete student');
      }
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student');
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-yellow-600" />
          <span className="text-yellow-800">
            Admin access required to view and manage students
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Student Bot - All Students ({students.length})
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Student</span>
            </button>
            <button
              onClick={() => window.location.reload()}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Student Form */}
      {showCreateForm && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Create New Student</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
              <input
                type="text"
                value={newStudent.registration_number}
                onChange={(e) => setNewStudent(prev => ({ ...prev, registration_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter registration number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <input
                type="text"
                value={newStudent.program}
                onChange={(e) => setNewStudent(prev => ({ ...prev, program: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter program"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree Level</label>
              <select
                value={newStudent.degree_level}
                onChange={(e) => setNewStudent(prev => ({ ...prev, degree_level: e.target.value as 'Masters' | 'PhD' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
              <input
                type="date"
                value={newStudent.enrollment_date}
                onChange={(e) => setNewStudent(prev => ({ ...prev, enrollment_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Completion Date</label>
              <input
                type="date"
                value={newStudent.expected_completion_date}
                onChange={(e) => setNewStudent(prev => ({ ...prev, expected_completion_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newStudent.status}
                onChange={(e) => setNewStudent(prev => ({ ...prev, status: e.target.value as 'active' | 'completed' | 'suspended' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCreateStudent}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Student
            </button>
          </div>
        </div>
      )}

      {/* Students List */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading students...</span>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students found</p>
            <p className="text-sm text-gray-500">Create your first student to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Registration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Program
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Degree Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Stage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Created
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {student.registration_number.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.registration_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {student.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.program}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.degree_level}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      Stage {student.current_stage}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      )}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.created_at 
                        ? new Date(student.created_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => alert(`View student: ${student.registration_number}`)}
                          className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="View student"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => alert(`Edit student: ${student.registration_number}`)}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                          title="Edit student"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
