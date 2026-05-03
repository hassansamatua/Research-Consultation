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
  sender_role: string;
  receiver_first_name: string;
  receiver_last_name: string;
  receiver_email: string;
  receiver_role: string;
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

export default function NotificationsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchMeetings();
    }
  }, [user]);

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

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
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
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    }
  };

  const getUnreadMessages = () => {
    return messages.filter(m => !m.is_read && m.receiver_id === user?.id);
  };

  const getPendingMeetingRequests = () => {
    if (user?.role_name === 'supervisor') {
      return meetings.filter(m => 
        m.requested_by === 'student' && 
        m.approval_status === 'pending'
      );
    }
    return [];
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings.filter(m => {
      const meetingDateTime = new Date(`${m.meeting_date}T${m.meeting_time}`);
      return meetingDateTime > now && m.status === 'scheduled' && m.approval_status === 'approved';
    });
  };

  const getAllNotifications = () => {
    const notifications: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      timestamp: string;
      priority: 'high' | 'medium' | 'low';
      action: () => void;
    }> = [];
    
    // Add unread messages
    getUnreadMessages().forEach(message => {
      notifications.push({
        id: `message-${message.id}`,
        type: 'message',
        title: `New message from ${message.sender_first_name} ${message.sender_last_name}`,
        description: message.subject,
        timestamp: message.created_at,
        priority: 'high',
        action: () => router.push('/dashboard/messages')
      });
    });

    // Add pending meeting requests (for supervisors)
    if (user?.role_name === 'supervisor') {
      getPendingMeetingRequests().forEach(meeting => {
        notifications.push({
          id: `meeting-request-${meeting.id}`,
          type: 'meeting-request',
          title: `Meeting request from ${meeting.student_first_name} ${meeting.student_last_name}`,
          description: `${meeting.title} - ${new Date(meeting.meeting_date).toLocaleDateString()} at ${meeting.meeting_time}`,
          timestamp: meeting.request_date,
          priority: 'medium',
          action: () => router.push('/dashboard/supervisor')
        });
      });
    }

    // Add upcoming meetings
    getUpcomingMeetings().forEach(meeting => {
      notifications.push({
        id: `upcoming-meeting-${meeting.id}`,
        type: 'upcoming-meeting',
        title: `Upcoming meeting: ${meeting.title}`,
        description: `${new Date(meeting.meeting_date).toLocaleDateString()} at ${meeting.meeting_time} - ${meeting.location || 'TBD'}`,
        timestamp: meeting.created_at,
        priority: 'low',
        action: () => router.push('/dashboard/supervisor')
      });
    });

    // Sort by timestamp (newest first)
    return notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      const response = await fetch('/api/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId })
      });

      if (response.ok) {
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const allNotifications = getAllNotifications();
  const unreadMessages = getUnreadMessages();
  const pendingRequests = getPendingMeetingRequests();
  const upcomingMeetings = getUpcomingMeetings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="mt-2 text-gray-600">Stay updated with your messages and meeting requests</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">System Notifications</h3>
              <p className="text-3xl font-bold text-purple-600">{allNotifications.length}</p>
            </div>
          </div>
        </div>

        {user.role_name === 'supervisor' && (
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
                <p className="text-3xl font-bold text-orange-600">{pendingRequests.length}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h3>
              <p className="text-3xl font-bold text-blue-600">{upcomingMeetings.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">All Notifications</h3>
          
          {allNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-gray-500">No notifications at this time</p>
              <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.priority === 'high' ? 'border-red-200 bg-red-50' :
                    notification.priority === 'medium' ? 'border-orange-200 bg-orange-50' :
                    'border-blue-200 bg-blue-50'
                  } hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={notification.action}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          notification.priority === 'high' ? 'bg-red-500' :
                          notification.priority === 'medium' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}></div>
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4">
                      <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                        View →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
