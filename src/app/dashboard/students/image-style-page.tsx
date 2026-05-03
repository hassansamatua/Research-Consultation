'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ResponsiveDashboardWithNotifications,
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveButton
} from '@/components/ui/ResponsiveDashboardWithNotifications';
import { 
  ImageStyleStudentList,
  UltraCleanStudentList,
  TableStyleStudentList
} from '@/components/ui/ImageStyleStudentList';
import { 
  Users, 
  Plus, 
  RefreshCw,
  Download,
  LayoutList,
  Table,
  Grid3X3
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

export default function ImageStylePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'image-style' | 'ultra-clean' | 'table-style'>('ultra-clean');

  // Mock data matching your exact requirements
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
      registration_number: '2860151',
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
    },
    {
      id: 4,
      registration_number: 'ZU/PG/2024/002',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@zumis.ac.tz',
      phone: '+255 777 123461',
      program: 'Information Technology',
      enrollment_date: '2024-01-15',
      expected_completion_date: '2026-01-15',
      status: 'active',
      user_id: 2860154
    },
    {
      id: 5,
      registration_number: 'ZU/PG/2024/003',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@zumis.ac.tz',
      phone: '+255 777 123462',
      program: 'Data Science',
      enrollment_date: '2024-02-01',
      expected_completion_date: '2026-02-01',
      status: 'pending',
      user_id: 2860155
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
    // Export to CSV functionality
    const headers = ['Reg Number', 'First Name', 'Last Name', 'Status', 'Email', 'Phone', 'Program', 'Enrolled', 'Complete'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.registration_number,
        student.first_name,
        student.last_name,
        student.status,
        student.email,
        student.phone || 'N/A',
        student.program,
        new Date(student.enrollment_date).toLocaleDateString(),
        new Date(student.expected_completion_date).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Image Style Student List</h1>
              <p className="text-gray-600">
                {students.length} student{students.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 border border-gray-300 rounded p-1">
                <button
                  onClick={() => setViewMode('ultra-clean')}
                  className={cn(
                    'p-1.5 rounded text-xs font-medium transition-colors',
                    viewMode === 'ultra-clean' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <LayoutList className="h-3 w-3 mr-1" />
                  Clean
                </button>
                <button
                  onClick={() => setViewMode('image-style')}
                  className={cn(
                    'p-1.5 rounded text-xs font-medium transition-colors',
                    viewMode === 'image-style' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table-style')}
                  className={cn(
                    'p-1.5 rounded text-xs font-medium transition-colors',
                    viewMode === 'table-style' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Table className="h-3 w-3 mr-1" />
                  Table
                </button>
              </div>
              
              <ResponsiveButton
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </ResponsiveButton>
              
              <ResponsiveButton
                variant="outline"
                size="sm"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </ResponsiveButton>
              
              <ResponsiveButton
                variant="primary"
                size="sm"
                onClick={handleAddStudent}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </ResponsiveButton>
            </div>
          </div>

          {/* Student List */}
          {viewMode === 'ultra-clean' && (
            <UltraCleanStudentList
              students={students}
              onMessageClick={handleMessageClick}
              onScheduleMeeting={handleScheduleMeeting}
            />
          )}
          
          {viewMode === 'image-style' && (
            <ImageStyleStudentList
              students={students}
              onMessageClick={handleMessageClick}
              onScheduleMeeting={handleScheduleMeeting}
            />
          )}
          
          {viewMode === 'table-style' && (
            <TableStyleStudentList
              students={students}
              onMessageClick={handleMessageClick}
              onScheduleMeeting={handleScheduleMeeting}
            />
          )}

          {/* Statistics Summary */}
          <div className="bg-gray-50 border border-gray-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">
                  Total: <strong>{students.length}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">
                  Active: <strong>{students.filter(s => s.status === 'active').length}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">
                  Pending: <strong>{students.filter(s => s.status === 'pending').length}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">
                  Graduated: <strong>{students.filter(s => s.status === 'graduated').length}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveContainer>
    </ResponsiveDashboardWithNotifications>
  );
}
