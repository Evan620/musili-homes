import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Search, 
  Wifi, 
  Server, 
  Shield, 
  Clock,
  FileX,
  UserX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

// Generic Error State Component
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  icon = <AlertTriangle className="h-8 w-8 text-red-500" />,
  actions,
  className = ""
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    <div className="mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 mb-6 max-w-md">
      {description}
    </p>
    {actions && (
      <div className="flex flex-col sm:flex-row gap-3">
        {actions}
      </div>
    )}
  </div>
);

// Network Error
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Connection Problem"
    description="Unable to connect to the server. Please check your internet connection and try again."
    icon={<Wifi className="h-8 w-8 text-red-500" />}
    actions={
      onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )
    }
  />
);

// Server Error
export const ServerError: React.FC<{ onRetry?: () => void; onGoHome?: () => void }> = ({ 
  onRetry, 
  onGoHome 
}) => (
  <ErrorState
    title="Server Error"
    description="The server encountered an error and couldn't complete your request. Please try again later."
    icon={<Server className="h-8 w-8 text-red-500" />}
    actions={
      <>
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
      </>
    }
  />
);

// Not Found Error
export const NotFoundError: React.FC<{ 
  resource?: string; 
  onGoBack?: () => void; 
  onGoHome?: () => void;
}> = ({ 
  resource = "page", 
  onGoBack, 
  onGoHome 
}) => (
  <ErrorState
    title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
    description={`The ${resource} you're looking for doesn't exist or has been moved.`}
    icon={<Search className="h-8 w-8 text-gray-500" />}
    actions={
      <>
        {onGoBack && (
          <Button onClick={onGoBack}>
            Go Back
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
      </>
    }
  />
);

// Permission Error
export const PermissionError: React.FC<{ onLogin?: () => void; onGoHome?: () => void }> = ({ 
  onLogin, 
  onGoHome 
}) => (
  <ErrorState
    title="Access Denied"
    description="You don't have permission to access this resource. Please log in or contact an administrator."
    icon={<Shield className="h-8 w-8 text-yellow-500" />}
    actions={
      <>
        {onLogin && (
          <Button onClick={onLogin}>
            <UserX className="h-4 w-4 mr-2" />
            Log In
          </Button>
        )}
        {onGoHome && (
          <Button variant="outline" onClick={onGoHome}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        )}
      </>
    }
  />
);

// Timeout Error
export const TimeoutError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <ErrorState
    title="Request Timeout"
    description="The request took too long to complete. Please try again."
    icon={<Clock className="h-8 w-8 text-orange-500" />}
    actions={
      onRetry && (
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )
    }
  />
);

// Empty State (not exactly an error, but related)
export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}> = ({
  title = "No data found",
  description = "There's nothing to show here yet.",
  icon = <FileX className="h-8 w-8 text-gray-400" />,
  actions,
  className = ""
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    <div className="mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {title}
    </h3>
    <p className="text-gray-500 mb-6 max-w-md">
      {description}
    </p>
    {actions && (
      <div className="flex flex-col sm:flex-row gap-3">
        {actions}
      </div>
    )}
  </div>
);

// Inline Error Alert
export const InlineError: React.FC<{
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  className?: string;
}> = ({ message, onDismiss, onRetry, className = "" }) => (
  <Alert variant="destructive" className={className}>
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between">
      <span>{message}</span>
      <div className="flex space-x-2 ml-4">
        {onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            ×
          </Button>
        )}
      </div>
    </AlertDescription>
  </Alert>
);

// Form Field Error
export const FieldError: React.FC<{
  message: string;
  className?: string;
}> = ({ message, className = "" }) => (
  <div className={`flex items-center space-x-1 text-sm text-red-600 mt-1 ${className}`}>
    <AlertTriangle className="h-3 w-3" />
    <span>{message}</span>
  </div>
);

// Card Error State
export const CardError: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}> = ({ title = "Error", message, onRetry, className = "" }) => (
  <Card className={`border-red-200 bg-red-50 ${className}`}>
    <CardHeader className="pb-3">
      <CardTitle className="text-red-800 text-sm flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <p className="text-red-700 text-sm mb-3">{message}</p>
      {onRetry && (
        <Button size="sm" onClick={onRetry}>
          <RefreshCw className="h-3 w-3 mr-1" />
          Try Again
        </Button>
      )}
    </CardContent>
  </Card>
);

// Loading Error (for when data fails to load)
export const LoadingError: React.FC<{
  resource?: string;
  onRetry?: () => void;
  className?: string;
}> = ({ resource = "data", onRetry, className = "" }) => (
  <div className={`p-6 text-center ${className}`}>
    <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-3" />
    <h4 className="text-sm font-medium text-gray-900 mb-2">
      Failed to load {resource}
    </h4>
    <p className="text-sm text-gray-600 mb-4">
      There was a problem loading the {resource}. Please try again.
    </p>
    {onRetry && (
      <Button size="sm" onClick={onRetry}>
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    )}
  </div>
);

// Error Hook for consistent error handling
export const useErrorHandler = () => {
  const handleError = (error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error);
    }
    
    // In production, you might want to send to error reporting service
    // Example: Sentry.captureException(error, { tags: { context } });
    
    return errorMessage;
  };

  return { handleError };
};
