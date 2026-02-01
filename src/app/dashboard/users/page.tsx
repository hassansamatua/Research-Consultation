'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role_name: string;
  department?: string;
  specialization?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  profile_image?: string;
}

export default function UsersPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState({
    role: '',
    department: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    // Mock users data
    const mockUsers: User[] = [
      {
        id: 1,
        first_name: 'Super',
        last_name: 'Admin',
        email: 'superadmin@zu.ac.tz',
        phone: '+255 777 123457',
        role_name: 'super_admin',
        department: 'Administration',
        is_active: true,
        last_login: '2024-01-15T10:30:00Z',
        created_at: '2023-01-01T00:00:00Z'
      },
      {
        id: 2,
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@zu.ac.tz',
        phone: '+255 777 123456',
        role_name: 'admin',
        department: 'Administration',
        is_active: true,
        last_login: '2024-01-15T09:15:00Z',
        created_at: '2023-01-15T00:00:00Z'
      },
      {
        id: 3,
        first_name: 'Mohamed',
        last_name: 'Ali',
        email: 'dr.mohamed@zu.ac.tz',
        phone: '+255 777 123458',
        role_name: 'supervisor',
        department: 'Computer Science',
        specialization: 'Machine Learning',
        is_active: true,
        last_login: '2024-01-15T08:45:00Z',
        created_at: '2023-02-01T00:00:00Z'
      },
      {
        id: 4,
        first_name: 'Fatma',
        last_name: 'Hassan',
        email: 'dr.fatma@zu.ac.tz',
        phone: '+255 777 123459',
        role_name: 'supervisor',
        department: 'Business Administration',
        specialization: 'Strategic Management',
        is_active: true,
        last_login: '2024-01-14T16:20:00Z',
        created_at: '2023-02-15T00:00:00Z'
      },
      {
        id: 5,
        first_name: 'John',
        last_name: 'Smith',
        email: 'dr.john@zu.ac.tz',
        phone: '+255 777 123460',
        role_name: 'supervisor',
        department: 'Education',
        specialization: 'Educational Technology',
        is_active: true,
        last_login: '2024-01-14T11:30:00Z',
        created_at: '2023-03-01T00:00:00Z'
      },
      {
        id: 6,
        first_name: 'Ali',
        last_name: 'Hassan',
        email: 'student1@zumis.ac.tz',
        phone: '+255 777 123461',
        role_name: 'student',
        department: 'Computer Science',
        is_active: true,
        last_login: '2024-01-15T11:30:00Z',
        created_at: '2023-09-01T00:00:00Z'
      },
      {
        id: 7,
        first_name: 'Fatma',
        last_name: 'Omar',
        email: 'student2@zumis.ac.tz',
        phone: '+255 777 123462',
        role_name: 'student',
        department: 'Business Administration',
        is_active: true,
        last_login: '2024-01-14T14:45:00Z',
        created_at: '2023-09-01T00:00:00Z'
      },
      {
        id: 8,
        first_name: 'Omar',
        last_name: 'Said',
        email: 'student3@zumis.ac.tz',
        phone: '+255 777 123463',
        role_name: 'student',
        department: 'Education',
        is_active: true,
        last_login: '2024-01-13T09:20:00Z',
        created_at: '2023-09-01T00:00:00Z'
      },
      {
        id: 9,
        first_name: 'Amina',
        last_name: 'Mohamed',
        email: 'student4@zumis.ac.tz',
        phone: '+255 777 123464',
        role_name: 'student',
        department: 'Computer Science',
        is_active: true,
        last_login: '2024-01-12T15:10:00Z',
        created_at: '2023-09-01T00:00:00Z'
      },
      {
        id: 10,
        first_name: 'Hassan',
        last_name: 'Ali',
        email: 'student5@zumis.ac.tz',
        phone: '+255 777 123465',
        role_name: 'student',
        department: 'Business Administration',
        is_active: false,
        last_login: '2024-01-10T10:30:00Z',
        created_at: '2023-09-01T00:00:00Z'
      }
    ];
    setUsers(mockUsers);
  };

  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (userItem.specialization && userItem.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = !filter.role || userItem.role_name === filter.role;
    const matchesDepartment = !filter.department || userItem.department === filter.department;
    const matchesStatus = !filter.status || (filter.status === 'active' && userItem.is_active) || (filter.status === 'inactive' && !userItem.is_active);
    
    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'supervisor': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleSendMessage = (recipientEmail: string) => {
    router.push(`/dashboard/messages?to=${recipientEmail}`);
  };

  const handleViewProfile = (userId: number) => {
    setSelectedUser(users.find(u => u.id === userId) || null);
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
        <h1 className="text-3xl font-bold text-gray-900">Users Directory</h1>
        <p className="mt-2 text-gray-600">Browse and connect with system users</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{users.length}</div>
          <p className="text-sm text-gray-600">All system users</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {users.filter(u => u.is_active).length}
          </div>
          <p className="text-sm text-gray-600">Currently active</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Supervisors</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {users.filter(u => u.role_name === 'supervisor').length}
          </div>
          <p className="text-sm text-gray-600">Faculty members</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {users.filter(u => u.role_name === 'student').length}
          </div>
          <p className="text-sm text-gray-600">Postgraduate students</p>
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
                placeholder="Name, email, or specialization"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="role"
                id="role"
                value={filter.role}
                onChange={(e) => setFilter({...filter, role: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                name="department"
                id="department"
                value={filter.department}
                onChange={(e) => setFilter({...filter, department: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Education">Education</option>
                <option value="Administration">Administration</option>
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
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((userItem) => (
              <div key={userItem.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-600">
                      {userItem.first_name.charAt(0)}{userItem.last_name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {userItem.first_name} {userItem.last_name}
                    </h4>
                    <p className="text-sm text-gray-500">{userItem.email}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Role</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(userItem.role_name)}`}>
                      {userItem.role_name.replace('_', ' ')}
                    </span>
                  </div>

                  {userItem.department && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Department</span>
                      <span className="text-sm text-gray-900">{userItem.department}</span>
                    </div>
                  )}

                  {userItem.specialization && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Specialization</span>
                      <span className="text-sm text-gray-900">{userItem.specialization}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(userItem.is_active)}`}>
                      {userItem.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  {userItem.last_login 
                    ? `Last login: ${new Date(userItem.last_login).toLocaleDateString()}`
                    : 'Never logged in'
                  }
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewProfile(userItem.id)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleSendMessage(userItem.email)}
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-white hover:bg-blue-50"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Profile</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-xl font-medium text-gray-600">
                  {selectedUser.first_name.charAt(0)}{selectedUser.last_name.charAt(0)}
                </span>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">
                  {selectedUser.first_name} {selectedUser.last_name}
                </h4>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                <span className={`inline-flex mt-1 px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getRoleColor(selectedUser.role_name)}`}>
                  {selectedUser.role_name.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone</span>
                <span className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</span>
              </div>

              {selectedUser.department && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Department</span>
                  <span className="text-sm text-gray-900">{selectedUser.department}</span>
                </div>
              )}

              {selectedUser.specialization && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Specialization</span>
                  <span className="text-sm text-gray-900">{selectedUser.specialization}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedUser.is_active)}`}>
                  {selectedUser.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm text-gray-900">
                  {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm text-gray-900">
                  {selectedUser.last_login 
                    ? new Date(selectedUser.last_login).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Never'
                  }
                </span>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => handleSendMessage(selectedUser.email)}
                className="flex-1 px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
