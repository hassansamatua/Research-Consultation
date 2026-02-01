'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  pendingApprovals: number;
  systemHealth: string;
}

interface RecentActivity {
  id: number;
  type: string;
  description: string;
  user: string;
  timestamp: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 201,
    totalProjects: 142,
    pendingApprovals: 8,
    systemHealth: 'excellent'
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: '',
    registration_number: '',
    program: '',
    specialization: '',
    department: '',
    max_students: 5
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchAdminData();
    fetchRoles();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user is admin or super_admin
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

  const fetchAdminData = async () => {
    // Mock admin data
    const mockActivity: RecentActivity[] = [
      {
        id: 1,
        type: 'user_registration',
        description: 'New student registered: Ali Hassan',
        user: 'System',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        type: 'supervisor_allocation',
        description: 'Dr. Mohamed Ali assigned 3 new students',
        user: 'Admin User',
        timestamp: '2024-01-15T09:15:00Z'
      },
      {
        id: 3,
        type: 'submission_review',
        description: '5 proposals awaiting review',
        user: 'System',
        timestamp: '2024-01-14T16:20:00Z'
      },
      {
        id: 4,
        type: 'system_backup',
        description: 'Automatic database backup completed',
        user: 'System',
        timestamp: '2024-01-14T02:00:00Z'
      },
      {
        id: 5,
        type: 'deadline_created',
        description: 'New deadline created: Chapter 1 Submission',
        user: 'Admin User',
        timestamp: '2024-01-13T14:30:00Z'
      }
    ];
    setRecentActivity(mockActivity);
  };

  const fetchRoles = async () => {
    try {
      console.log('Fetching roles...');
      const response = await fetch('/api/admin/roles');
      console.log('Roles response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Roles data:', data);
        setRoles(data.roles);
      } else {
        const errorData = await response.json();
        console.error('Roles API error:', errorData);
        // Fallback to hardcoded roles if API fails
        console.log('Using fallback roles');
        setRoles([
          { id: 1, name: 'student', description: 'Student user' },
          { id: 2, name: 'supervisor', description: 'Supervisor user' },
          { id: 3, name: 'admin', description: 'Admin user' },
          { id: 4, name: 'super_admin', description: 'Super admin user' }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      // Fallback to hardcoded roles
      console.log('Using fallback roles due to error');
      setRoles([
        { id: 1, name: 'student', description: 'Student user' },
        { id: 2, name: 'supervisor', description: 'Supervisor user' },
        { id: 3, name: 'admin', description: 'Admin user' },
        { id: 4, name: 'super_admin', description: 'Super admin user' }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          role_id: '',
          registration_number: '',
          program: '',
          specialization: '',
          department: '',
          max_students: 5
        });
        setShowUserForm(false);
        fetchAdminData();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setError('An error occurred while creating the user');
      console.error('Create user error:', error);
    } finally {
      setCreating(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return '👤';
      case 'supervisor_allocation': return '🔄';
      case 'submission_review': return '📝';
      case 'system_backup': return '💾';
      case 'deadline_created': return '📅';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration': return 'text-blue-600';
      case 'supervisor_allocation': return 'text-green-600';
      case 'submission_review': return 'text-orange-600';
      case 'system_backup': return 'text-purple-600';
      case 'deadline_created': return 'text-red-600';
      default: return 'text-gray-600';
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">System administration and management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
          <p className="text-sm text-gray-600">Registered users</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Projects</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalProjects}</div>
          <p className="text-sm text-gray-600">Research projects</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingApprovals}</div>
          <p className="text-sm text-gray-600">Awaiting review</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
          <div className="text-3xl font-bold text-green-600 mb-2 capitalize">{stats.systemHealth}</div>
          <p className="text-sm text-gray-600">Overall status</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => {
                console.log('Create User button clicked!');
                setShowUserForm(true);
              }}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Create User</h4>
              <p className="text-sm text-gray-600">Add new students, supervisors, or admins</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/supervisor-allocation')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Supervisor Allocation</h4>
              <p className="text-sm text-gray-600">Assign supervisors to students</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/documents')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Document Management</h4>
              <p className="text-sm text-gray-600">Review all document submissions</p>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h4 className="font-semibold text-gray-900 mb-1">System Reports</h4>
              <p className="text-sm text-gray-600">Generate administrative reports</p>
            </button>
            
            <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
              <h4 className="font-semibold text-gray-900 mb-1">Guidelines</h4>
              <p className="text-sm text-gray-600">Update research guidelines</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/system-settings')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">System Settings</h4>
              <p className="text-sm text-gray-600">Configure system parameters</p>
            </button>
          </div>
        </div>
      </div>

      {/* Debug indicator */}
      {showUserForm && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-2 rounded z-50">
          Modal should be visible!
        </div>
      )}

      {/* Test button for debugging */}
      <div className="mb-4 space-x-2">
        <button 
          onClick={() => {
            console.log('Test button clicked, current state:', showUserForm);
            setShowUserForm(!showUserForm);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Toggle User Form (Current: {showUserForm ? 'OPEN' : 'CLOSED'})
        </button>
        
        <div className="inline-block px-4 py-2 bg-purple-500 text-white rounded">
          Roles Loaded: {roles.length} ({roles.map(r => r.name).join(', ')})
        </div>
      </div>

      {/* User Creation Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New User</h3>
              <button
                onClick={() => setShowUserForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12M6 6v12M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border-green-200 text-green-600 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role_id"
                  id="role_id"
                  value={formData.role_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  required
                >
                  <option value="">Select a role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role-specific fields */}
              {formData.role_id && roles.find(r => r.id.toString() === formData.role_id)?.name === 'student' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      name="registration_number"
                      id="registration_number"
                      value={formData.registration_number}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                      Program
                    </label>
                    <input
                      type="text"
                      name="program"
                      id="program"
                      value={formData.program}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              {formData.role_id && roles.find(r => r.id.toString() === formData.role_id)?.name === 'supervisor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      id="specialization"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      id="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="max_students" className="block text-sm font-medium text-gray-700">
                      Maximum Students
                    </label>
                    <input
                      type="number"
                      name="max_students"
                      id="max_students"
                      value={formData.max_students}
                      onChange={handleInputChange}
                      min="1"
                      max="20"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowUserForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border-b border-gray-200 last:border-b-0">
                <div className={`text-2xl ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{activity.user}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">User Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Students</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">156</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Supervisors</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">42</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Admins</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API Server</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Running</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Email Service</span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">File Storage</span>
                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">78% Used</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
