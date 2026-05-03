'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ResponsiveDashboardWithNotifications,
  ResponsiveContainer,
  ResponsiveCard,
  ResponsiveButton
} from '@/components/ui/ResponsiveDashboardWithNotifications';
import { 
  ArrowLeft, 
  Reply, 
  Forward, 
  Trash2, 
  MoreVertical,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useMessageNotifications } from '@/hooks/useMessageNotifications';

interface Message {
  id: number;
  sender_first_name: string;
  sender_last_name: string;
  sender_email: string;
  sender_phone?: string;
  subject: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
  sender_id: number;
  receiver_id: number;
}

interface Sender {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role_name: string;
  department?: string;
}

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [messageId, setMessageId] = useState<string>('');
  const [message, setMessage] = useState<Message | null>(null);
  const [sender, setSender] = useState<Sender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  
  const { markAsRead, refresh } = useMessageNotifications();

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setMessageId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (messageId) {
      fetchMessage();
    }
  }, [messageId]);

  const fetchMessage = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/messages/${messageId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch message');
      }
      
      const data = await response.json();
      setMessage(data.message);
      setSender(data.sender);
      
      // Mark as read if unread
      if (data.message && !data.message.is_read) {
        await markAsRead(data.message.id);
        // Update local state
        setMessage(prev => prev ? { ...prev, is_read: true } : null);
        refresh(); // Refresh notification count
      }
      
    } catch (error) {
      console.error('Fetch message error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch message');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !message) return;
    
    try {
      setSendingReply(true);
      
      const response = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_message_id: message.id,
          reply_text: replyText,
          receiver_id: message.sender_id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send reply');
      }
      
      // Clear reply form
      setReplyText('');
      setShowReply(false);
      
      // Show success message
      alert('Reply sent successfully!');
      
    } catch (error) {
      console.error('Reply error:', error);
      alert(error instanceof Error ? error.message : 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!message) return;
    
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const response = await fetch(`/api/messages/${message.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      
      // Navigate back to messages
      router.push('/dashboard/messages');
      
    } catch (error) {
      console.error('Delete error:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ResponsiveDashboardWithNotifications 
        user={{ name: 'Loading...', email: '', role: 'user' }}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        </div>
      </ResponsiveDashboardWithNotifications>
    );
  }

  if (error) {
    return (
      <ResponsiveDashboardWithNotifications 
        user={{ name: 'User', email: 'user@example.com', role: 'user' }}
      >
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <ResponsiveButton onClick={() => router.push('/dashboard/messages')}>
            Back to Messages
          </ResponsiveButton>
        </div>
      </ResponsiveDashboardWithNotifications>
    );
  }

  if (!message || !sender) {
    return (
      <ResponsiveDashboardWithNotifications 
        user={{ name: 'User', email: 'user@example.com', role: 'user' }}
      >
        <div className="text-center py-8">
          <p className="text-gray-600">Message not found</p>
          <ResponsiveButton onClick={() => router.push('/dashboard/messages')}>
            Back to Messages
          </ResponsiveButton>
        </div>
      </ResponsiveDashboardWithNotifications>
    );
  }

  return (
    <ResponsiveDashboardWithNotifications 
      user={{ name: sender.first_name + ' ' + sender.last_name, email: sender.email, role: sender.role_name }}
    >
      <ResponsiveContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ResponsiveButton
                variant="ghost"
                onClick={() => router.push('/dashboard/messages')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Messages
              </ResponsiveButton>
              
              <div className="flex items-center space-x-2">
                {message.is_read ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Read</span>
                  </div>
                ) : (
                  <div className="flex items-center text-blue-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Unread</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <ResponsiveButton variant="outline" onClick={() => setShowReply(!showReply)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </ResponsiveButton>
              
              <ResponsiveButton variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </ResponsiveButton>
            </div>
          </div>

          {/* Message Content */}
          <ResponsiveCard>
            {/* Sender Info */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {sender.first_name[0]}{sender.last_name[0]}
                  </span>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {sender.first_name} {sender.last_name}
                  </h2>
                  <p className="text-sm text-gray-600">{sender.role_name}</p>
                  {sender.department && (
                    <p className="text-sm text-gray-600">{sender.department}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(message.created_at)}
                </div>
                {message.updated_at && message.updated_at !== message.created_at && (
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Updated {formatDate(message.updated_at)}
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900 mb-2">{message.subject}</h1>
            </div>

            {/* Message Body */}
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {message.message_text}
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a 
                      href={`mailto:${sender.email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {sender.email}
                    </a>
                  </div>
                </div>
                
                {sender.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <a 
                        href={`tel:${sender.phone}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {sender.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResponsiveCard>

          {/* Reply Section */}
          {showReply && (
            <ResponsiveCard>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply to Message</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your reply here..."
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-2">
                  <ResponsiveButton
                    variant="outline"
                    onClick={() => {
                      setShowReply(false);
                      setReplyText('');
                    }}
                  >
                    Cancel
                  </ResponsiveButton>
                  
                  <ResponsiveButton
                    onClick={handleReply}
                    disabled={!replyText.trim() || sendingReply}
                  >
                    {sendingReply ? 'Sending...' : 'Send Reply'}
                  </ResponsiveButton>
                </div>
              </div>
            </ResponsiveCard>
          )}
        </div>
      </ResponsiveContainer>
    </ResponsiveDashboardWithNotifications>
  );
}
