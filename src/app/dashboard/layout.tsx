'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Home,
  User,
  MessageSquare,
  FileText,
  Calendar,
  GraduationCap,
  Users,
  Edit,
  MessageCircle,
  Settings,
  UserPlus,
  BarChart3,
  Shield,
  UserCheck,
  FileCheck,
  ClipboardList,
  PieChart,
  Bell,
  LogOut
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [systemNotifications, setSystemNotifications] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      if (user.role_name === 'supervisor') {
        fetchSystemNotifications();
      }
      // Set up periodic refresh for notifications
      const interval = setInterval(() => {
        fetchUnreadCount();
        if (user.role_name === 'supervisor') {
          fetchSystemNotifications();
        }
      }, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/messages?limit=1');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchSystemNotifications = async () => {
    try {
      const response = await fetch('/api/meetings');
      if (response.ok) {
        const data = await response.json();
        const pendingRequests = data.meetings?.filter((meeting: any) => 
          meeting.requested_by === 'student' && meeting.approval_status === 'pending'
        ).length || 0;
        const upcomingMeetings = data.meetings?.filter((meeting: any) => {
          const meetingDateTime = new Date(`${meeting.meeting_date}T${meeting.meeting_time}`);
          return meetingDateTime > new Date() && meeting.status === 'scheduled' && meeting.approval_status === 'approved';
        }).length || 0;
        
        // System notifications = pending requests + upcoming meetings
        setSystemNotifications(pendingRequests + upcomingMeetings);
      }
    } catch (error) {
      console.error('Failed to fetch system notifications:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center flex-1">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    src="/logo.png"
                    alt="Zanzibar University Logo"
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Zanzibar University
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Research Consultation System
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Welcome, {user.first_name} {user.last_name}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                  {user.role_name?.replace('_', ' ').toUpperCase()}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-green-50 border-r border-green-200 shadow-sm min-h-screen" 
       style={{ 
         backgroundColor: resolvedTheme === 'dark' ? '#000000' : undefined,
         borderRightColor: resolvedTheme === 'dark' ? '#111827' : undefined
       }}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {getMenuItems(user.role_name).map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-green-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                    {item.name === 'Messages' && unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {item.name === 'Notifications' && systemNotifications > 0 && (
                      <span className="ml-auto bg-purple-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {systemNotifications > 9 ? '9+' : systemNotifications}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );

  function getMenuItems(role: string) {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
      { name: 'Profile', href: '/dashboard/profile', icon: <User className="h-5 w-5" /> },
      { name: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Guidelines', href: '/dashboard/guidelines', icon: <FileText className="h-5 w-5" /> },
      { name: 'Deadlines', href: '/dashboard/deadlines', icon: <Calendar className="h-5 w-5" /> },
    ];

    const studentItems = [
      ...baseItems,
      { name: 'Student Dashboard', href: '/dashboard/student', icon: <GraduationCap className="h-5 w-5" /> },
      { name: 'My Supervisor', href: '/dashboard/my-supervisor', icon: <UserCheck className="h-5 w-5" /> },
      { name: 'My Submissions', href: '/dashboard/submissions', icon: <FileText className="h-5 w-5" /> },
      { name: 'Research Progress', href: '/dashboard/progress', icon: <BarChart3 className="h-5 w-5" /> },
    ];

    const supervisorItems = [
      { name: 'Dashboard', href: '/dashboard/supervisor', icon: <Home className="h-5 w-5" /> },
      { name: 'Profile', href: '/dashboard/profile', icon: <User className="h-5 w-5" /> },
      { name: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" /> },
      { name: 'Notifications', href: '/dashboard/notifications', icon: <Bell className="h-5 w-5" /> },
      { name: 'Guidelines', href: '/dashboard/guidelines', icon: <FileText className="h-5 w-5" /> },
      { name: 'Deadlines', href: '/dashboard/deadlines', icon: <Calendar className="h-5 w-5" /> },
      { name: 'Assigned Students', href: '/dashboard/students', icon: <Users className="h-5 w-5" /> },
      { name: 'Review Submissions', href: '/dashboard/review', icon: <Edit className="h-5 w-5" /> },
      { name: 'Student Submissions', href: '/dashboard/submissions', icon: <FileText className="h-5 w-5" /> },
      { name: 'Comments & Feedback', href: '/dashboard/comments', icon: <MessageCircle className="h-5 w-5" /> },
    ];

    const adminItems = [
      ...baseItems,
      { name: 'Admin Dashboard', href: '/dashboard/admin', icon: <Shield className="h-5 w-5" /> },
      { name: 'Create User', href: '/dashboard/admin', icon: <UserPlus className="h-5 w-5" /> },
      { name: 'Supervisor Allocation', href: '/dashboard/supervisor-allocation', icon: <UserCheck className="h-5 w-5" /> },
      { name: 'Document Management', href: '/dashboard/documents', icon: <FileText className="h-5 w-5" /> },
      { name: 'All Students', href: '/dashboard/students', icon: <GraduationCap className="h-5 w-5" /> },
      { name: 'Reports', href: '/dashboard/reports', icon: <BarChart3 className="h-5 w-5" /> },
      { name: 'View Reviews', href: '/dashboard/admin/reviews', icon: <ClipboardList className="h-5 w-5" /> },
    ];

    const superAdminItems = [
      ...adminItems,
      { name: 'User Management', href: '/dashboard/admin', icon: <Users className="h-5 w-5" /> },
      { name: 'System Settings', href: '/dashboard/system-settings', icon: <Settings className="h-5 w-5" /> },
      { name: 'Audit Logs', href: '/dashboard/audit', icon: <FileCheck className="h-5 w-5" /> },
    ];

    switch (role) {
      case 'student':
        return studentItems;
      case 'supervisor':
        return supervisorItems;
      case 'admin':
        return adminItems;
      case 'super_admin':
        return superAdminItems;
      default:
        return baseItems;
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
