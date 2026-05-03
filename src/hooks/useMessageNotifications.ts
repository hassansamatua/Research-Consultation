'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  sender_first_name: string;
  sender_last_name: string;
  subject: string;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender_id?: number;
  recipient_id?: number;
}

interface NotificationState {
  unreadCount: number;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export function useMessageNotifications() {
  const [state, setState] = useState<NotificationState>({
    unreadCount: 0,
    messages: [],
    loading: true,
    error: null
  });

  const router = useRouter();

  // Fetch messages and update unread count
  const fetchMessages = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      const messages = data.messages || [];
      const unreadCount = messages.filter((msg: Message) => !msg.is_read).length;
      
      setState({
        unreadCount,
        messages,
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messages'
      }));
    }
  }, []);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: number) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      // Update local state
      setState(prev => {
        const updatedMessages = prev.messages.map(msg =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        );
        const unreadCount = updatedMessages.filter(msg => !msg.is_read).length;
        
        return {
          ...prev,
          messages: updatedMessages,
          unreadCount
        };
      });

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }, []);

  // Mark multiple messages as read
  const markMultipleAsRead = useCallback(async (messageIds: number[]) => {
    try {
      const response = await fetch('/api/messages/mark-multiple-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark messages as read');
      }

      // Update local state
      setState(prev => {
        const updatedMessages = prev.messages.map(msg =>
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        );
        const unreadCount = updatedMessages.filter(msg => !msg.is_read).length;
        
        return {
          ...prev,
          messages: updatedMessages,
          unreadCount
        };
      });

      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }, []);

  // Mark all messages as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/messages/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to mark all messages as read');
      }

      // Update local state
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg => ({ ...msg, is_read: true })),
        unreadCount: 0
      }));

      return true;
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      return false;
    }
  }, []);

  // Open message and mark as read
  const openMessage = useCallback(async (messageId: number) => {
    const message = state.messages.find(msg => msg.id === messageId);
    
    if (message && !message.is_read) {
      // Mark as read
      await markAsRead(messageId);
    }
    
    // Navigate to message detail or open modal
    router.push(`/dashboard/messages/${messageId}`);
  }, [state.messages, markAsRead, router]);

  // Get unread messages
  const getUnreadMessages = useCallback(() => {
    return state.messages.filter(msg => !msg.is_read);
  }, [state.messages]);

  // Get recent messages (last 5)
  const getRecentMessages = useCallback((limit: number = 5) => {
    return state.messages
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }, [state.messages]);

  // Refresh messages
  const refresh = useCallback(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Initialize on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Set up periodic refresh (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchMessages]);

  return {
    ...state,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    openMessage,
    getUnreadMessages,
    getRecentMessages,
    refresh
  };
}

// Hook for notification badge
export function useNotificationBadge() {
  const { unreadCount, loading } = useMessageNotifications();
  
  return {
    count: unreadCount,
    isLoading: loading,
    hasUnread: unreadCount > 0,
    showBadge: unreadCount > 0 && !loading
  };
}

// Hook for message list with read functionality
export function useMessageList() {
  const {
    messages,
    unreadCount,
    loading,
    error,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    openMessage,
    getUnreadMessages,
    getRecentMessages,
    refresh
  } = useMessageNotifications();

  // Handle message click
  const handleMessageClick = async (messageId: number) => {
    await openMessage(messageId);
  };

  // Handle bulk actions
  const handleBulkMarkAsRead = async (messageIds: number[]) => {
    await markMultipleAsRead(messageIds);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return {
    messages,
    unreadMessages: getUnreadMessages(),
    recentMessages: getRecentMessages(),
    unreadCount,
    loading,
    error,
    handleMessageClick,
    handleBulkMarkAsRead,
    handleMarkAllAsRead,
    refresh
  };
}
