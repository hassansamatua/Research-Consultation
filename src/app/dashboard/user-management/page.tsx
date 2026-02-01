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
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export default function UserManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [filter, setFilter] = useState({
    role: '',
    status: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_id: '',
    password: ''
  });
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
        
        // Only super admin can access user management
        if (data.user.role_name !== 'super_admin') {
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
        is_active: true,
        last_login: '2024-01-14T16:20:00Z',
        created_at: '2023-02-15T00:00:00Z'
      },
      {
        id: 5,
        first_name: 'Ali',
        last_name: 'Hassan',
        email: 'student1@zumis.ac.tz',
        phone: '+255 777 123460',
        role_name: 'student',
        is_active: true,
        last_login: '2024-01-15T11:30:00Z',
        created_at: '2023-09-01T00:00:00Z'
      }
    ];
    setUsers(mockUsers);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !filter.role || user.role_name === filter.role;
    const matchesStatus = !filter.status || (filter.status === 'active' && user.is_active) || (filter.status === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement user creation API
    console.log('Creating user:', formData);
    setCreating(false);
    setFormData({ first_name: '', last_name: '', email: '', phone: '', role_id: '', password: '' });
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    setEditing(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      role_id: '',
      password: ''
    });
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    
    // TODO: Implement user update API
    console.log('Updating user:', { id: editing.id, ...formData });
    setEditing(null);
    setFormData({ first_name: '', last_name: '', email: '', phone: '', role_id: '', password: '' });
    fetchUsers();
  };

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    // TODO: Implement toggle status API
    setUsers(users.map(u => 
      u.id === userId ? { ...u, is_active: !currentStatus } : u
    ));
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // TODO: Implement user deletion API
      setUsers(users.filter(u => u.id !== userId));
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Create New User
        </button>
      </div>

      {/* User Statistics */}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Students</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {users.filter(u => u.role_name === 'student').length}
          </div>
          <p className="text-sm text-gray-600">Postgraduate students</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {users.filter(u => u.role_name !== 'student').length}
          </div>
          <p className="text-sm text-gray-600">Supervisors & admins</p>
        </div>
      </div>

      {/* Create/Edit User Form */}
      {(creating || editing) && (
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {creating ? 'Create New User' : 'Edit User'}
            </h3>
            <form onSubmit={creating ? handleCreateUser : handleUpdateUser} className="space-y-4">
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
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                    disabled={!!editing}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    name="role_id"
                    id="role_id"
                    value={formData.role_id}
                    onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="1">Student</option>
                    <option value="2">Supervisor</option>
                    <option value="3">Admin</option>
                    <option value="4">Super Admin</option>
                  </select>
                </div>

                {creating && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setEditing(null);
                    setFormData({ first_name: '', last_name: '', email: '', phone: '', role_id: '', password: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  {creating ? 'Create User' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                placeholder="Name or email"
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

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userItem) => (
                  <tr key={userItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.first_name} {userItem.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(userItem.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{userItem.email}</div>
                      <div className="text-sm text-gray-500">{userItem.phone || 'Not provided'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        userItem.role_name === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                        userItem.role_name === 'admin' ? 'bg-blue-100 text-blue-800' :
                        userItem.role_name === 'supervisor' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {userItem.role_name.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(userItem.id, userItem.is_active)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          userItem.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {userItem.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.last_login ? new Date(userItem.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(userItem)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      {userItem.role_name !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      )}
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
