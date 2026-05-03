'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      let response;
      
      if (user.role_name === 'student') {
        response = await fetch('/api/student/dashboard-stats');
      } else if (user.role_name === 'supervisor') {
        response = await fetch('/api/supervisor/dashboard-stats');
      } else if (user.role_name === 'admin' || user.role_name === 'super_admin') {
        response = await fetch('/api/admin/dashboard-stats');
      }

      if (response && response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.first_name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Here's an overview of your research activities and progress.
        </p>
      </div>

      {user.role_name === 'student' && <StudentDashboard data={dashboardData} />}
      {user.role_name === 'supervisor' && <SupervisorDashboard data={dashboardData} />}
      {(user.role_name === 'admin' || user.role_name === 'super_admin') && <AdminDashboard data={dashboardData} />}
    </div>
  );
}

function StudentDashboard({ data }: { data: any }) {
  const student = data?.student || {};
  const stats = data?.statistics || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Progress</h3>
        <div className="text-3xl font-bold text-green-600 mb-2">{student.progress_percentage || 0}%</div>
        <p className="text-sm text-gray-600">{student.completed_stages || 0} of {student.total_stages || 0} stages completed</p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${student.progress_percentage || 0}%` }}></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Submissions</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">{stats.current_submissions || 0}</div>
        <p className="text-sm text-gray-600">{stats.under_review || 0} under review, {stats.approved || 0} approved</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
        <div className="text-3xl font-bold text-purple-600 mb-2">{stats.total_messages || 0}</div>
        <p className="text-sm text-gray-600">{stats.unread_messages || 0} unread messages</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {data?.recent_messages && data.recent_messages.length > 0 ? (
            data.recent_messages.map((message: any, index: number) => (
              <div key={message.id || index} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="text-sm font-medium text-gray-900">{message.subject}</p>
                  <p className="text-xs text-gray-500">
                    From: {message.sender_first_name} {message.sender_last_name} • 
                    {new Date(message.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  message.is_read 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {message.is_read ? 'Read' : 'New'}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-sm text-gray-500">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SupervisorDashboard({ data }: { data: any }) {
  const stats = data?.statistics || {};
  const students = data?.students || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned Students</h3>
        <div className="text-3xl font-bold text-green-600 mb-2">{stats.assigned_students || 0}</div>
        <p className="text-sm text-gray-600">{stats.active_students || 0} active, {stats.completed_students || 0} completed</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
        <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pending_reviews || 0}</div>
        <p className="text-sm text-gray-600">{stats.pending_reviews || 0} submissions awaiting review</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
        <div className="text-3xl font-bold text-purple-600 mb-2">{stats.total_messages || 0}</div>
        <p className="text-sm text-gray-600">{stats.unread_messages || 0} unread messages</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Progress Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Research Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.length > 0 ? (
                students.map((student: any, index: number) => (
                  <tr key={student.student_id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.student_first_name} {student.student_last_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.research_title || 'No title assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              student.progress_percentage >= 75 ? 'bg-green-600' : 
                              student.progress_percentage >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                            }`} 
                            style={{ width: `${student.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{student.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        student.status === 'On Track' ? 'bg-blue-100 text-blue-800' :
                        student.status === 'Review Needed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                    No students assigned yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data }: { data: any }) {
  const stats = data?.statistics || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total_students || 0}</div>
        <p className="text-sm text-gray-600">{stats.percentage_change >= 0 ? '+' : ''}{stats.percentage_change || 0}% from last semester</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Supervisors</h3>
        <div className="text-3xl font-bold text-green-600 mb-2">{stats.active_supervisors || 0}</div>
        <p className="text-sm text-gray-600">{stats.avg_students_per_supervisor || 0} students per supervisor</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Submissions</h3>
        <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pending_submissions || 0}</div>
        <p className="text-sm text-gray-600">Awaiting review</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed This Year</h3>
        <div className="text-3xl font-bold text-purple-600 mb-2">{stats.completed_this_year || 0}</div>
        <p className="text-sm text-gray-600">{stats.masters_completed || 0} Masters, {stats.phd_completed || 0} PhDs</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Computer Science</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Students:</span>
                <span className="font-medium">45</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Supervisors:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-medium text-green-600">87%</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Business Studies</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Students:</span>
                <span className="font-medium">38</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Supervisors:</span>
                <span className="font-medium">10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-medium text-green-600">82%</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Education</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Students:</span>
                <span className="font-medium">52</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Supervisors:</span>
                <span className="font-medium">15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-medium text-green-600">91%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
