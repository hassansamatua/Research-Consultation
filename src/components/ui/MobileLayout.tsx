'use client';

import { useState } from 'react';
import { Menu, X, Bell, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  title?: string;
  showSearch?: boolean;
}

export function MobileLayout({ 
  children, 
  user, 
  title, 
  showSearch = true 
}: MobileLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left Side */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </button>
            
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[150px]">
                {title}
              </h1>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            {showSearch && (
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>
            )}

            {/* Notifications */}
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            </button>
          </div>
        </div>

        {/* Search Bar (Mobile) */}
        {searchOpen && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
            
            {/* Menu Items */}
            <nav className="p-4 space-y-2">
              <a href="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-lg">🏠</span>
                <span className="text-gray-700">Dashboard</span>
              </a>
              <a href="/dashboard/messages" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-lg">💬</span>
                <span className="text-gray-700">Messages</span>
              </a>
              <a href="/dashboard/notifications" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-lg">🔔</span>
                <span className="text-gray-700">Notifications</span>
              </a>
              <a href="/dashboard/profile" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="text-lg">👤</span>
                <span className="text-gray-700">Profile</span>
              </a>
            </nav>

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setNotificationsOpen(false)}
          />
          
          {/* Notifications Panel */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>
            
            {/* Notifications List */}
            <div className="p-4 space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">New message</p>
                <p className="text-xs text-blue-700 mt-1">You have a new message from John Doe</p>
                <p className="text-xs text-blue-600 mt-2">2 minutes ago</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-900">Meeting request</p>
                <p className="text-xs text-orange-700 mt-1">Jane Smith requested a meeting</p>
                <p className="text-xs text-orange-600 mt-2">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2">
          <a href="/dashboard" className="flex flex-col items-center p-2 text-gray-700 hover:text-blue-600 transition-colors">
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs">Home</span>
          </a>
          <a href="/dashboard/messages" className="flex flex-col items-center p-2 text-gray-700 hover:text-blue-600 transition-colors relative">
            <span className="text-xl mb-1">💬</span>
            <span className="text-xs">Messages</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </a>
          <a href="/dashboard/notifications" className="flex flex-col items-center p-2 text-gray-700 hover:text-blue-600 transition-colors relative">
            <span className="text-xl mb-1">🔔</span>
            <span className="text-xs">Alerts</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
          </a>
          <a href="/dashboard/profile" className="flex flex-col items-center p-2 text-gray-700 hover:text-blue-600 transition-colors">
            <span className="text-xl mb-1">👤</span>
            <span className="text-xs">Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// Mobile Card Component
export function MobileCard({ 
  children, 
  title, 
  subtitle, 
  action,
  className = "" 
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
      className
    )}>
      {(title || subtitle) && (
        <div className="px-4 py-3 border-b border-gray-200">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="px-4 py-3">
        {children}
      </div>
      
      {action && (
        <div className="px-4 py-3 border-t border-gray-200">
          {action}
        </div>
      )}
    </div>
  );
}

// Mobile Stats Grid
export function MobileStatsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {children}
    </div>
  );
}

// Mobile Stat Card
export function MobileStatCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  icon 
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "increase" | "decrease" | "neutral";
  icon?: React.ReactNode;
}) {
  const changeColor = changeType === "increase" ? "text-green-600" : 
                     changeType === "decrease" ? "text-red-600" : "text-gray-600";

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {change !== undefined && (
        <div className="flex items-center mt-2">
          <span className={`text-xs font-medium ${changeColor}`}>
            {changeType === "increase" ? "+" : changeType === "decrease" ? "-" : ""}{change}%
          </span>
        </div>
      )}
    </div>
  );
}

// Mobile List Item
export function MobileListItem({ 
  title, 
  subtitle, 
  action, 
  icon, 
  badge,
  onClick 
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
  onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-600 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 flex-shrink-0">
        {badge && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {badge}
          </span>
        )}
        {action}
      </div>
    </div>
  );
}

// Mobile Button
export function MobileButton({ 
  children, 
  variant = "primary", 
  size = "md", 
  onClick,
  disabled = false,
  fullWidth = false,
  icon 
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg",
    secondary: "bg-gray-100 text-gray-900",
    outline: "border-2 border-gray-300 text-gray-700",
    ghost: "text-gray-700 hover:bg-gray-100"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full"
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// Mobile Search Bar
export function MobileSearchBar({ 
  placeholder = "Search...", 
  value, 
  onChange,
  onClear 
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
}
