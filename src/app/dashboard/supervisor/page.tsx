'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentList from '@/components/StudentList';
import { EnhancedCard, StatsCard } from '@/components/ui/EnhancedCard';
import { EnhancedButton } from '@/components/ui/EnhancedButton';
import { Users, MessageSquare, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface Supervisor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  max_students: number;
  current_students: number;
  is_active: boolean;
}

interface Allocation {
  id: number;
  supervisor_id: number;
  student_id: number;
  allocation_date: string;
  status: string;
  notes?: string;
  student_first_name: string;
  student_last_name: string;
  student_email: string;
  student_phone: string;
  registration_number: string;
  program: string;
  enrollment_date: string;
  expected_completion_date: string;
  student_user_id: number;
}

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
  student_id: number;
  supervisor_id: number;
  title: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  student_name: string;
  student_email: string;
  requested_by: 'supervisor' | 'student';
  approval_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  request_date: string;
}

export default function SupervisorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [supervisor, setSupervisor] = useState<Supervisor | null>(null);
  const [students, setStudents] = useState<Allocation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [replyRecipientId, setReplyRecipientId] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchSupervisorInfo();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchMessages();
      fetchMeetings();
    }
  }, [user]);

  // Debug students state changes
  useEffect(() => {
    console.log('👨‍🎓 Students state updated:', students.length, 'students');
    console.log('👨‍🎓 Students data:', students);
  }, [students]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        if (data.user.role_name !== 'supervisor') {
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

  const fetchSupervisorInfo = async () => {
    try {
      console.log('🔍 Fetching supervisor info...');
      const authResponse = await fetch('/api/auth/me');
      if (authResponse.ok) {
        const userData = await authResponse.json();
        const currentUser = userData.user;
        console.log('👤 Current user:', currentUser);
        
        const response = await fetch('/api/supervisor/profile');
        console.log('📞 Supervisor profile response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('👨‍🏫 Supervisor data:', data);
          setSupervisor(data.supervisor);
        } else {
          const errorData = await response.json();
          console.error('❌ Supervisor profile error:', errorData);
        }
      }
    } catch (error) {
      console.error('❌ Failed to fetch supervisor info:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      console.log('👨‍🎓 Fetching students...');
      setStudentsLoading(true);
      const response = await fetch('/api/supervisor/allocations?limit=100'); // Get all students for modals
      console.log('👨‍🎓 Students response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('👨‍🎓 Students data:', data);
        console.log('👨‍🎓 Students count:', data.allocations?.length || 0);
        setStudents(data.allocations || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Students error:', errorData);
        setStudents([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };
  
  const fetchMessages = async () => {
    try {
      console.log('📧 Fetching messages...');
      const response = await fetch('/api/messages');
      console.log('📧 Messages response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('📧 Messages data:', data);
        setMessages(data.messages || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Messages error:', errorData);
      }
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error);
    }
  };

  const fetchMeetings = async () => {
    try {
      console.log('🗓️ Fetching meetings...');
      const response = await fetch('/api/meetings');
      console.log('🗓️ Meetings response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🗓️ Meetings data:', data);
        setMeetings(data.meetings || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Meetings error:', errorData);
      }
    } catch (error) {
      console.error('❌ Failed to fetch meetings:', error);
    }
  };

  const handleSendMessage = async () => {
    // Determine recipient based on whether it's a reply or new message
    let recipientId: number;
    
    if (replyRecipientId) {
      // Reply mode: use the pre-set recipient
      recipientId = replyRecipientId;
    } else {
      // New message mode: use selected student
      if (!selectedStudent) {
        alert('Please select a student to send a message.');
        return;
      }
      const student = students.find(a => a.student_id === selectedStudent);
      if (!student) {
        alert('Student not found.');
        return;
      }
      recipientId = student.student_user_id;
    }

    if (!messageSubject.trim() || !messageContent.trim()) {
      alert('Please fill in both subject and message.');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: recipientId,
          subject: messageSubject,
          message_text: messageContent,
        }),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setShowMessageModal(false);
        setMessageSubject('');
        setMessageContent('');
        setSelectedStudent(null);
        setReplyRecipientId(null); // Clear reply recipient
        fetchMessages();
      } else {
        const error = await response.json();
        alert('Failed to send message: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedStudent) {
      alert('Please select a student to schedule a meeting.');
      return;
    }

    if (!meetingTitle.trim() || !meetingDescription.trim() || !meetingDate || !meetingTime) {
      alert('Please fill in all meeting details.');
      return;
    }

    setActionLoading(true);
    try {
      const student = students.find(a => a.student_id === selectedStudent);
      if (!student) {
        alert('Student not found.');
        return;
      }

      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: selectedStudent,
          title: meetingTitle,
          description: meetingDescription,
          meeting_date: meetingDate,
          meeting_time: meetingTime,
          location: meetingLocation,
          status: 'scheduled'
        }),
      });

      if (response.ok) {
        alert('Meeting scheduled successfully!');
        setShowMeetingModal(false);
        setMeetingTitle('');
        setMeetingDescription('');
        setMeetingDate('');
        setMeetingTime('');
        setMeetingLocation('');
        setSelectedStudent(null);
        fetchMeetings();
      } else {
        const error = await response.json();
        alert('Failed to schedule meeting: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      alert('Failed to schedule meeting. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const updateMeetingStatus = async (meetingId: number, status: string) => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchMeetings();
      }
    } catch (error) {
      console.error('Error updating meeting status:', error);
    }
  };

  const getUnreadMessageCount = () => {
    return messages.filter(m => !m.is_read && m.receiver_id === user?.id).length;
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return meetings.filter(m => {
      const meetingDateTime = new Date(`${m.meeting_date}T${m.meeting_time}`);
      return meetingDateTime > now && m.status === 'scheduled' && m.approval_status === 'approved';
    });
  };

  const getPendingMeetingRequests = () => {
    return meetings.filter(m => 
      m.requested_by === 'student' && 
      m.approval_status === 'pending'
    );
  };

  const approveMeeting = async (meetingId: number, action: 'approve' | 'reject', rejectionReason?: string) => {
    try {
      console.log(`📋 ${action}ing meeting:`, meetingId);
      
      const response = await fetch('/api/meetings/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meeting_id: meetingId,
          action,
          rejection_reason: rejectionReason
        }),
      });

      const result = await response.json();
      console.log(`📋 Meeting ${action} response:`, result);

      if (response.ok) {
        alert(`Meeting ${action}d successfully!`);
        // Refresh meetings data
        fetchMeetings();
      } else {
        alert(result.error || `Failed to ${action} meeting`);
      }
    } catch (error) {
      console.error(`❌ Failed to ${action} meeting:`, error);
      alert(`Failed to ${action} meeting`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your students, messages, and meetings</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-green-800">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Assigned Students"
            value={studentsLoading ? "..." : students.length}
            change={12}
            changeType="increase"
            icon={Users}
            iconColor="text-blue-600"
          />
          
          <StatsCard
            title="Unread Messages"
            value={getUnreadMessageCount()}
            change={getUnreadMessageCount() > 0 ? 8 : 0}
            changeType={getUnreadMessageCount() > 0 ? "increase" : "decrease"}
            icon={MessageSquare}
            iconColor="text-green-600"
          />
          
          <StatsCard
            title="Upcoming Meetings"
            value={getUpcomingMeetings().length}
            change={3}
            changeType="increase"
            icon={Calendar}
            iconColor="text-purple-600"
          />
          
          <EnhancedCard
            title="Department Info"
            subtitle={supervisor?.specialization || 'N/A'}
            bgColor="bg-gradient-to-br from-orange-50 to-yellow-50"
            borderColor="border-orange-200"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department</span>
                <span className="text-sm font-semibold text-gray-900">{supervisor?.department || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Capacity</span>
                <span className="text-sm font-semibold text-gray-900">
                  {students.length}/{supervisor?.max_students || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full"
                  style={{ width: `${Math.min((students.length / (supervisor?.max_students || 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </EnhancedCard>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex space-x-1 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'students', label: 'Students', icon: '👥' },
                { id: 'messages', label: 'Messages', icon: '💬' },
                { id: 'meetings', label: 'Meetings', icon: '📅' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative py-4 px-6 font-medium text-sm transition-all duration-200
                    group flex items-center space-x-2
                    ${activeTab === tab.id
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="capitalize">{tab.label}</span>
                  
                  {/* Active indicator */}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                  )}
                  
                  {/* Badge for messages */}
                  {tab.id === 'messages' && getUnreadMessageCount() > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {getUnreadMessageCount() > 9 ? '9+' : getUnreadMessageCount()}
                    </span>
                  )}
                  
                  {/* Badge for meeting requests */}
                  {tab.id === 'meetings' && getPendingMeetingRequests().length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {getPendingMeetingRequests().length > 9 ? '9+' : getPendingMeetingRequests().length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Supervisor Info */}
              {supervisor && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white">Your Information</h3>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Personal Details
                        </h4>
                        <dl className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <dt className="text-sm font-medium text-gray-600">Name</dt>
                            <dd className="text-sm font-semibold text-gray-900">{supervisor.first_name} {supervisor.last_name}</dd>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <dt className="text-sm font-medium text-gray-600">Email</dt>
                            <dd className="text-sm font-semibold text-gray-900">
                              <a href={`mailto:${supervisor.email}`} className="text-blue-600 hover:text-blue-500 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {supervisor.email}
                              </a>
                            </dd>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <dt className="text-sm font-medium text-gray-600">Phone</dt>
                            <dd className="text-sm font-semibold text-gray-900">
                              <a href={`tel:${supervisor.phone}`} className="text-blue-600 hover:text-blue-500 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {supervisor.phone}
                              </a>
                            </dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Academic Details
                        </h4>
                        <dl className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <dt className="text-sm font-medium text-gray-600">Department</dt>
                            <dd className="text-sm font-semibold text-gray-900">{supervisor.department}</dd>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <dt className="text-sm font-medium text-gray-600">Specialization</dt>
                            <dd className="text-sm font-semibold text-gray-900">{supervisor.specialization}</dd>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <dt className="text-sm font-medium text-gray-600">Current Students</dt>
                            <dd className="text-sm font-semibold text-gray-900">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {supervisor.current_students}/{supervisor.max_students}
                              </span>
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Messages */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Recent Messages
                    </h3>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center"
                    >
                      View All
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {messages.slice(0, 3).map((message, index) => (
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
                              <p className="text-sm text-gray-600">{message.subject}</p>
                            </div>
                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {new Date(message.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            {message.message_text.substring(0, 100)}...
                          </div>
                          <div className="flex items-center space-x-3">
                            {!message.is_read && (
                              <button
                                onClick={() => markMessageAsRead(message.id)}
                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors"
                              >
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const recipientId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
                                setShowMessageModal(true);
                                setMessageSubject(`Re: ${message.subject}`);
                                setMessageContent(`\n\n---\nOriginal Message:\n${message.message_text}\n---\nReply: `);
                                // Auto-set the recipient for reply
                                setReplyRecipientId(recipientId);
                              }}
                              className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                            >
                              Reply
                            </button>
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
                      <p className="text-sm text-gray-400 mt-1">Messages from your students will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Meeting Requests */}
              {getPendingMeetingRequests().length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                  <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Meeting Requests
                        <span className="ml-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getPendingMeetingRequests().length}
                        </span>
                      </h3>
                      <button
                        onClick={() => setActiveTab('meeting-requests')}
                        className="text-sm text-orange-600 hover:text-orange-500 font-medium flex items-center"
                      >
                        View All
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {getPendingMeetingRequests().slice(0, 3).map((meeting, index) => (
                      <div key={`request-${meeting.id}-${index}`} className="p-6 hover:bg-orange-50 transition-colors">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {meeting.student_name}
                                </p>
                                <p className="text-sm text-gray-600">{meeting.title}</p>
                              </div>
                              <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                Pending Approval
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              <p><strong>Date:</strong> {new Date(meeting.meeting_date).toLocaleDateString()}</p>
                              <p><strong>Time:</strong> {meeting.meeting_time}</p>
                              <p><strong>Location:</strong> {meeting.location || 'TBD'}</p>
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              {meeting.description?.substring(0, 100)}...
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => approveMeeting(meeting.id, 'approve')}
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Please provide a reason for rejection:');
                                  if (reason) {
                                    approveMeeting(meeting.id, 'reject', reason);
                                  }
                                }}
                                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium hover:bg-red-200 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Meetings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upcoming Meetings
                    </h3>
                    <button
                      onClick={() => setActiveTab('meetings')}
                      className="text-sm text-blue-600 hover:text-blue-500 font-medium flex items-center"
                    >
                      View All
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {getUpcomingMeetings().slice(0, 3).map((meeting, index) => (
                    <div key={`meeting-${meeting.id}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{meeting.title}</p>
                              <p className="text-sm text-gray-600">with {meeting.student_name}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateMeetingStatus(meeting.id, 'completed')}
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => updateMeetingStatus(meeting.id, 'cancelled')}
                                className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium hover:bg-red-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(`${meeting.meeting_date}T${meeting.meeting_time}`).toLocaleDateString()}
                            </div>
                            <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(`${meeting.meeting_date}T${meeting.meeting_time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p className="font-medium text-gray-700 mb-1">📍 {meeting.location}</p>
                            <p>{meeting.description.substring(0, 100)}...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {getUpcomingMeetings().length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="font-medium">No upcoming meetings</p>
                      <p className="text-sm text-gray-400 mt-1">Schedule meetings with your students</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <StudentList
              onMessageStudent={(studentId) => {
                setSelectedStudent(studentId);
                setShowMessageModal(true);
              }}
              onScheduleMeeting={(studentId) => {
                setSelectedStudent(studentId);
                setShowMeetingModal(true);
              }}
            />
          )}

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
                  <div key={`message-full-${message.id}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
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
                        <div className="flex space-x-2 mb-3">
                          {!message.is_read && (
                            <button
                              onClick={() => markMessageAsRead(message.id)}
                              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium hover:bg-blue-200 transition-colors"
                            >
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() => {
                              const recipientId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
                              setShowMessageModal(true);
                              setMessageSubject(`Re: ${message.subject}`);
                              setMessageContent(`\n\n---\nOriginal Message:\n${message.message_text}\n---\nReply: `);
                              // Auto-set the recipient for reply
                              setReplyRecipientId(recipientId);
                            }}
                            className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                          >
                            Reply
                          </button>
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
                    <p className="text-sm text-gray-400 mt-1">Messages from your students will appear here</p>
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
                  <div key={`meeting-full-${meeting.id}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
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
                            <p className="text-sm text-gray-500">with {meeting.student_name}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => updateMeetingStatus(meeting.id, 'completed')}
                              className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => updateMeetingStatus(meeting.id, 'cancelled')}
                              className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium hover:bg-red-200 transition-colors"
                            >
                              Cancel
                            </button>
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
                    <p className="text-sm text-gray-400 mt-1">Schedule meetings with your students</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Send Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {replyRecipientId ? 'Reply to Message' : 'Send Message'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">To</label>
                    {replyRecipientId ? (
                      // Reply mode: Show fixed recipient
                      <div className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
                        {students.find(a => a.student_user_id === replyRecipientId)?.student_first_name} {students.find(a => a.student_user_id === replyRecipientId)?.student_last_name}
                      </div>
                    ) : (
                      // New message mode: Show dropdown
                      <select
                        value={selectedStudent || ''}
                        onChange={(e) => setSelectedStudent(Number(e.target.value))}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a student</option>
                        {students.map((allocation, index) => (
                          <option key={`msg-option-${allocation.student_id}-${index}`} value={allocation.student_id}>
                            {allocation.student_first_name} {allocation.student_last_name} - {allocation.registration_number}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <input
                      type="text"
                      value={messageSubject}
                      onChange={(e) => setMessageSubject(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter message subject"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Type your message here..."
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setReplyRecipientId(null); // Clear reply recipient
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Meeting Modal */}
        {showMeetingModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Schedule Meeting</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student</label>
                    <select
                      value={selectedStudent || ''}
                      onChange={(e) => setSelectedStudent(Number(e.target.value))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a student</option>
                      {students.map((allocation, index) => (
                        <option key={`meeting-option-${allocation.student_id}-${index}`} value={allocation.student_id}>
                          {allocation.student_first_name} {allocation.student_last_name} - {allocation.registration_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Meeting Title</label>
                    <input
                      type="text"
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Meeting title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={meetingDescription}
                      onChange={(e) => setMeetingDescription(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Meeting description/agenda"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Meeting location"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowMeetingModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleMeeting}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
