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

interface Recipient {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_name: string;
  registration_number?: string;
  program?: string;
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composing, setComposing] = useState(false);
  const [recipients, setRecipients] = useState<{
    admins: Recipient[];
    students: Recipient[];
  }>({ admins: [], students: [] });
  const [selectedRecipients, setSelectedRecipients] = useState<number[]>([]);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message_text: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMessages();
      if (user.role_name === 'supervisor') {
        fetchRecipients();
      }
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
        console.log('✅ Loaded real messages data:', data.messages?.length || 0, 'messages');
      } else {
        console.log('⚠️ Failed to fetch messages, using empty data');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const fetchRecipients = async () => {
    try {
      console.log('👥 Fetching eligible recipients for supervisor...');
      const response = await fetch('/api/messages/recipients');
      if (response.ok) {
        const data = await response.json();
        console.log('👥 Recipients data:', data);
        setRecipients(data.recipients || { admins: [], students: [] });
      } else {
        console.error('❌ Failed to fetch recipients');
        setRecipients({ admins: [], students: [] });
      }
    } catch (error) {
      console.error('❌ Error fetching recipients:', error);
      setRecipients({ admins: [], students: [] });
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read
    setMessages(messages.map(m => 
      m.id === message.id ? { ...m, is_read: true } : m
    ));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedRecipients.length === 0 || !newMessage.subject || !newMessage.message_text) {
      setError('Please select at least one recipient and fill in all fields');
      return;
    }

    setComposing(true);
    setError('');

    try {
      console.log('📤 Sending message to recipients:', selectedRecipients);
      
      // Send message to each selected recipient
      const sendPromises = selectedRecipients.map(async (recipientId) => {
        const messageToSend = {
          receiver_id: recipientId,
          subject: newMessage.subject.trim(),
          message_text: newMessage.message_text.trim()
        };

        const response = await fetch('/api/messages/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(messageToSend),
        });

        return response;
      });

      const results = await Promise.allSettled(sendPromises);
      
      // Check if all messages were sent successfully
      const successfulSends = results.filter(result => result.status === 'fulfilled' && (result as any).value.ok).length;
      const totalRecipients = selectedRecipients.length;

      if (successfulSends === totalRecipients) {
        setNewMessage({ subject: '', message_text: '' });
        setSelectedRecipients([]);
        setComposing(false);
        setSuccess(`Message sent successfully to ${totalRecipients} recipient(s)!`);
        
        // Refresh messages to show the new message
        fetchMessages();
      } else {
        setError(`Message sent to ${successfulSends} out of ${totalRecipients} recipients. Some may have failed.`);
      }
    } catch (error) {
      console.error('Send message error:', error);
      setError('An error occurred while sending your message');
    } finally {
      setComposing(false);
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
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-2 text-gray-600">Communicate with supervisors and administrators</p>
        </div>
        <button
          onClick={() => setComposing(true)}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Compose Message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Inbox
              </h3>
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                    } ${!message.is_read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className={`font-medium ${
                        message.is_read ? 'text-gray-900' : 'text-blue-700 font-semibold'
                      }`}>
                        {message.sender_first_name} {message.sender_last_name}
                      </p>
                      {!message.is_read && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      message.is_read ? 'text-gray-600' : 'text-blue-700'
                    }`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="lg:col-span-2">
          {composing ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Compose New Message
                </h3>
                
                {/* Error and Success Messages */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">
                      To (Select multiple recipients)
                    </label>
                    <div className="mt-1 space-y-2">
                      {/* Admins Section */}
                      {recipients.admins.length > 0 && (
                        <div className="border border-gray-200 rounded-md p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Administrators</h4>
                          <div className="space-y-2">
                            {recipients.admins.map((admin) => (
                              <label key={admin.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  value={admin.id}
                                  checked={selectedRecipients.includes(admin.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRecipients([...selectedRecipients, admin.id]);
                                    } else {
                                      setSelectedRecipients(selectedRecipients.filter(id => id !== admin.id));
                                    }
                                  }}
                                  className="mr-2 border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {admin.first_name} {admin.last_name} ({admin.email})
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Students Section */}
                      {recipients.students.length > 0 && (
                        <div className="border border-gray-200 rounded-md p-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Students</h4>
                          <div className="space-y-2">
                            {recipients.students.map((student) => (
                              <label key={student.id} className="flex items-center">
                                <input
                                  type="checkbox"
                                  value={student.id}
                                  checked={selectedRecipients.includes(student.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRecipients([...selectedRecipients, student.id]);
                                    } else {
                                      setSelectedRecipients(selectedRecipients.filter(id => id !== student.id));
                                    }
                                  }}
                                  className="mr-2 border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">
                                  {student.first_name} {student.last_name} ({student.registration_number})
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {recipients.admins.length === 0 && recipients.students.length === 0 && (
                        <p className="text-sm text-gray-500">No eligible recipients found</p>
                      )}
                    </div>
                    {selectedRecipients.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        {selectedRecipients.length} recipient(s) selected
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Message subject"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message_text" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      name="message_text"
                      id="message_text"
                      rows={6}
                      value={newMessage.message_text}
                      onChange={(e) => setNewMessage({...newMessage, message_text: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="Type your message here..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setComposing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedMessage ? (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedMessage.subject}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      From: <span className="font-medium">{selectedMessage.sender_first_name} {selectedMessage.sender_last_name}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMessage.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedMessage.message_text}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t">
                  <button className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <div className="text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No message selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a message from the inbox to read
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
