'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuditLog {
  id: number;
  user_name: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: number;
  details?: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function AuditLogsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState({
    action: '',
    resource_type: '',
    date_range: '',
    user_email: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchLogs();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Only super admin can access audit logs
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

  const fetchLogs = async () => {
    // Mock audit logs data
    const mockLogs: AuditLog[] = [
      {
        id: 1,
        user_name: 'Super Admin',
        user_email: 'superadmin@zu.ac.tz',
        action: 'LOGIN',
        resource_type: 'user',
        resource_id: 1,
        details: 'Super admin logged in successfully',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        user_name: 'Admin User',
        user_email: 'admin@zu.ac.tz',
        action: 'CREATE',
        resource_type: 'guideline',
        resource_id: 5,
        details: 'Created new guideline: "Research Ethics Guidelines"',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-15T09:15:00Z'
      },
      {
        id: 3,
        user_name: 'Dr. Mohamed Ali',
        user_email: 'dr.mohamed@zu.ac.tz',
        action: 'REVIEW',
        resource_type: 'submission',
        resource_id: 12,
        details: 'Reviewed student proposal submission',
        ip_address: '192.168.1.102',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        created_at: '2024-01-15T08:45:00Z'
      },
      {
        id: 4,
        user_name: 'Ali Hassan',
        user_email: 'student1@zumis.ac.tz',
        action: 'SUBMIT',
        resource_type: 'submission',
        resource_id: 12,
        details: 'Submitted Chapter 1 for review',
        ip_address: '192.168.1.103',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-14T16:20:00Z'
      },
      {
        id: 5,
        user_name: 'Admin User',
        user_email: 'admin@zu.ac.tz',
        action: 'ALLOCATE',
        resource_type: 'supervisor_allocation',
        resource_id: 8,
        details: 'Allocated supervisor Dr. Fatma Hassan to student Amina Mohamed',
        ip_address: '192.168.1.101',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-14T14:30:00Z'
      },
      {
        id: 6,
        user_name: 'Super Admin',
        user_email: 'superadmin@zu.ac.tz',
        action: 'DELETE',
        resource_type: 'user',
        resource_id: 15,
        details: 'Deleted inactive user account',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: '2024-01-14T11:15:00Z'
      },
      {
        id: 7,
        user_name: 'System',
        user_email: 'system@zu.ac.tz',
        action: 'BACKUP',
        resource_type: 'system',
        resource_id: 0,
        details: 'Automatic database backup completed successfully',
        ip_address: '127.0.0.1',
        user_agent: 'System Scheduler',
        created_at: '2024-01-14T02:00:00Z'
      },
      {
        id: 8,
        user_name: 'Dr. Fatma Hassan',
        user_email: 'dr.fatma@zu.ac.tz',
        action: 'LOGIN',
        resource_type: 'user',
        resource_id: 4,
        details: 'Supervisor logged in successfully',
        ip_address: '192.168.1.104',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        created_at: '2024-01-13T15:45:00Z'
      }
    ];
    setLogs(mockLogs);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = !filter.action || log.action === filter.action;
    const matchesResource = !filter.resource_type || log.resource_type === filter.resource_type;
    const matchesUser = !filter.user_email || log.user_email === filter.user_email;
    
    return matchesSearch && matchesAction && matchesResource && matchesUser;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'bg-green-100 text-green-800';
      case 'CREATE': return 'bg-blue-100 text-blue-800';
      case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      case 'SUBMIT': return 'bg-purple-100 text-purple-800';
      case 'REVIEW': return 'bg-orange-100 text-orange-800';
      case 'ALLOCATE': return 'bg-indigo-100 text-indigo-800';
      case 'BACKUP': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportLogs = () => {
    // TODO: Implement export functionality
    const csvContent = logs.map(log => 
      `${log.created_at},${log.user_name},${log.user_email},${log.action},${log.resource_type},${log.details || ''},${log.ip_address}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      // TODO: Implement clear logs API
      setLogs([]);
      alert('Audit logs cleared successfully!');
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
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-2 text-gray-600">System activity logs and security audit trail</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportLogs}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Export Logs
          </button>
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Activities</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{logs.length}</div>
          <p className="text-sm text-gray-600">All logged activities</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Today</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {logs.filter(l => {
              const logDate = new Date(l.created_at);
              const today = new Date();
              return logDate.toDateString() === today.toDateString();
            }).length}
          </div>
          <p className="text-sm text-gray-600">Activities today</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Logins</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {logs.filter(l => l.action === 'LOGIN').length}
          </div>
          <p className="text-sm text-gray-600">User logins</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Events</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {logs.filter(l => ['DELETE', 'CREATE', 'ALLOCATE'].includes(l.action)).length}
          </div>
          <p className="text-sm text-gray-600">Critical actions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                placeholder="User, action, or details"
              />
            </div>

            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                Action
              </label>
              <select
                name="action"
                id="action"
                value={filter.action}
                onChange={(e) => setFilter({...filter, action: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="SUBMIT">Submit</option>
                <option value="REVIEW">Review</option>
                <option value="ALLOCATE">Allocate</option>
              </select>
            </div>

            <div>
              <label htmlFor="resource_type" className="block text-sm font-medium text-gray-700">
                Resource Type
              </label>
              <select
                name="resource_type"
                id="resource_type"
                value={filter.resource_type}
                onChange={(e) => setFilter({...filter, resource_type: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Resources</option>
                <option value="user">User</option>
                <option value="submission">Submission</option>
                <option value="guideline">Guideline</option>
                <option value="supervisor_allocation">Supervisor Allocation</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label htmlFor="user_email" className="block text-sm font-medium text-gray-700">
                User
              </label>
              <select
                name="user_email"
                id="user_email"
                value={filter.user_email}
                onChange={(e) => setFilter({...filter, user_email: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Users</option>
                {Array.from(new Set(logs.map(l => l.user_email))).map(email => (
                  <option key={email} value={email}>{email}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date_range" className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                name="date_range"
                id="date_range"
                value={filter.date_range}
                onChange={(e) => setFilter({...filter, date_range: e.target.value})}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Audit Logs ({filteredLogs.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.user_name}</div>
                      <div className="text-xs text-gray-500">{log.user_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.resource_type}</div>
                      {log.resource_id > 0 && (
                        <div className="text-xs text-gray-500">ID: {log.resource_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.details || 'No details available'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.ip_address}</div>
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {log.user_agent}
                      </div>
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
