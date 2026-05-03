'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Breakpoint definitions
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Hook to get current breakpoint
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md');

  useEffect(() => {
    const getBreakpoint = (width: number): Breakpoint => {
      if (width >= BREAKPOINTS.xxl) return 'xxl';
      if (width >= BREAKPOINTS.xl) return 'xl';
      if (width >= BREAKPOINTS.lg) return 'lg';
      if (width >= BREAKPOINTS.md) return 'md';
      if (width >= BREAKPOINTS.sm) return 'sm';
      return 'xs';
    };

    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    // Set initial breakpoint
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

// Hook to check if current breakpoint matches or is larger
export function useBreakpointValue<T>(values: Partial<Record<Breakpoint, T>>): T {
  const breakpoint = useBreakpoint();
  
  // Find the largest breakpoint that has a value
  const sortedBreakpoints = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
  const currentIndex = sortedBreakpoints.indexOf(breakpoint);
  
  for (let i = currentIndex; i < sortedBreakpoints.length; i++) {
    const bp = sortedBreakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp] as T;
    }
  }
  
  // Fallback to xs or first defined value
  return values.xs ?? values.sm ?? values.md ?? values.lg ?? values.xl ?? values.xxl as T;
}

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  fluid?: boolean;
}

export function ResponsiveContainer({ children, className, fluid = false }: ResponsiveContainerProps) {
  const breakpoint = useBreakpoint();
  
  const getContainerClass = () => {
    if (fluid) return 'w-full';
    
    switch (breakpoint) {
      case 'xs':
        return 'max-w-full px-4';
      case 'sm':
        return 'max-w-sm px-6';
      case 'md':
        return 'max-w-md px-8';
      case 'lg':
        return 'max-w-lg px-10';
      case 'xl':
        return 'max-w-xl px-12';
      case 'xxl':
        return 'max-w-xxl px-16';
      default:
        return 'max-w-md px-8';
    }
  };
  
  return (
    <div className={cn(getContainerClass(), className)}>
      {children}
    </div>
  );
}

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: Partial<Record<Breakpoint, number>>;
  gap?: Partial<Record<Breakpoint, string>>;
}

export function ResponsiveGrid({ children, className, cols = {}, gap = {} }: ResponsiveGridProps) {
  const breakpoint = useBreakpoint();
  
  const getCols = () => {
    const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (cols[bp] !== undefined) {
        return cols[bp];
      }
    }
    
    return 1; // Default to 1 column
  };
  
  const getGap = () => {
    const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (gap[bp] !== undefined) {
        return gap[bp];
      }
    }
    
    return 'gap-4'; // Default gap
  };
  
  const columns = getCols();
  const gapClass = getGap();
  
  const gridClass = cn(
    'grid',
    gapClass,
    {
      'grid-cols-1': columns === 1,
      'grid-cols-2': columns === 2,
      'grid-cols-3': columns === 3,
      'grid-cols-4': columns === 4,
      'grid-cols-5': columns === 5,
      'grid-cols-6': columns === 6,
      'grid-cols-8': columns === 8,
      'grid-cols-10': columns === 10,
      'grid-cols-12': columns === 12,
    },
    className
  );
  
  return (
    <div className={gridClass}>
      {children}
    </div>
  );
}

// Responsive flex component
interface ResponsiveFlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: Partial<Record<Breakpoint, 'row' | 'col'>>;
  justify?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'between' | 'around'>>;
  align?: Partial<Record<Breakpoint, 'start' | 'center' | 'end' | 'stretch'>>;
  wrap?: Partial<Record<Breakpoint, boolean>>;
}

export function ResponsiveFlex({ 
  children, 
  className, 
  direction = {}, 
  justify = {}, 
  align = {}, 
  wrap = {} 
}: ResponsiveFlexProps) {
  const breakpoint = useBreakpoint();
  
  const getValue = <T,>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
    const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }
    
    return defaultValue;
  };
  
  const dir = getValue(direction, 'row');
  const just = getValue(justify, 'start');
  const ali = getValue(align, 'start');
  const shouldWrap = getValue(wrap, false);
  
  const flexClass = cn(
    'flex',
    {
      'flex-row': dir === 'row',
      'flex-col': dir === 'col',
      'justify-start': just === 'start',
      'justify-center': just === 'center',
      'justify-end': just === 'end',
      'justify-between': just === 'between',
      'justify-around': just === 'around',
      'items-start': ali === 'start',
      'items-center': ali === 'center',
      'items-end': ali === 'end',
      'items-stretch': ali === 'stretch',
      'flex-wrap': shouldWrap,
    },
    className
  );
  
  return (
    <div className={flexClass}>
      {children}
    </div>
  );
}

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: Partial<Record<Breakpoint, string>>;
  weight?: Partial<Record<Breakpoint, string>>;
  align?: Partial<Record<Breakpoint, 'left' | 'center' | 'right'>>;
}

export function ResponsiveText({ 
  children, 
  className, 
  size = {}, 
  weight = {}, 
  align = {} 
}: ResponsiveTextProps) {
  const breakpoint = useBreakpoint();
  
  const getValue = <T,>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
    const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }
    
    return defaultValue;
  };
  
  const textSize = getValue(size, 'text-base');
  const textWeight = getValue(weight, 'font-normal');
  const textAlign = getValue(align, 'left');
  
  const textClass = cn(
    textSize,
    textWeight,
    {
      'text-left': textAlign === 'left',
      'text-center': textAlign === 'center',
      'text-right': textAlign === 'right',
    },
    className
  );
  
  return (
    <p className={textClass}>
      {children}
    </p>
  );
}

