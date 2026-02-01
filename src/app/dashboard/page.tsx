'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
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

      {user.role_name === 'student' && <StudentDashboard />}
      {user.role_name === 'supervisor' && <SupervisorDashboard />}
      {(user.role_name === 'admin' || user.role_name === 'super_admin') && <AdminDashboard />}
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Progress</h3>
        <div className="text-3xl font-bold text-green-600 mb-2">65%</div>
        <p className="text-sm text-gray-600">3 of 5 stages completed</p>
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Submissions</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">2</div>
        <p className="text-sm text-gray-600">1 under review, 1 approved</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
        <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
        <p className="text-sm text-gray-600">2 unread messages</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-3">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Chapter 3 Submitted</p>
              <p className="text-xs text-gray-500">2 days ago</p>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
              Under Review
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="text-sm font-medium text-gray-900">Chapter 2 Approved</p>
              <p className="text-xs text-gray-500">1 week ago</p>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
              Approved
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-gray-900">New message from supervisor</p>
              <p className="text-xs text-gray-500">2 weeks ago</p>
            </div>
            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              Message
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupervisorDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Assigned Students</h3>
        <div className="text-3xl font-bold text-green-600 mb-2">8</div>
        <p className="text-sm text-gray-600">6 active, 2 completed</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
        <div className="text-3xl font-bold text-orange-600 mb-2">4</div>
        <p className="text-sm text-gray-600">3 submissions awaiting review</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages</h3>
        <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
        <p className="text-sm text-gray-600">5 unread messages</p>
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
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Ali Hassan
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Machine Learning Applications
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">75%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    On Track
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Fatma Omar
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Climate Change Impact Study
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">40%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Review Needed
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">156</div>
        <p className="text-sm text-gray-600">+12% from last semester</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Supervisors</h3>
        <div className="text-3xl font-bold text-green-600 mb-2">42</div>
        <p className="text-sm text-gray-600">3.7 students per supervisor</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Submissions</h3>
        <div className="text-3xl font-bold text-orange-600 mb-2">28</div>
        <p className="text-sm text-gray-600">Awaiting review</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed This Year</h3>
        <div className="text-3xl font-bold text-purple-600 mb-2">23</div>
        <p className="text-sm text-gray-600">15 Masters, 8 PhDs</p>
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
