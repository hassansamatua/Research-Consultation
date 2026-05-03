'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Settings,
  Plus, 
  RefreshCw,
  Download,
  User
} from 'lucide-react';
import { 
  NotificationBadge, 
  NotificationDropdown 
} from './MessageNotifications';

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

// Main responsive dashboard layout with notifications
export function ResponsiveDashboardWithNotifications({ 
  children, 
  user
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string; };
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <ResponsiveContainer>
          <div className="flex items-center justify-between h-16">
                      </div>
        </ResponsiveContainer>
      </header>
      
      {/* Main content */}
        <main className="flex-1">
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
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