// Responsive spacing component
interface ResponsiveSpacingProps {
  className?: string;
  padding?: Partial<Record<Breakpoint, string>>;
  margin?: Partial<Record<Breakpoint, string>>;
  children?: React.ReactNode;
}

export function ResponsiveSpacing({ 
  className, 
  padding = {}, 
  margin = {}, 
  children 
}: ResponsiveSpacingProps) {
  const breakpoint = useBreakpoint();
  
  const getValue = (values: Partial<Record<Breakpoint, string>>, defaultValue: string): string => {
    const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }
    
    return defaultValue;
  };
  
  const paddingClass = getValue(padding, '');
  const marginClass = getValue(margin, '');
  
  const spacingClass = cn(
    paddingClass,
    marginClass,
    className
  );
  
  if (children) {
    return (
      <div className={spacingClass}>
        {children}
      </div>
    );
  }
  
  return <div className={spacingClass} />;
}

// Responsive visibility component
interface ResponsiveVisibilityProps {
  children: React.ReactNode;
  show?: Partial<Record<Breakpoint, boolean>>;
  hide?: Partial<Record<Breakpoint, boolean>>;
}

export function ResponsiveVisibility({ children, show = {}, hide = {} }: ResponsiveVisibilityProps) {
  const breakpoint = useBreakpoint();
  
  const shouldShow = () => {
    // Check hide rules first (they take precedence)
    if (hide[breakpoint]) return false;
    
    // Check show rules
    if (show[breakpoint] !== undefined) return show[breakpoint];
    
    // Default to showing if no rules are defined
    return true;
  };
  
  if (!shouldShow()) {
    return null;
  }
  
  return <>{children}</>;
}

// Responsive sidebar component
interface ResponsiveSidebarProps {
  children: React.ReactNode;
  className?: string;
  width?: Partial<Record<Breakpoint, string>>;
  position?: 'left' | 'right';
  isOpen?: boolean;
  onToggle?: () => void;
}

export function ResponsiveSidebar({ 
  children, 
  className, 
  width = {}, 
  position = 'left',
  isOpen = false,
  onToggle 
}: ResponsiveSidebarProps) {
  const breakpoint = useBreakpoint();
  
  const getSidebarWidth = () => {
    const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (width[bp] !== undefined) {
        return width[bp];
      }
    }
    
    return 'w-64'; // Default width
  };
  
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const sidebarWidth = getSidebarWidth();
  
  const sidebarClass = cn(
    'bg-white border-r border-gray-200 transition-all duration-300',
    sidebarWidth,
    {
      'fixed inset-y-0 z-50 transform': isMobile,
      'translate-x-full': isMobile && !isOpen,
      'translate-x-0': isMobile && isOpen,
      'relative': !isMobile,
    },
    className
  );
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={sidebarClass}>
        {children}
      </div>
    </>
  );
}

// Responsive navigation component
interface ResponsiveNavProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'adaptive';
}

export function ResponsiveNav({ children, className, variant = 'adaptive' }: ResponsiveNavProps) {
  const breakpoint = useBreakpoint();
  
  const getNavVariant = () => {
    if (variant === 'adaptive') {
      return (breakpoint === 'xs' || breakpoint === 'sm') ? 'vertical' : 'horizontal';
    }
    return variant;
  };
  
  const navVariant = getNavVariant();
  
  const navClass = cn(
    'flex',
    {
      'flex-col': navVariant === 'vertical',
      'flex-row': navVariant === 'horizontal',
    },
    className
  );
  
  return (
    <nav className={navClass}>
      {children}
    </nav>
  );
}

// Responsive card component
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: Partial<Record<Breakpoint, string>>;
  rounded?: Partial<Record<Breakpoint, string>>;
  shadow?: Partial<Record<Breakpoint, string>>;
}

export function ResponsiveCard({ 
  children, 
  className, 
  padding = {}, 
  rounded = {}, 
  shadow = {} 
}: ResponsiveCardProps) {
  const breakpoint = useBreakpoint();
  
  const getValue = <T,>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
    const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }
    
    return defaultValue;
  };
  
  const paddingClass = getValue(padding, 'p-4');
  const roundedClass = getValue(rounded, 'rounded-lg');
  const shadowClass = getValue(shadow, 'shadow-sm');
  
  const cardClass = cn(
    'bg-white border border-gray-200',
    paddingClass,
    roundedClass,
    shadowClass,
    className
  );
  
  return (
    <div className={cardClass}>
      {children}
    </div>
  );
}

// Responsive button component
interface ResponsiveButtonProps {
  children: React.ReactNode;
  className?: string;
  size?: Partial<Record<Breakpoint, 'sm' | 'md' | 'lg' | 'xl'>>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: Partial<Record<Breakpoint, boolean>>;
  onClick?: () => void;
  disabled?: boolean;
}

export function ResponsiveButton({ 
  children, 
  className, 
  size = {}, 
  variant = 'primary',
  fullWidth = {},
  onClick,
  disabled = false 
}: ResponsiveButtonProps) {
  const breakpoint = useBreakpoint();
  
  const getValue = <T,>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
    const breakpointOrder = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'] as Breakpoint[];
    const currentIndex = breakpointOrder.indexOf(breakpoint);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }
    
    return defaultValue;
  };
  
  const buttonSize = getValue(size, 'md');
  const isFullWidth = getValue(fullWidth, false);
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };
  
  const buttonClass = cn(
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[buttonSize],
    variantClasses[variant],
    {
      'w-full': isFullWidth,
    },
    className
  );
  
  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
