'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication for student dashboard...');
      const response = await fetch('/api/auth/me');
      console.log('Auth response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth response data:', data);
        setUser(data.user);
        
        // Check if user is a student
        if (data.user.role_name !== 'student') {
          console.log('User is not a student, redirecting to main dashboard');
          router.push('/dashboard');
        } else {
          console.log('User is a student, staying on student dashboard');
        }
      } else {
        console.log('Auth response not ok, redirecting to login');
        const errorData = await response.json();
        console.log('Auth error:', errorData);
        router.push('/login');
      }
    } catch (error) {
      console.error('Auth check error:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's your research progress overview.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Research Progress</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">65%</div>
          <p className="text-sm text-gray-600">Overall completion</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitted Documents</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">8</div>
          <p className="text-sm text-gray-600">Documents uploaded</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Reviews</h3>
          <div className="text-3xl font-bold text-orange-600 mb-2">2</div>
          <p className="text-sm text-gray-600">Awaiting feedback</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Deadline</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">5d</div>
          <p className="text-sm text-gray-600">Chapter 3 submission</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/dashboard/submissions')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Submit Document</h4>
              <p className="text-sm text-gray-600">Upload research documents</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/progress')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">View Progress</h4>
              <p className="text-sm text-gray-600">Track research milestones</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/messages')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Messages</h4>
              <p className="text-sm text-gray-600">Communicate with supervisor</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/guidelines')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Guidelines</h4>
              <p className="text-sm text-gray-600">Research guidelines and rules</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/deadlines')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Deadlines</h4>
              <p className="text-sm text-gray-600">Important dates and milestones</p>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard/profile')}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Profile</h4>
              <p className="text-sm text-gray-600">Update personal information</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 border-b border-gray-200 last:border-b-0">
              <div className="text-2xl text-green-600">📄</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">Chapter 2 submitted for review</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">2 hours ago</p>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Pending Review</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 border-b border-gray-200 last:border-b-0">
              <div className="text-2xl text-blue-600">💬</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">New message from supervisor</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">1 day ago</p>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Unread</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 border-b border-gray-200 last:border-b-0">
              <div className="text-2xl text-green-600">✅</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">Chapter 1 approved by supervisor</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">3 days ago</p>
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Completed</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 border-b border-gray-200 last:border-b-0">
              <div className="text-2xl text-purple-600">📅</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">Deadline reminder: Chapter 3 due in 5 days</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">1 week ago</p>
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Reminder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
