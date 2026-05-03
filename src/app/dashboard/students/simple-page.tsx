'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ResponsiveDashboardWithNotifications,
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveButton,
  ResponsiveGrid
} from '@/components/ui/ResponsiveDashboardWithNotifications';
import { 
  UltraCompactStudentList,
  CompactStudentList,
  SimpleStudentList
} from '@/components/ui/SimpleStudentList';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download,
  RefreshCw,
  UserPlus,
  GraduationCap,
  Mail,
  Phone
} from 'lucide-react';

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

export default function SimpleStudentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'compact' | 'ultra-compact' | 'simple'>('compact');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for demonstration
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
      user_id: 2860151
    },
    {
      id: 2,
      registration_number: 'ZU/PG/2026/002',
      first_name: 'Samatua',
      last_name: 'Hassan',
      email: 'student20@gmail.com',
      phone: 'N/A',
      program: 'Masters in Business Administration',
      enrollment_date: '2026-03-28',
      expected_completion_date: '2028-03-27',
      status: 'active',
      user_id: 2860152
    },
    {
      id: 3,
      registration_number: 'ZU/PG/2023/001',
      first_name: 'Ali',
      last_name: 'Hassan',
      email: 'student1@zumis.ac.tz',
      phone: '+255 777 123460',
      program: 'Computer Science',
      enrollment_date: '2023-09-01',
      expected_completion_date: '2025-09-01',
      status: 'active',
      user_id: 2860153
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const authResponse = await fetch('/api/auth/me');
        if (authResponse.ok) {
          const userData = await authResponse.json();
          setUser(userData.user);
          
          // For now, use mock data
          setStudents(mockStudents);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        setError('Failed to load data');
        // Still show mock data on error
        setStudents(mockStudents);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleMessageClick = (studentId: number) => {
    router.push(`/dashboard/messages/new?student_id=${studentId}`);
  };

  const handleScheduleMeeting = (studentId: number) => {
    router.push(`/dashboard/meetings/new?student_id=${studentId}`);
  };

  const handleAddStudent = () => {
    router.push('/dashboard/students/new');
  };

  const handleExport = () => {
    // Export functionality
    console.log('Export students');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setStudents(mockStudents);
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <ResponsiveDashboardWithNotifications 
        user={{ name: 'Loading...', email: '', role: 'supervisor' }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </ResponsiveDashboardWithNotifications>
    );
  }

  return (
    <ResponsiveDashboardWithNotifications 
      user={user || { name: 'Supervisor', email: 'supervisor@zumis.ac.tz', role: 'supervisor' }}
    >
      <ResponsiveContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Students</h1>
              <p className="text-gray-600">
                {students.length} student{students.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <ResponsiveButton
                variant="outline"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </ResponsiveButton>
              
              <ResponsiveButton
                variant="outline"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </ResponsiveButton>
              
              <ResponsiveButton
                variant="primary"
                onClick={handleAddStudent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </ResponsiveButton>
            </div>
          </div>

          {/* View Mode Toggle */}
          <ResponsiveCard>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">View Mode:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('ultra-compact')}
                    className={`px-3 py-1 text-xs rounded ${
                      viewMode === 'ultra-compact' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Ultra Compact
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`px-3 py-1 text-xs rounded ${
                      viewMode === 'compact' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Compact
                  </button>
                  <button
                    onClick={() => setViewMode('simple')}
                    className={`px-3 py-1 text-xs rounded ${
                      viewMode === 'simple' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Simple
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{students.length} total</span>
              </div>
            </div>
          </ResponsiveCard>

          {/* Student List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Student List</h2>
            </div>
            
            <div className="p-4">
              {viewMode === 'ultra-compact' && (
                <UltraCompactStudentList
                  students={students}
                  onMessageClick={handleMessageClick}
                  onScheduleMeeting={handleScheduleMeeting}
                />
              )}
              
              {viewMode === 'compact' && (
                <CompactStudentList
                  students={students}
                  onMessageClick={handleMessageClick}
                  onScheduleMeeting={handleScheduleMeeting}
                />
              )}
              
              {viewMode === 'simple' && (
                <SimpleStudentList
                  students={students}
                  onMessageClick={handleMessageClick}
                  onScheduleMeeting={handleScheduleMeeting}
                />
              )}
            </div>
          </div>

          {/* Statistics */}
          <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }}>
            <ResponsiveCard>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-lg font-semibold text-gray-900">{students.length}</p>
                </div>
              </div>
            </ResponsiveCard>
            
            <ResponsiveCard>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {students.filter(s => s.status === 'active').length}
                  </p>
                </div>
              </div>
            </ResponsiveCard>
            
            <ResponsiveCard>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email Contacts</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {students.filter(s => s.email && s.email !== 'N/A').length}
                  </p>
                </div>
              </div>
            </ResponsiveCard>
            
            <ResponsiveCard>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Contacts</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {students.filter(s => s.phone && s.phone !== 'N/A').length}
                  </p>
                </div>
              </div>
            </ResponsiveCard>
          </ResponsiveGrid>
        </div>
      </ResponsiveContainer>
    </ResponsiveDashboardWithNotifications>
  );
}
