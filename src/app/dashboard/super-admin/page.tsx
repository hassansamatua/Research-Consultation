'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalSupervisors: 0,
    totalAdmins: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingSubmissions: 0,
    systemHealth: 'good'
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user is super admin
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

  const fetchStats = async () => {
    // Mock stats for now - in real app, this would come from API
    setStats({
      totalUsers: 201,
      totalStudents: 156,
      totalSupervisors: 42,
      totalAdmins: 3,
      activeProjects: 142,
      completedProjects: 23,
      pendingSubmissions: 28,
      systemHealth: 'good'
    });
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
        <h1 className="text-3xl font-bold text-gray-900">
          Super Admin Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Full system control and administration
        </p>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalUsers}</div>
          <div className="text-sm text-gray-600">
            <div>Students: {stats.totalStudents}</div>
            <div>Supervisors: {stats.totalSupervisors}</div>
            <div>Admins: {stats.totalAdmins}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Projects</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeProjects}</div>
          <div className="text-sm text-gray-600">
            <div>Active: {stats.activeProjects}</div>
            <div>Completed: {stats.completedProjects}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingSubmissions}</div>
          <div className="text-sm text-gray-600">Awaiting supervisor review</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Health</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">Good</div>
          <div className="text-sm text-gray-600">All systems operational</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold text-gray-900 mb-1">User Management</h3>
            <p className="text-sm text-gray-600">Create and manage user accounts</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold text-gray-900 mb-1">System Settings</h3>
            <p className="text-sm text-gray-600">Configure system parameters</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold text-gray-900 mb-1">Audit Logs</h3>
            <p className="text-sm text-gray-600">View system activity logs</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold text-gray-900 mb-1">Database Backup</h3>
            <p className="text-sm text-gray-600">Create system backups</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold text-gray-900 mb-1">System Reports</h3>
            <p className="text-sm text-gray-600">Generate administrative reports</p>
          </button>
          
          <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-semibold text-gray-900 mb-1">Security Settings</h3>
            <p className="text-sm text-gray-600">Manage security configurations</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent System Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">New user registration</p>
              <p className="text-xs text-gray-500">Student account created for John Doe</p>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">System backup completed</p>
              <p className="text-xs text-gray-500">Automatic daily backup successful</p>
            </div>
            <span className="text-xs text-gray-500">6 hours ago</span>
          </div>
          
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Supervisor allocation updated</p>
              <p className="text-xs text-gray-500">Dr. Smith assigned 3 new students</p>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">System maintenance</p>
              <p className="text-xs text-gray-500">Database optimization completed</p>
            </div>
            <span className="text-xs text-gray-500">2 days ago</span>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">System Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">Development</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span className="font-medium">MySQL 8.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Backup:</span>
                <span className="font-medium">6 hours ago</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Performance Metrics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Server Uptime:</span>
                <span className="font-medium">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-medium">120ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Sessions:</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Storage Used:</span>
                <span className="font-medium">2.3 GB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
