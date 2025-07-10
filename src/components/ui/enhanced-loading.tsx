import React from 'react';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Enhanced Loading State with different variants
interface EnhancedLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  className?: string;
  fullScreen?: boolean;
}

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'spinner',
  className = '',
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />;
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-blue-600 rounded-full animate-bounce',
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
                )}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'pulse':
        return (
          <div className={cn(
            'bg-blue-600 rounded-full animate-pulse',
            sizeClasses[size]
          )} />
        );
      
      case 'skeleton':
        return (
          <div className="space-y-3 w-full max-w-sm">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        );
      
      default:
        return <Loader2 className={cn('animate-spin text-blue-600', sizeClasses[size])} />;
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      fullScreen ? 'min-h-screen' : 'py-8',
      className
    )}>
      {renderLoader()}
      {message && variant !== 'skeleton' && (
        <p className={cn('mt-3 text-gray-600 text-center', textSizeClasses[size])}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Progress Loading State
interface ProgressLoadingProps {
  progress: number;
  message?: string;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress,
  message = 'Loading...',
  className = '',
  showPercentage = true
}) => (
  <div className={cn('space-y-3', className)}>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{message}</span>
      {showPercentage && (
        <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
      )}
    </div>
    <Progress value={progress} className="h-2" />
  </div>
);

// Card Loading State
interface CardLoadingProps {
  title?: string;
  message?: string;
  className?: string;
  variant?: 'default' | 'compact';
}

export const CardLoading: React.FC<CardLoadingProps> = ({
  title = 'Loading',
  message = 'Please wait while we load your data...',
  className = '',
  variant = 'default'
}) => (
  <Card className={cn('', className)}>
    <CardContent className={variant === 'compact' ? 'p-4' : 'p-6'}>
      <div className="flex items-center space-x-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600 flex-shrink-0" />
        <div className="min-w-0">
          <h4 className="font-medium text-gray-900 truncate">{title}</h4>
          {variant === 'default' && (
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Inline Loading State
interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
  className?: string;
  hideText?: boolean;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = 'Loading...',
  size = 'sm',
  className = '',
  hideText = false
}) => (
  <div className={cn('flex items-center space-x-2', className)}>
    <Loader2 className={cn(
      'animate-spin text-blue-600 flex-shrink-0',
      size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    )} />
    {!hideText && (
      <span className={cn(
        'text-gray-600',
        size === 'sm' ? 'text-sm' : 'text-base'
      )}>
        {message}
      </span>
    )}
  </div>
);

// Button Loading State
interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  loadingText,
  className = '',
  disabled,
  ...props
}) => (
  <Button
    disabled={loading || disabled}
    className={cn('relative', className)}
    {...props}
  >
    {loading && (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    )}
    {loading ? (loadingText || 'Loading...') : children}
  </Button>
);

// Status Loading with different states
interface StatusLoadingProps {
  status: 'loading' | 'success' | 'error' | 'info';
  message: string;
  className?: string;
  onRetry?: () => void;
}

export const StatusLoading: React.FC<StatusLoadingProps> = ({
  status,
  message,
  className = '',
  onRetry
}) => {
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className={cn('flex items-center space-x-3 p-4 rounded-lg border', className)}>
      {getIcon()}
      <div className="flex-1">
        <p className={cn('text-sm font-medium', getTextColor())}>{message}</p>
      </div>
      {status === 'error' && onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};

// Table Loading State
interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({
  rows = 5,
  columns = 4,
  className = ''
}) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="h-4 bg-gray-200 rounded animate-pulse flex-1"
            style={{ animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s` }}
          />
        ))}
      </div>
    ))}
  </div>
);

// List Loading State
interface ListLoadingProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export const ListLoading: React.FC<ListLoadingProps> = ({
  items = 3,
  showAvatar = true,
  className = ''
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4">
        {showAvatar && (
          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Form Loading State
interface FormLoadingProps {
  fields?: number;
  className?: string;
}

export const FormLoading: React.FC<FormLoadingProps> = ({
  fields = 4,
  className = ''
}) => (
  <div className={cn('space-y-6', className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
        <div className="h-10 bg-gray-200 rounded animate-pulse w-full" />
      </div>
    ))}
    <div className="flex justify-end space-x-2">
      <div className="h-10 bg-gray-200 rounded animate-pulse w-20" />
      <div className="h-10 bg-gray-200 rounded animate-pulse w-24" />
    </div>
  </div>
);
