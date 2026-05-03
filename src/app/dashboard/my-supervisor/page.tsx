'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Supervisor {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  academic_rank: string;
  staff_id: string;
}

interface Allocation {
  id: number;
  supervisor_id: number;
  student_id: number;
  allocated_at: string;
  status: string;
  notes?: string;
  // Supervisor fields are included directly from the API
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  academic_rank: string;
  staff_id: string;
  supervisor_user_id: number; // Added for message sending
}

export default function MySupervisorPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMySupervisor();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        
        // Check if user is a student
        if (data.user.role_name !== 'student') {
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

  const fetchMySupervisor = async () => {
    try {
      // Get the student's supervisor allocation
      const response = await fetch('/api/student/my-supervisor');
      if (response.ok) {
        const data = await response.json();
        setAllocation(data.allocation);
      }
    } catch (error) {
      console.error('Failed to fetch supervisor:', error);
    }
  };

  const handleSendMessage = async () => {
    console.log('🔍 Debug: handleSendMessage called');
    console.log('🔍 Debug: allocation:', allocation);
    
    if (!allocation) {
      alert('No supervisor assigned. Cannot send message.');
      return;
    }
    
    console.log('🔍 Debug: supervisor_user_id:', allocation.supervisor_user_id);
    console.log('🔍 Debug: supervisor_id:', allocation.supervisor_id);
    
    if (!message.trim() || !subject.trim()) {
      alert('Please fill in both subject and message fields.');
      return;
    }

    setActionLoading(true);
    try {
      const receiverId = allocation.supervisor_user_id || allocation.supervisor_id;
      console.log('🔍 Debug: Using receiver_id:', receiverId);
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          subject: subject,
          message_text: message,
        }),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setShowMessageModal(false);
        setMessage('');
        setSubject('');
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
    console.log('🔍 Debug: handleScheduleMeeting called');
    console.log('🔍 Debug: allocation:', allocation);
    
    if (!allocation) {
      alert('No supervisor assigned. Cannot schedule meeting.');
      return;
    }
    
    console.log('🔍 Debug: supervisor_user_id:', allocation.supervisor_user_id);
    console.log('🔍 Debug: supervisor_id:', allocation.supervisor_id);
    
    if (!meetingDate || !meetingTime || !meetingNotes.trim()) {
      alert('Please fill in all meeting details.');
      return;
    }

    setActionLoading(true);
    try {
      const meetingDateTime = new Date(`${meetingDate}T${meetingTime}`);
      const receiverId = allocation.supervisor_user_id || allocation.supervisor_id;
      
      console.log('🔍 Debug: Using receiver_id:', receiverId);
      console.log('🔍 Debug: Meeting date/time:', meetingDateTime.toLocaleString());
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          subject: `Meeting Request - ${meetingDateTime.toLocaleDateString()}`,
          message_text: `Meeting requested for ${meetingDateTime.toLocaleString()}\n\nDetails:\n${meetingNotes}`,
        }),
      });

      if (response.ok) {
        alert('Meeting request sent successfully!');
        setShowMeetingModal(false);
        setMeetingDate('');
        setMeetingTime('');
        setMeetingNotes('');
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
        <h1 className="text-3xl font-bold text-gray-900">My Supervisor</h1>
        <p className="mt-2 text-gray-600">View your assigned supervisor and contact information</p>
      </div>

      {!allocation ? (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-gray-400">🤷</span>
            </div>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">No Supervisor Assigned</h3>
            <p className="text-sm text-gray-600 mb-4">
              You haven't been assigned a supervisor yet. Please contact the administration office for supervisor allocation.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Contact Administration</h4>
              <p className="text-sm text-blue-700">
                Email: admin@zu.ac.tz<br />
                Phone: +255 777 123456<br />
                Office: Administration Building, Room 101
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Supervisor Information</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                allocation.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {allocation.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Personal Information</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {allocation.first_name} {allocation.last_name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`mailto:${allocation.email}`} className="text-blue-600 hover:text-blue-500">
                        {allocation.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={`tel:${allocation.phone}`} className="text-blue-600 hover:text-blue-500">
                        {allocation.phone}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Academic Information</h4>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                    <dd className="mt-1 text-sm text-gray-900">{allocation.department}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                    <dd className="mt-1 text-sm text-gray-900">{allocation.specialization}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Academic Rank</dt>
                    <dd className="mt-1 text-sm text-gray-900">{allocation.academic_rank}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Allocation Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(allocation.allocated_at).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {allocation.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-medium text-gray-900 mb-2">Allocation Notes</h4>
                <p className="text-sm text-gray-600">{allocation.notes}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-medium text-gray-900 mb-4">Quick Actions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowMessageModal(true)}
                  disabled={!allocation}
                  className="flex items-center justify-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">✉️</span>
                  Send Message
                </button>
                <button 
                  onClick={() => setShowMeetingModal(true)}
                  disabled={!allocation}
                  className="flex items-center justify-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">📅</span>
                  Schedule Meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Send Message to Supervisor</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter message subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Type your message here..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Send Message'}
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
                  <label className="block text-sm font-medium text-gray-700">Meeting Details</label>
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="What would you like to discuss?"
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
                  {actionLoading ? 'Scheduling...' : 'Schedule Meeting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
