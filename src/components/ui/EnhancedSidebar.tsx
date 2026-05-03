'use client';

import { useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  badgeColor?: string;
  active?: boolean;
}

interface EnhancedSidebarProps {
  items: SidebarItem[];
  user: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  collapsed?: boolean;
  onCollapse?: () => void;
}

export function EnhancedSidebar({ items, user, collapsed = false, onCollapse }: EnhancedSidebarProps) {
  const [activeItem, setActiveItem] = useState(items[0]?.name || '');

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.role}
                </p>
              </div>
            </div>
          )}
          
          {collapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold mx-auto">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
          )}
          
          <button
            onClick={onCollapse}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.name;
          
          return (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setActiveItem(item.name)}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <Icon className={cn(
                "flex-shrink-0 transition-transform duration-200",
                isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700",
                collapsed ? "mx-auto" : "mr-3"
              )} />
              
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  
                  {item.badge && item.badge > 0 && (
                    <span className={cn(
                      "ml-auto px-2 py-0.5 text-xs rounded-full animate-pulse",
                      item.badgeColor || "bg-red-500 text-white"
                    )}>
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </>
              )}
              
              {collapsed && item.badge && item.badge > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse",
                  item.badgeColor || "bg-red-500"
                )} />
              )}
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-sm font-medium text-green-600">Online</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}
