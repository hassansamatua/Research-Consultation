'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  sender_name: string;
  subject: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [composing, setComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    receiver_email: '',
    subject: '',
    message_text: ''
  });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchMessages();
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

  const fetchMessages = async () => {
    // Mock messages for now
    const mockMessages: Message[] = [
      {
        id: 1,
        sender_name: 'Dr. Mohamed Ali',
        subject: 'Research Proposal Review',
        message_text: 'I have reviewed your research proposal and have some feedback. Please schedule a meeting to discuss the revisions.',
        is_read: false,
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        sender_name: 'Admin User',
        subject: 'Deadline Reminder',
        message_text: 'This is a reminder that the proposal submission deadline is approaching. Please ensure you submit your work on time.',
        is_read: true,
        created_at: '2024-01-14T14:20:00Z'
      },
      {
        id: 3,
        sender_name: 'System Notification',
        subject: 'System Maintenance',
        message_text: 'The system will be undergoing maintenance this weekend. Please save your work before Friday evening.',
        is_read: true,
        created_at: '2024-01-13T09:15:00Z'
      }
    ];
    setMessages(mockMessages);
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
    // TODO: Implement send message API
    console.log('Sending message:', newMessage);
    setComposing(false);
    setNewMessage({ receiver_email: '', subject: '', message_text: '' });
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
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'bg-green-50 border-green-200 border'
                        : message.is_read
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'bg-blue-50 hover:bg-blue-100 border-blue-200 border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        message.is_read ? 'text-gray-900' : 'text-blue-900'
                      }`}>
                        {message.sender_name}
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
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label htmlFor="receiver_email" className="block text-sm font-medium text-gray-700">
                      To
                    </label>
                    <input
                      type="email"
                      name="receiver_email"
                      id="receiver_email"
                      value={newMessage.receiver_email}
                      onChange={(e) => setNewMessage({...newMessage, receiver_email: e.target.value})}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                      placeholder="recipient@example.com"
                      required
                    />
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
                      From: <span className="font-medium">{selectedMessage.sender_name}</span>
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
