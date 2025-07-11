import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'default' | 'luxury' | 'dots';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  variant = 'luxury'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (variant === 'luxury') {
    return (
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-satin-silver border-t-gold-whisper',
            sizeClasses[size]
          )}
        />
        <Sparkles className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold-whisper animate-pulse',
          size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-4 w-4' : 'h-6 w-6'
        )} />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-gold-whisper rounded-full animate-bounce',
              size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  return (
    <Loader2
      className={cn(
        'animate-spin text-gold-whisper',
        sizeClasses[size],
        className
      )}
    />
  );
};

interface LoadingStateProps {
  message?: string;
  className?: string;
  showSpinner?: boolean;
  variant?: 'default' | 'luxury' | 'minimal';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  className,
  showSpinner = true,
  variant = 'luxury'
}) => {
  if (variant === 'luxury') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12', className)}>
        <div className="luxury-card p-8 text-center max-w-md">
          {showSpinner && (
            <div className="mb-6">
              <LoadingSpinner size="lg" variant="luxury" />
            </div>
          )}
          <h3 className="luxury-heading text-xl mb-2">Please Wait</h3>
          <p className="luxury-text">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center gap-3 py-4', className)}>
        {showSpinner && <LoadingSpinner size="sm" variant="dots" />}
        <span className="text-deep-charcoal/70 text-sm">{message}</span>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-8', className)}>
      {showSpinner && <LoadingSpinner className="mb-4" />}
      <div className="text-deep-charcoal">{message}</div>
    </div>
  );
};

interface ErrorStateProps {
  message?: string;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  message = 'Something went wrong', 
  error,
  onRetry,
  className 
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
      <div className="text-red-600 mb-2">{message}</div>
      {error && (
        <div className="text-sm text-gray-600 mb-4">
          {error.message || 'Unknown error occurred'}
        </div>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-gold-whisper text-white rounded hover:bg-gold-whisper/80 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

interface EmptyStateProps {
  message?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No data available',
  description,
  action,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="text-deep-charcoal mb-2">{message}</div>
      {description && (
        <div className="text-sm text-deep-charcoal/70 mb-4">{description}</div>
      )}
      {action}
    </div>
  );
};

// Skeleton loading components
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular'
}) => {
  const baseClasses = 'loading-skeleton';

  const variantClasses = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );
};

// Property card skeleton
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="luxury-card p-0 overflow-hidden">
      <Skeleton className="h-72 rounded-t-xl rounded-b-none" />
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-2/3" />
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-satin-silver/50">
          <div className="flex flex-col items-center space-y-2">
            <Skeleton variant="circular" className="h-8 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Skeleton variant="circular" className="h-8 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Skeleton variant="circular" className="h-8 w-8" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Property grid skeleton
export const PropertyGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
      {Array.from({ length: count }).map((_, index) => (
        <PropertyCardSkeleton key={index} />
      ))}
    </div>
  );
};
