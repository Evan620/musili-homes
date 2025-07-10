import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Breakpoint definitions
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook to get current screen size
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) setBreakpoint('2xl');
      else if (width >= breakpoints.xl) setBreakpoint('xl');
      else if (width >= breakpoints.lg) setBreakpoint('lg');
      else if (width >= breakpoints.md) setBreakpoint('md');
      else if (width >= breakpoints.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

// Hook to check if screen is mobile
export const useIsMobile = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

// Hook to check if screen is tablet
export const useIsTablet = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md';
};

// Hook to check if screen is desktop
export const useIsDesktop = () => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
};

// Responsive container component
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'xl',
  padding = 'md'
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-7xl',
    '2xl': 'max-w-none',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-2 sm:px-4',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-6 sm:px-8 lg:px-12'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md'
}) => {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const gridCols = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols['2xl'] && `2xl:grid-cols-${cols['2xl']}`
  ].filter(Boolean).join(' ');

  return (
    <div className={cn(
      'grid',
      gridCols,
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-first responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    xs?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  };
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  size = { xs: 'base', md: 'lg' },
  weight = 'normal',
  align = 'left'
}) => {
  const sizeClasses = [
    size.xs && `text-${size.xs}`,
    size.sm && `sm:text-${size.sm}`,
    size.md && `md:text-${size.md}`,
    size.lg && `lg:text-${size.lg}`
  ].filter(Boolean).join(' ');

  const weightClass = `font-${weight}`;
  const alignClass = `text-${align}`;

  return (
    <div className={cn(sizeClasses, weightClass, alignClass, className)}>
      {children}
    </div>
  );
};

// Responsive spacing component
interface ResponsiveSpacingProps {
  children: React.ReactNode;
  className?: string;
  margin?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
  };
  padding?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
  };
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  className = '',
  margin,
  padding
}) => {
  const marginClasses = margin ? [
    margin.xs && `m-${margin.xs}`,
    margin.sm && `sm:m-${margin.sm}`,
    margin.md && `md:m-${margin.md}`,
    margin.lg && `lg:m-${margin.lg}`
  ].filter(Boolean).join(' ') : '';

  const paddingClasses = padding ? [
    padding.xs && `p-${padding.xs}`,
    padding.sm && `sm:p-${padding.sm}`,
    padding.md && `md:p-${padding.md}`,
    padding.lg && `lg:p-${padding.lg}`
  ].filter(Boolean).join(' ') : '';

  return (
    <div className={cn(marginClasses, paddingClasses, className)}>
      {children}
    </div>
  );
};

// Show/hide components based on breakpoint
interface ShowOnProps {
  children: React.ReactNode;
  breakpoint: Breakpoint | Breakpoint[];
  className?: string;
}

export const ShowOn: React.FC<ShowOnProps> = ({ children, breakpoint, className = '' }) => {
  const breakpoints = Array.isArray(breakpoint) ? breakpoint : [breakpoint];
  
  const showClasses = breakpoints.map(bp => {
    switch (bp) {
      case 'xs': return 'block sm:hidden';
      case 'sm': return 'hidden sm:block md:hidden';
      case 'md': return 'hidden md:block lg:hidden';
      case 'lg': return 'hidden lg:block xl:hidden';
      case 'xl': return 'hidden xl:block 2xl:hidden';
      case '2xl': return 'hidden 2xl:block';
      default: return '';
    }
  }).join(' ');

  return (
    <div className={cn(showClasses, className)}>
      {children}
    </div>
  );
};

export const HideOn: React.FC<ShowOnProps> = ({ children, breakpoint, className = '' }) => {
  const breakpoints = Array.isArray(breakpoint) ? breakpoint : [breakpoint];
  
  const hideClasses = breakpoints.map(bp => {
    switch (bp) {
      case 'xs': return 'hidden sm:block';
      case 'sm': return 'block sm:hidden md:block';
      case 'md': return 'block md:hidden lg:block';
      case 'lg': return 'block lg:hidden xl:block';
      case 'xl': return 'block xl:hidden 2xl:block';
      case '2xl': return 'block 2xl:hidden';
      default: return '';
    }
  }).join(' ');

  return (
    <div className={cn(hideClasses, className)}>
      {children}
    </div>
  );
};

// Mobile navigation drawer
interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}>
        {children}
      </div>
    </>
  );
};

// Responsive image component
interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
  };
  aspectRatio?: 'square' | 'video' | 'photo' | 'wide';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'photo'
}) => {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]'
  };

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};
