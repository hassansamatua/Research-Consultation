'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  id: number;
  name: string;
  email: string;
  registration_number: string;
  program: string;
  degree_level: string;
  enrollment_date: string;
  expected_completion: string;
  supervisor_name?: string;
  research_title?: string;
  progress: number;
  status: string;
}

export default function AllStudentsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filter, setFilter] = useState({
    program: '',
    degree_level: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchStudents();
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

  const fetchStudents = async () => {
    // Mock students data
    const mockStudents: Student[] = [
      {
        id: 1,
        name: 'Ali Hassan',
        email: 'student1@zumis.ac.tz',
        registration_number: 'ZU/PG/2023/001',
        program: 'Computer Science',
        degree_level: 'Masters',
        enrollment_date: '2023-09-01',
        expected_completion: '2025-09-01',
        supervisor_name: 'Dr. Mohamed Ali',
        research_title: 'Machine Learning Applications in Healthcare',
        progress: 65,
        status: 'active'
      },
      {
        id: 2,
        name: 'Fatma Omar',
        email: 'student2@zumis.ac.tz',
        registration_number: 'ZU/PG/2023/002',
        program: 'Business Administration',
        degree_level: 'Masters',
        enrollment_date: '2023-09-01',
        expected_completion: '2025-09-01',
        supervisor_name: 'Dr. Fatma Hassan',
        research_title: 'Digital Transformation Strategies in SMEs',
        progress: 40,
        status: 'active'
      },
      {
        id: 3,
        name: 'Omar Said',
        email: 'student3@zumis.ac.tz',
        registration_number: 'ZU/PG/2023/003',
        program: 'Education',
        degree_level: 'PhD',
        enrollment_date: '2023-09-01',
        expected_completion: '2027-09-01',
        supervisor_name: 'Dr. Mohamed Ali',
        research_title: 'Impact of Technology on Modern Education',
        progress: 25,
        status: 'active'
      },
      {
        id: 4,
        name: 'Amina Mohamed',
        email: 'student4@zumis.ac.tz',
        registration_number: 'ZU/PG/2023/004',
        program: 'Computer Science',
        degree_level: 'Masters',
        enrollment_date: '2023-09-01',
        expected_completion: '2025-09-01',
        progress: 0,
        status: 'pending'
      },
      {
        id: 5,
        name: 'Hassan Ali',
        email: 'student5@zumis.ac.tz',
        registration_number: 'ZU/PG/2023/005',
        program: 'Business Administration',
        degree_level: 'PhD',
        enrollment_date: '2023-09-01',
        expected_completion: '2027-09-01',
        progress: 0,
        status: 'pending'
      }
    ];
    setStudents(mockStudents);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProgram = !filter.program || student.program === filter.program;
    const matchesDegree = !filter.degree_level || student.degree_level === filter.degree_level;
    const matchesStatus = !filter.status || student.status === filter.status;
    
    return matchesSearch && matchesProgram && matchesDegree && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    if (progress >= 20) return 'bg-orange-600';
    return 'bg-red-600';
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
        <h1 className="text-3xl font-bold text-gray-900">All Students</h1>
        <p className="mt-2 text-gray-600">Manage and monitor all postgraduate students</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{students.length}</div>
          <p className="text-sm text-gray-600">Enrolled students</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Students</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {students.filter(s => s.status === 'active').length}
          </div>
          <p className="text-sm text-gray-600">Currently researching</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Allocation</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {students.filter(s => s.status === 'pending').length}
          </div>
          <p className="text-sm text-gray-600">Awaiting supervisors</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Progress</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length) : 0}%
          </div>
          <p className="text-sm text-gray-600">Overall completion</p>
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
                placeholder="Name, registration, or email"
              />
            </div>

            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                Program
              </label>
              <select
                name="program"
                id="program"
                value={filter.program}
                onChange={(e) => setFilter({...filter, program: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Programs</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Education">Education</option>
              </select>
            </div>

            <div>
              <label htmlFor="degree_level" className="block text-sm font-medium text-gray-700">
                Degree Level
              </label>
              <select
                name="degree_level"
                id="degree_level"
                value={filter.degree_level}
                onChange={(e) => setFilter({...filter, degree_level: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Levels</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Students ({filteredStudents.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Program
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Research
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
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
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.registration_number}</div>
                        <div className="text-xs text-gray-400">{student.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{student.program}</div>
                        <div className="text-xs text-gray-500">{student.degree_level}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.supervisor_name || 'Not assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {student.research_title || 'No title yet'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-green-600 hover:text-green-900 mr-3">
                        View
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
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
