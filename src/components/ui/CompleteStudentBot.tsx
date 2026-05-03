'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, RefreshCw, Search, Filter, Eye, Edit, Trash2, Mail, Phone, MapPin, Calendar, Award, BookOpen, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Student {
  id: number;
  registration_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  address?: string;
  city?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  profile_image?: string;
  notes?: string;
  scholarship_status?: 'none' | 'partial' | 'full';
  gpa?: number;
  admission_score?: number;
  previous_education?: string;
  work_experience?: string;
  skills?: string;
  interests?: string;
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

interface CompleteStudentBotProps {
  currentUser: any;
  onStudentCreated?: (student: Student) => void;
}

export function CompleteStudentBot({ currentUser, onStudentCreated }: CompleteStudentBotProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'detailed'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState<Partial<Student>>({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    phone: '',
    gender: 'other',
    date_of_birth: '',
    address: '',
    city: '',
    country: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    profile_image: '',
    notes: '',
    scholarship_status: 'none',
    gpa: undefined,
    admission_score: undefined,
    previous_education: '',
    work_experience: '',
    skills: '',
    interests: '',
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
          // Get all students from API with complete information
          const response = await fetch('/api/students/complete');
          if (response.ok) {
            const data = await response.json();
            setStudents(data.students || []);
          } else {
            // Fallback to mock data with complete student information
            const mockStudents: Student[] = [
              {
                id: 1,
                registration_number: 'ZU/PG/2023/001',
                first_name: 'Ali',
                last_name: 'Hassan',
                middle_name: 'Abdul',
                email: 'ali.hassan@zumis.ac.tz',
                phone: '+255 777 123460',
                gender: 'male',
                date_of_birth: '1995-05-15',
                address: '123 Main Street, Dar es Salaam',
                city: 'Dar es Salaam',
                country: 'Tanzania',
                emergency_contact_name: 'Fatuma Hassan',
                emergency_contact_phone: '+255 777 123461',
                emergency_contact_relationship: 'Mother',
                profile_image: '/images/ali_hassan.jpg',
                notes: 'Excellent academic performance, interested in AI research',
                scholarship_status: 'partial',
                gpa: 3.8,
                admission_score: 85.5,
                previous_education: 'Bachelor of Science in Computer Science',
                work_experience: '2 years as software developer',
                skills: 'JavaScript, Python, React, Node.js, Machine Learning',
                interests: 'Artificial Intelligence, Web Development, Data Science',
                program: 'Computer Science',
                degree_level: 'Masters',
                enrollment_date: '2023-09-01',
                expected_completion_date: '2025-09-01',
                status: 'active',
                current_stage: 2,
                current_stage_id: 2,
                progress_percentage: 65,
                created_at: '2023-09-01T10:00:00Z',
                updated_at: '2024-01-15T10:00:00Z',
                last_approval_date: '2024-01-10T10:00:00Z',
                completion_date: null,
                user_id: 2860151
              },
              {
                id: 2,
                registration_number: '2860151',
                first_name: 'Samatua',
                last_name: 'Hassan',
                middle_name: 'Juma',
                email: 'samatua.hassan@zumis.ac.tz',
                phone: '+255 789 123456',
                gender: 'male',
                date_of_birth: '1992-08-20',
                address: '456 University Avenue, Dar es Salaam',
                city: 'Dar es Salaam',
                country: 'Tanzania',
                emergency_contact_name: 'Mariam Hassan',
                emergency_contact_phone: '+255 789 123457',
                emergency_contact_relationship: 'Mother',
                profile_image: '/images/samatua_hassan.jpg',
                notes: 'Strong background in business management, research interest',
                scholarship_status: 'full',
                gpa: 3.6,
                admission_score: 78.2,
                previous_education: 'Bachelor of Business Administration',
                work_experience: '3 years in banking sector',
                skills: 'Financial Analysis, Risk Management, Business Strategy',
                interests: 'Finance, Investment, Economic Research',
                program: 'Masters in Business Administration',
                degree_level: 'Masters',
                enrollment_date: '2026-03-28',
                expected_completion_date: '2028-03-27',
                status: 'active',
                current_stage: 1,
                current_stage_id: 1,
                progress_percentage: 25,
                created_at: '2026-03-28T10:00:00Z',
                updated_at: '2026-04-01T10:00:00Z',
                last_approval_date: '2026-03-28T10:00:00Z',
                completion_date: null,
                user_id: 2860152
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await fetch('/api/students/complete', {
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
          first_name: '',
          last_name: '',
          middle_name: '',
          email: '',
          phone: '',
          gender: 'other',
          date_of_birth: '',
          address: '',
          city: '',
          country: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          emergency_contact_relationship: '',
          profile_image: '',
          notes: '',
          scholarship_status: 'none',
          gpa: undefined,
          admission_score: undefined,
          previous_education: '',
          work_experience: '',
          skills: '',
          interests: '',
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
      const response = await fetch(`/api/students/complete/${studentId}`, {
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

  // Show all students without search filter
  const filteredStudents = students;

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
              Complete Student Bot - All Students ({students.length})
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  'p-1.5 rounded text-xs font-medium transition-colors',
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Filter className="h-3 w-3 mr-1" />
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={cn(
                  'p-1.5 rounded text-xs font-medium transition-colors',
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Users className="h-3 w-3 mr-1" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={cn(
                  'p-1.5 rounded text-xs font-medium transition-colors',
                  viewMode === 'detailed' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Eye className="h-3 w-3 mr-1" />
                Detailed
              </button>
            </div>
            
                        
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
            {/* Basic Information */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={newStudent.middle_name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, middle_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter middle name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | 'other' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={newStudent.date_of_birth}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, date_of_birth: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={newStudent.address}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full address"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newStudent.city}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={newStudent.country}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter country"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    value={newStudent.emergency_contact_name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter emergency contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    value={newStudent.emergency_contact_phone}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter emergency contact phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={newStudent.emergency_contact_relationship}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, emergency_contact_relationship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter relationship (e.g., Mother, Father, Guardian)"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Academic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program *</label>
                  <input
                    type="text"
                    value={newStudent.program}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, program: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter academic program"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Degree Level *</label>
                  <select
                    value={newStudent.degree_level}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, degree_level: e.target.value as 'Masters' | 'PhD' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Degree Level</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                    <option value="Bachelor">Bachelor</option>
                    <option value="Diploma">Diploma</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Status</label>
                  <select
                    value={newStudent.scholarship_status}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, scholarship_status: e.target.value as 'none' | 'partial' | 'full' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Scholarship Status</option>
                    <option value="none">None</option>
                    <option value="partial">Partial</option>
                    <option value="full">Full</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newStudent.gpa || ''}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, gpa: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter GPA (e.g., 3.8)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admission Score</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newStudent.admission_score || ''}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, admission_score: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter admission score (e.g., 85.5)"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previous Education</label>
                  <textarea
                    value={newStudent.previous_education}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, previous_education: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter previous education details"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Work Experience</label>
                  <textarea
                    value={newStudent.work_experience}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, work_experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter work experience details"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Skills and Interests */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Skills & Interests</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  <textarea
                    value={newStudent.skills}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, skills: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter skills (comma separated)"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
                  <textarea
                    value={newStudent.interests}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, interests: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter interests and hobbies"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Notes</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter any additional notes or comments"
                  rows={4}
                />
              </div>
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

      {/* Students Display */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading students...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students found</p>
            <p className="text-sm text-gray-500">Create your first student to get started</p>
          </div>
        ) : viewMode === 'table' ? (
          <TableStudentList students={filteredStudents} />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                {/* Student Header */}
                <div className="flex items-center space-x-4 mb-4">
                  {student.profile_image ? (
                    <img 
                      src={student.profile_image} 
                      alt={`${student.first_name} ${student.last_name}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {student.first_name[0]}{student.last_name[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {student.registration_number} • {student.program}
                    </p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{student.email}</span>
                  </div>
                  {student.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {student.city}, {student.country}
                    </span>
                  </div>
                </div>

                {/* Academic Info */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Degree Level:</span>
                    <span className="text-sm text-gray-900">{student.degree_level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">GPA:</span>
                    <span className="text-sm text-gray-900">{student.gpa || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Admission Score:</span>
                    <span className="text-sm text-gray-900">{student.admission_score || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Scholarship:</span>
                    <span className="text-sm text-gray-900">{student.scholarship_status || 'None'}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mt-4">
                  <span className={cn(
                    'px-3 py-1 text-xs font-medium rounded-full',
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  )}>
                    {student.status}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert(`View student: ${student.first_name} ${student.last_name}`)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View student details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => alert(`Edit student: ${student.first_name} ${student.last_name}`)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Edit student"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStudents.map((student) => (
              <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-6">
                {/* Student Header */}
                <div className="flex items-center space-x-4 mb-4">
                  {student.profile_image ? (
                    <img 
                      src={student.profile_image} 
                      alt={`${student.first_name} ${student.last_name}`}
                      className="w-20 h-20 rounded-lg object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {student.first_name[0]}{student.last_name[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                    </h3>
                    <p className="text-gray-600">
                      {student.registration_number} • {student.program}
                    </p>
                    <p className="text-sm text-gray-500">
                      {student.city}, {student.country}
                    </p>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Contact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{student.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Academic</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Degree Level:</span>
                        <span className="text-sm font-medium">{student.degree_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">GPA:</span>
                        <span className="text-sm font-medium">{student.gpa || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Scholarship:</span>
                        <span className="text-sm font-medium">{student.scholarship_status || 'None'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert(`View student: ${student.first_name} ${student.last_name}`)}
                      className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                      title="View student details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => alert(`Edit student: ${student.first_name} ${student.last_name}`)}
                      className="p-2 text-green-600 hover:text-green-800 transition-colors"
                      title="Edit student"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      'px-3 py-1 text-xs font-medium rounded-full',
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    )}>
                      {student.status}
                    </span>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      title="Delete student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
