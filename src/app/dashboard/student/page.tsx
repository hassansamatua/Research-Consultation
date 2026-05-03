'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  subject: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender_first_name: string;
  sender_last_name: string;
  sender_email: string;
  receiver_first_name: string;
  receiver_last_name: string;
  receiver_email: string;
}

interface Meeting {
  id: number;
  supervisor_id: number;
  student_id: number;
  title: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
  supervisor_first_name: string;
  supervisor_last_name: string;
  supervisor_email: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  requested_by: 'supervisor' | 'student';
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  request_date: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRequestMeetingModal, setShowRequestMeetingModal] = useState(false);
  const [supervisor, setSupervisor] = useState<any>(null);
  const [meetingRequest, setMeetingRequest] = useState({
    title: '',
    description: '',
    meeting_date: '',
    meeting_time: '',
    location: ''
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchMeetings();
      fetchSupervisorInfo();
    }
  }, [user]);

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

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/student/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/student/meetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    }
  };

  const fetchSupervisorInfo = async () => {
    try {
      console.log('👨‍🏫 Fetching supervisor info for student...');
      const response = await fetch('/api/student/supervisor');
      if (response.ok) {
        const data = await response.json();
        console.log('👨‍🏫 Supervisor data:', data);
        setSupervisor(data.supervisor);
      } else {
        console.error('❌ Failed to fetch supervisor info');
      }
    } catch (error) {
      console.error('❌ Error fetching supervisor info:', error);
    }
  };

  const requestMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('📝 Requesting meeting:', meetingRequest);
      
      const response = await fetch('/api/meetings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...meetingRequest,
          supervisor_id: supervisor?.id
        }),
      });

      const result = await response.json();
      console.log('📝 Meeting request response:', result);

      if (response.ok) {
        alert('Meeting request submitted successfully! Waiting for supervisor approval.');
        setShowRequestMeetingModal(false);
        setMeetingRequest({
          title: '',
          description: '',
          meeting_date: '',
          meeting_time: '',
          location: ''
        });
        fetchMeetings(); // Refresh meetings
      } else {
        alert(result.error || 'Failed to request meeting');
      }
    } catch (error) {
      console.error('❌ Failed to request meeting:', error);
      alert('Failed to request meeting');
    }
  };

  const getUnreadMessageCount = () => {
    return messages.filter(m => !m.is_read && m.receiver_id === user?.id).length;
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings.filter(m => {
      const meetingDateTime = new Date(`${m.meeting_date}T${m.meeting_time}`);
      return meetingDateTime > now && m.status === 'scheduled';
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <img
            src="/logo.png"
            alt="Zanzibar University Logo"
            className="h-12 w-12 object-contain"
          />
        </div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unread Messages</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">{getUnreadMessageCount()}</div>
          <p className="text-sm text-gray-600">From supervisor</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upcoming Meetings</h3>
          <div className="text-3xl font-bold text-purple-600 mb-2">{getUpcomingMeetings().length}</div>
          <p className="text-sm text-gray-600">Scheduled</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitted Documents</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">8</div>
          <p className="text-sm text-gray-600">Documents uploaded</p>
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
              onClick={() => setShowRequestMeetingModal(true)}
              className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
            >
              <h4 className="font-semibold text-gray-900 mb-1">Request Meeting</h4>
              <p className="text-sm text-gray-600">Schedule meeting with supervisor</p>
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

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['overview', 'messages', 'meetings', 'submissions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {tab === 'overview' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 001-1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1H2a1 1 0 00-1 1v4a1 1 0 001 1h3m10-11l2 2" />
                    </svg>
                  )}
                  {tab === 'messages' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {tab === 'meetings' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {tab === 'submissions' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 0h6m-6 0h6m11 0V6a2 2 0 012-2h-4m-6 0h6m2 6v6m0-6h6" />
                    </svg>
                  )}
                  <span className="capitalize">{tab}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {messages.length} total messages ({getUnreadMessageCount()} unread)
                </p>
                <button
                  onClick={() => fetchMessages()}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {messages.map((message, index) => (
                <div key={`message-${message.id}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        message.is_read ? 'bg-gray-300' : 'bg-blue-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {message.sender_first_name} {message.sender_last_name}
                          </p>
                          <p className="text-sm text-gray-900 font-medium">{message.subject}</p>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {new Date(message.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {message.message_text}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm text-gray-400 mt-1">Messages from your supervisor will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'meetings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">Meetings</h3>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {meetings.length} total meetings ({getUpcomingMeetings().length} upcoming)
                </p>
                <button
                  onClick={() => fetchMeetings()}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {meetings.map((meeting, index) => (
                <div key={`meeting-${meeting.id}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${
                        meeting.status === 'scheduled'
                          ? 'bg-blue-500'
                          : meeting.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{meeting.title}</p>
                          <p className="text-sm text-gray-500">with {meeting.supervisor_first_name} {meeting.supervisor_last_name}</p>
                        </div>
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {meeting.status}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-3">
                        {new Date(`${meeting.meeting_date}T${meeting.meeting_time}`).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-700 mb-1">📍 {meeting.location}</p>
                        <p>{meeting.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {meetings.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-medium">No meetings scheduled</p>
                  <p className="text-sm text-gray-400 mt-1">Meetings with your supervisor will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Meeting Request Modal */}
      {showRequestMeetingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Request Meeting with Supervisor</h3>
              {supervisor && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Supervisor:</strong> {supervisor.first_name} {supervisor.last_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Department:</strong> {supervisor.department}
                  </p>
                </div>
              )}
              <form onSubmit={requestMeeting}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meeting Title *</label>
                    <input
                      type="text"
                      required
                      value={meetingRequest.title}
                      onChange={(e) => setMeetingRequest({...meetingRequest, title: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Progress Review Meeting"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={meetingRequest.description}
                      onChange={(e) => setMeetingRequest({...meetingRequest, description: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Describe the purpose of this meeting..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Date *</label>
                    <input
                      type="date"
                      required
                      value={meetingRequest.meeting_date}
                      onChange={(e) => setMeetingRequest({...meetingRequest, meeting_date: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Time *</label>
                    <input
                      type="time"
                      required
                      value={meetingRequest.meeting_time}
                      onChange={(e) => setMeetingRequest({...meetingRequest, meeting_time: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={meetingRequest.location}
                      onChange={(e) => setMeetingRequest({...meetingRequest, location: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Office 101, Online, Library"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRequestMeetingModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Request Meeting
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
