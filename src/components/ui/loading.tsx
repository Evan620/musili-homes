import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-gold-whisper',
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
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  className,
  showSpinner = true 
}) => {
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
