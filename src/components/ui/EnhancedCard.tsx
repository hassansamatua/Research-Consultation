'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface EnhancedCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  borderColor?: string;
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export function EnhancedCard({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  bgColor = 'bg-white',
  borderColor = 'border-gray-200',
  hover = true,
  className = '',
  onClick
}: EnhancedCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl shadow-lg transition-all duration-300
        ${bgColor} ${borderColor} border
        ${hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white opacity-5 pointer-events-none" />
      
      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        {(title || Icon) && (
          <div className="flex items-center justify-between mb-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {Icon && (
              <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-800 ${iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
            )}
          </div>
        )}
        
        {/* Main Content */}
        {children}
      </div>
      
      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType = 'increase',
  icon: Icon,
  iconColor = 'text-blue-600',
  bgColor = 'bg-white'
}: StatsCardProps) {
  return (
    <EnhancedCard
      title={title}
      icon={Icon}
      iconColor={iconColor}
      bgColor={bgColor}
      className="group"
    >
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? '+' : '-'}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {change !== undefined && (
            <div className={`w-2 h-2 rounded-full ${
              changeType === 'increase' ? 'bg-green-500' : 'bg-red-500'
            } animate-pulse`} />
          )}
        </div>
      </div>
    </EnhancedCard>
  );
}
