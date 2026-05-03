'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  ChevronDown,
  Home, 
  Users, 
  MessageSquare, 
  Calendar,
  Settings
} from 'lucide-react';

// Breakpoint hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('md');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1400) setBreakpoint('xxl');
      else if (width >= 1200) setBreakpoint('xl');
      else if (width >= 992) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 576) setBreakpoint('sm');
      else setBreakpoint('xs');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
}

// Responsive container
export function ResponsiveContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const breakpoint = useBreakpoint();
  
  const getContainerClass = () => {
    switch (breakpoint) {
      case 'xs': return 'px-4';
      case 'sm': return 'px-6';
      case 'md': return 'px-8';
      case 'lg': return 'px-10';
      case 'xl': return 'px-12';
      case 'xxl': return 'px-16';
      default: return 'px-8';
    }
  };
  
  return (
    <div className={cn('mx-auto w-full', getContainerClass(), className)}>
      {children}
    </div>
  );
}

// Responsive grid
export function ResponsiveGrid({ 
  children, 
  className = '',
  cols = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4, xxl: 4 } 
}: { 
  children: React.ReactNode; 
  className?: string;
  cols?: Record<string, number>;
}) {
  const breakpoint = useBreakpoint();
  const currentCols = cols[breakpoint] || 1;
  
  const gridClass = cn(
    'grid gap-4',
    {
      'grid-cols-1': currentCols === 1,
      'grid-cols-2': currentCols === 2,
      'grid-cols-3': currentCols === 3,
      'grid-cols-4': currentCols === 4,
    },
    className
  );
  
  return <div className={gridClass}>{children}</div>;
}

// Responsive card
export function ResponsiveCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const breakpoint = useBreakpoint();
  
  const paddingClass = {
    xs: 'p-3',
    sm: 'p-4',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-6',
    xxl: 'p-6'
  }[breakpoint] || 'p-4';
  
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', paddingClass, className)}>
      {children}
    </div>
  );
}

// Responsive stat card
export function ResponsiveStatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  className = '' 
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}) {
  const changeColor = changeType === 'increase' ? 'text-green-600' : 
                     changeType === 'decrease' ? 'text-red-600' : 'text-gray-600';
  
  return (
    <ResponsiveCard className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-sm font-medium mt-2 ${changeColor}`}>
              {changeType === 'increase' ? '+' : changeType === 'decrease' ? '-' : ''}{change}%
            </p>
          )}
        </div>
        {icon && (
          <div className="text-2xl text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </ResponsiveCard>
  );
}

// Main responsive dashboard layout
export function SimpleResponsiveDashboard({ 
  children, 
  user,
  navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Students', href: '/dashboard/students', icon: <Users className="h-5 w-5" /> },
    { name: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" />, badge: 3 },
    { name: 'Calendar', href: '/dashboard/calendar', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ]
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; };
  navigation?: Array<{ name: string; href: string; icon: React.ReactNode; badge?: number }>;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === 'xxl';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <ResponsiveContainer>
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              {isMobile && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
              
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RC</span>
                </div>
                {!isMobile && (
                  <h1 className="text-xl font-bold text-gray-900">Research Consultant</h1>
                )}
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Search className="h-5 w-5" />
                </button>
                
                {searchOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">New message from John</p>
                        <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">Meeting reminder</p>
                        <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg">
                        Profile
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg">
                        Settings
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-lg text-red-600">
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ResponsiveContainer>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <div className={cn(
          'bg-white border-r border-gray-200 transition-all duration-300',
          {
            'fixed inset-y-0 left-0 z-50 w-64 transform': isMobile,
            'translate-x-full': isMobile && !sidebarOpen,
            'translate-x-0': isMobile && sidebarOpen,
            'relative w-64': !isMobile,
          }
        )}>
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <div className="h-full flex flex-col">
            {/* Sidebar header */}
            <div className="p-4 border-b border-gray-200">
              {!isMobile && (
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              )}
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                >
                  {item.icon}
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </nav>
            
            {/* Sidebar footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Responsive table
export function ResponsiveTable({ 
  headers, 
  data, 
  className = '' 
}: { 
  headers: string[];
  data: Array<Record<string, any>>;
  className?: string;
}) {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  
  if (isMobile) {
    // Mobile card layout
    return (
      <div className={cn('space-y-4', className)}>
        {data.map((row, index) => (
          <ResponsiveCard key={index}>
            {headers.map((header, headerIndex) => (
              <div key={headerIndex} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm font-medium text-gray-600">{header}</span>
                <span className="text-sm text-gray-900">{row[header]}</span>
              </div>
            ))}
          </ResponsiveCard>
        ))}
      </div>
    );
  }
  
  // Desktop table layout
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {headers.map((header, index) => (
              <th key={index} className="text-left py-3 px-4 text-sm font-medium text-gray-900">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-100 hover:bg-gray-50">
              {headers.map((header, headerIndex) => (
                <td key={headerIndex} className="py-3 px-4 text-sm text-gray-900">
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Responsive button
export function ResponsiveButton({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  className = '',
  disabled = false
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        { 'w-full': fullWidth },
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
