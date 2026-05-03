'use client';

import { useState, useEffect } from 'react';
import { 
  useMessageNotifications, 
  useNotificationBadge, 
  useMessageList 
} from '@/hooks/useMessageNotifications';
import { 
  Bell, 
  X, 
  MessageSquare, 
  Check, 
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Notification Badge Component
export function NotificationBadge() {
  const { count, isLoading, hasUnread, showBadge } = useNotificationBadge();

  if (isLoading) {
    return (
      <div className="relative">
        <Bell className="h-5 w-5 text-gray-600" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5 text-gray-600" />
      {showBadge && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
}

// Notification Dropdown Component
export function NotificationDropdown({ 
  isOpen, 
  onClose,
  onMessageClick 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onMessageClick: (messageId: number) => void;
}) {
  const { 
    recentMessages, 
    unreadMessages, 
    unreadCount, 
    loading, 
    error,
    handleMessageClick,
    handleMarkAllAsRead,
    refresh
  } = useMessageList();

  const [markingAll, setMarkingAll] = useState(false);

  const handleMarkAllAsReadClick = async () => {
    setMarkingAll(true);
    try {
      await handleMarkAllAsRead();
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMessageClickInternal = async (messageId: number) => {
    await handleMessageClick(messageId);
    onMessageClick(messageId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">
            {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
          </span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsReadClick}
              disabled={markingAll}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {markingAll ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-4" />
            <p>Error loading notifications</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          </div>
        ) : recentMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-4" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentMessages.map((message) => (
              <NotificationItem
                key={message.id}
                message={message}
                onClick={() => handleMessageClickInternal(message.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={() => {
            window.location.href = '/dashboard/messages';
            onClose();
          }}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View all messages
        </button>
      </div>
    </div>
  );
}

// Individual Notification Item
function NotificationItem({ 
  message, 
  onClick 
}: { 
  message: any; 
  onClick: () => void;
}) {
  const isUnread = !message.is_read;
  const timeAgo = getTimeAgo(message.created_at);

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
        isUnread && 'bg-blue-50 border-l-4 border-blue-500'
      )}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          isUnread ? 'bg-blue-100' : 'bg-gray-100'
        )}>
          <User className={cn(
            'h-5 w-5',
            isUnread ? 'text-blue-600' : 'text-gray-600'
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={cn(
              'text-sm font-medium truncate',
              isUnread ? 'text-gray-900' : 'text-gray-700'
            )}>
              {message.sender_first_name} {message.sender_last_name}
            </h4>
            {isUnread && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
            )}
          </div>
          
          <p className={cn(
            'text-sm truncate mb-1',
            isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
          )}>
            {message.subject}
          </p>
          
          <p className="text-xs text-gray-500 truncate mb-2">
            {message.message_text}
          </p>
          
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {timeAgo}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get time ago
function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  // If older than a week, show the date
  return date.toLocaleDateString();
}

// Message List Component with Read Functionality
export function MessageList() {
  const { 
    messages, 
    unreadMessages, 
    loading, 
    error,
    handleMessageClick,
    handleBulkMarkAsRead,
    handleMarkAllAsRead,
    refresh
  } = useMessageList();

  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleSelectMessage = (messageId: number) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMessages.length === unreadMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(unreadMessages.map(msg => msg.id));
    }
  };

  const handleBulkMarkAsReadClick = async () => {
    if (selectedMessages.length > 0) {
      await handleBulkMarkAsRead(selectedMessages);
      setSelectedMessages([]);
    }
  };

  useEffect(() => {
    setShowBulkActions(selectedMessages.length > 0);
  }, [selectedMessages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <MessageSquare className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-600 mb-4">Error loading messages</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <p className="text-sm text-gray-600">
            {unreadMessages.length} unread message{unreadMessages.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadMessages.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={refresh}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MessageSquare className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedMessages.length} message{selectedMessages.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedMessages([])}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear selection
              </button>
              <button
                onClick={handleBulkMarkAsReadClick}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Mark as read
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <MessageListItem
              key={message.id}
              message={message}
              isSelected={selectedMessages.includes(message.id)}
              onSelect={() => handleSelectMessage(message.id)}
              onClick={() => handleMessageClick(message.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Message List Item
function MessageListItem({ 
  message, 
  isSelected, 
  onSelect, 
  onClick 
}: { 
  message: any; 
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  const isUnread = !message.is_read;
  const timeAgo = getTimeAgo(message.created_at);

  return (
    <div
      className={cn(
        'bg-white rounded-lg border transition-all cursor-pointer',
        isUnread ? 'border-blue-200 bg-blue-50' : 'border-gray-200',
        isSelected && 'ring-2 ring-blue-500'
      )}
    >
      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox for bulk selection */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />

          {/* Avatar */}
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
            isUnread ? 'bg-blue-100' : 'bg-gray-100'
          )}>
            <User className={cn(
              'h-5 w-5',
              isUnread ? 'text-blue-600' : 'text-gray-600'
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0" onClick={onClick}>
            <div className="flex items-center justify-between mb-1">
              <h4 className={cn(
                'text-sm font-medium truncate',
                isUnread ? 'text-gray-900' : 'text-gray-700'
              )}>
                {message.sender_first_name} {message.sender_last_name}
              </h4>
              <div className="flex items-center space-x-2">
                {isUnread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <span className="text-xs text-gray-500">{timeAgo}</span>
              </div>
            </div>
            
            <h5 className={cn(
              'text-sm truncate mb-1',
              isUnread ? 'text-gray-900 font-medium' : 'text-gray-600'
            )}>
              {message.subject}
            </h5>
            
            <p className="text-sm text-gray-600 line-clamp-2">
              {message.message_text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
