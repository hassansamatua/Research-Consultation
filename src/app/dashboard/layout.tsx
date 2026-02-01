'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
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
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  ZU Research Portal
                </h1>
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
      { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
      { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
      { name: 'Messages', href: '/dashboard/messages', icon: '💬' },
      { name: 'Guidelines', href: '/dashboard/guidelines', icon: '📋' },
      { name: 'Deadlines', href: '/dashboard/deadlines', icon: '📅' },
    ];

    const studentItems = [
      ...baseItems,
      { name: 'Student Dashboard', href: '/dashboard/student', icon: '🎓' },
      { name: 'My Supervisor', href: '/dashboard/supervisor', icon: '👨‍🏫' },
      { name: 'My Submissions', href: '/dashboard/submissions', icon: '📄' },
      { name: 'Research Progress', href: '/dashboard/progress', icon: '📊' },
    ];

    const supervisorItems = [
      ...baseItems,
      { name: 'Assigned Students', href: '/dashboard/students', icon: '👥' },
      { name: 'Review Submissions', href: '/dashboard/review', icon: '📝' },
      { name: 'Student Submissions', href: '/dashboard/submissions', icon: '📄' },
      { name: 'Comments & Feedback', href: '/dashboard/comments', icon: '💭' },
    ];

    const adminItems = [
      ...baseItems,
      { name: 'Admin Dashboard', href: '/dashboard/admin', icon: '🏛️' },
      { name: 'Create User', href: '/dashboard/admin', icon: '👤' },
      { name: 'Supervisor Allocation', href: '/dashboard/supervisor-allocation', icon: '🔄' },
      { name: 'Document Management', href: '/dashboard/documents', icon: '📚' },
      { name: 'All Students', href: '/dashboard/students', icon: '🎓' },
      { name: 'Reports', href: '/dashboard/reports', icon: '📈' },
    ];

    const superAdminItems = [
      ...adminItems,
      { name: 'User Management', href: '/dashboard/admin', icon: '👥' },
      { name: 'System Settings', href: '/dashboard/system-settings', icon: '⚙️' },
      { name: 'Audit Logs', href: '/dashboard/audit', icon: '📋' },
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
