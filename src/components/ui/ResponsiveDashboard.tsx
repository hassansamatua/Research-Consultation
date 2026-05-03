'use client';

import { useState } from 'react';
import { 
  ResponsiveContainer, 
  ResponsiveGrid, 
  ResponsiveFlex, 
  ResponsiveCard, 
  ResponsiveButton,
  ResponsiveSidebar,
  ResponsiveNav,
  useBreakpoint,
  useBreakpointValue,
  ResponsiveVisibility
} from './ResponsiveLayout';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  Bell, 
  Search, 
  User, 
  Home, 
  Users, 
  MessageSquare, 
  Calendar,
  Settings,
  ChevronDown,
  Plus
} from 'lucide-react';

interface ResponsiveDashboardProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  navigation?: Array<{
    name: string;
    href: string;
    icon: React.ReactNode;
    badge?: number;
  }>;
}

export function ResponsiveDashboard({ 
  children, 
  user, 
  navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Students', href: '/dashboard/students', icon: <Users className="h-5 w-5" /> },
    { name: 'Messages', href: '/dashboard/messages', icon: <MessageSquare className="h-5 w-5" />, badge: 3 },
    { name: 'Calendar', href: '/dashboard/calendar', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Settings', href: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
  ]
}: ResponsiveDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === 'xxl';
  
  const sidebarWidth = useBreakpointValue({
    xs: 'w-64',
    sm: 'w-64',
    md: 'w-56',
    lg: 'w-64',
    xl: 'w-72',
    xxl: 'w-80'
  });
  
  const headerHeight = useBreakpointValue({
    xs: 'h-14',
    sm: 'h-16',
    md: 'h-16',
    lg: 'h-16',
    xl: 'h-16',
    xxl: 'h-16'
  });
  
  const containerPadding = useBreakpointValue({
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-6',
    xxl: 'p-8'
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className={cn(
        'sticky top-0 z-30 bg-white border-b border-gray-200',
        headerHeight
      )}>
        <ResponsiveContainer fluid>
          <ResponsiveFlex 
            className="h-full items-center justify-between"
            justify={{ md: 'between' }}
            align={{ md: 'center' }}
          >
            {/* Left side */}
            <ResponsiveFlex 
              className="items-center space-x-4"
              align="center"
            >
              {/* Mobile menu button */}
              <ResponsiveVisibility show={{ xs: true, sm: true }}>
                <ResponsiveButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </ResponsiveButton>
              </ResponsiveVisibility>
              
              {/* Logo/Title */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">RC</span>
                </div>
                <ResponsiveVisibility hide={{ xs: true }}>
                  <h1 className="text-xl font-bold text-gray-900">Research Consultant</h1>
                </ResponsiveVisibility>
              </div>
            </ResponsiveFlex>
            
            {/* Right side */}
            <ResponsiveFlex 
              className="items-center space-x-2"
              align="center"
            >
              {/* Search */}
              <div className="relative">
                <ResponsiveButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  <Search className="h-5 w-5" />
                </ResponsiveButton>
                
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
                <ResponsiveButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </ResponsiveButton>
                
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
                <ResponsiveButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
                </ResponsiveButton>
                
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
            </ResponsiveFlex>
          </ResponsiveContainer>
        </ResponsiveContainer>
      </header>
      
      <div className="flex">
        {/* Sidebar */}
        <ResponsiveSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          width={{
            xs: 'w-64',
            sm: 'w-64',
            md: 'w-56',
            lg: 'w-64',
            xl: 'w-72',
            xxl: 'w-80'
          }}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar header */}
            <div className="p-4 border-b border-gray-200">
              <ResponsiveVisibility show={{ md: true, lg: true, xl: true, xxl: true }}>
                <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              </ResponsiveVisibility>
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                    'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                  )}
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
        </ResponsiveSidebar>
        
        {/* Main content */}
        <main className="flex-1">
          <div className={containerPadding}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Responsive stats grid component
interface ResponsiveStatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveStatsGrid({ children, className }: ResponsiveStatsGridProps) {
  return (
    <ResponsiveGrid 
      className={className}
      cols={{ 
        xs: 1, 
        sm: 2, 
        md: 2, 
        lg: 3, 
        xl: 4, 
        xxl: 4 
      }}
      gap={{ 
        xs: 'gap-3', 
        sm: 'gap-4', 
        md: 'gap-4', 
        lg: 'gap-6', 
        xl: 'gap-6', 
        xxl: 'gap-6' 
      }}
    >
      {children}
    </ResponsiveGrid>
  );
}

// Responsive stat card component
interface ResponsiveStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export function ResponsiveStatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  className 
}: ResponsiveStatCardProps) {
  const changeColor = changeType === 'increase' ? 'text-green-600' : 
                     changeType === 'decrease' ? 'text-red-600' : 'text-gray-600';
  
  return (
    <ResponsiveCard 
      className={className}
      padding={{ 
        xs: 'p-3', 
        sm: 'p-4', 
        md: 'p-4', 
        lg: 'p-6', 
        xl: 'p-6', 
        xxl: 'p-6' 
      }}
      rounded={{ 
        xs: 'rounded-lg', 
        sm: 'rounded-lg', 
        md: 'rounded-lg', 
        lg: 'rounded-xl', 
        xl: 'rounded-xl', 
        xxl: 'rounded-xl' 
      }}
    >
      <ResponsiveFlex 
        justify="between"
        align="start"
      >
        <div className="flex-1">
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
      </ResponsiveFlex>
    </ResponsiveCard>
  );
}

// Responsive table component
interface ResponsiveTableProps {
  headers: string[];
  data: Array<Record<string, any>>;
  className?: string;
}

export function ResponsiveTable({ headers, data, className }: ResponsiveTableProps) {
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  
  if (isMobile) {
    // Mobile card layout
    return (
      <div className={cn('space-y-4', className)}>
        {data.map((row, index) => (
          <ResponsiveCard key={index} padding={{ xs: 'p-3', sm: 'p-4' }}>
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

// Responsive form component
interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

export function ResponsiveForm({ children, className, onSubmit }: ResponsiveFormProps) {
  return (
    <form 
      className={cn('space-y-4', className)}
      onSubmit={onSubmit}
    >
      <ResponsiveGrid 
        cols={{ 
          xs: 1, 
          sm: 1, 
          md: 2, 
          lg: 2, 
          xl: 3, 
          xxl: 3 
        }}
        gap={{ 
          xs: 'gap-4', 
          sm: 'gap-4', 
          md: 'gap-6', 
          lg: 'gap-6', 
          xl: 'gap-6', 
          xxl: 'gap-6' 
        }}
      >
        {children}
      </ResponsiveGrid>
    </form>
  );
}

// Responsive action buttons component
interface ResponsiveActionButtonsProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveActionButtons({ children, className }: ResponsiveActionButtonsProps) {
  return (
    <ResponsiveFlex 
      className={className}
      direction={{ xs: 'col', sm: 'col', md: 'row', lg: 'row', xl: 'row', xxl: 'row' }}
      gap={{ xs: 'gap-2', sm: 'gap-2', md: 'gap-3', lg: 'gap-3', xl: 'gap-3', xxl: 'gap-3' }}
      justify={{ md: 'end' }}
    >
      {children}
    </ResponsiveFlex>
  );
}
