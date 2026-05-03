'use client';

import { React, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MinimalHeaderProps {
  children: ReactNode;
  className?: string;
}

export function MinimalHeader({ children, className = '' }: MinimalHeaderProps) {
  return (
    <div className={cn('bg-white border-b border-gray-200', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold text-gray-900">
              Welcome User!
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
