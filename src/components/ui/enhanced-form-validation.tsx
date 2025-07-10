import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Enhanced form field error component
interface FieldErrorProps {
  message: string;
  className?: string;
  variant?: 'default' | 'inline' | 'tooltip';
}

export const FieldError: React.FC<FieldErrorProps> = ({
  message,
  className = '',
  variant = 'default'
}) => {
  switch (variant) {
    case 'inline':
      return (
        <div className={cn('flex items-center space-x-1 text-sm text-red-600 mt-1', className)}>
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>{message}</span>
        </div>
      );
    
    case 'tooltip':
      return (
        <div className={cn(
          'absolute z-10 px-2 py-1 text-xs text-white bg-red-600 rounded shadow-lg',
          'transform -translate-y-full -translate-x-1/2 left-1/2 top-0',
          'before:content-[""] before:absolute before:top-full before:left-1/2',
          'before:transform before:-translate-x-1/2 before:border-4',
          'before:border-transparent before:border-t-red-600',
          className
        )}>
          {message}
        </div>
      );
    
    default:
      return (
        <div className={cn('text-sm text-red-600 mt-1', className)}>
          {message}
        </div>
      );
  }
};

// Enhanced form field success component
interface FieldSuccessProps {
  message?: string;
  className?: string;
}

export const FieldSuccess: React.FC<FieldSuccessProps> = ({
  message = 'Valid',
  className = ''
}) => (
  <div className={cn('flex items-center space-x-1 text-sm text-green-600 mt-1', className)}>
    <CheckCircle className="h-3 w-3" />
    <span>{message}</span>
  </div>
);

// Enhanced form field warning component
interface FieldWarningProps {
  message: string;
  className?: string;
}

export const FieldWarning: React.FC<FieldWarningProps> = ({
  message,
  className = ''
}) => (
  <div className={cn('flex items-center space-x-1 text-sm text-yellow-600 mt-1', className)}>
    <Info className="h-3 w-3" />
    <span>{message}</span>
  </div>
);

// Form validation summary
interface ValidationSummaryProps {
  errors: string[];
  warnings?: string[];
  className?: string;
  onDismiss?: () => void;
}

export const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  warnings = [],
  className = '',
  onDismiss
}) => {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-start justify-between">
              <div>
                <strong>Please fix the following errors:</strong>
                <ul className="mt-2 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm">• {error}</li>
                  ))}
                </ul>
              </div>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Warnings:</strong>
            <ul className="mt-2 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-sm">• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Enhanced input wrapper with validation states
interface ValidatedInputWrapperProps {
  children: React.ReactNode;
  error?: string;
  success?: string;
  warning?: string;
  className?: string;
  showValidationIcon?: boolean;
}

export const ValidatedInputWrapper: React.FC<ValidatedInputWrapperProps> = ({
  children,
  error,
  success,
  warning,
  className = '',
  showValidationIcon = true
}) => {
  const getValidationState = () => {
    if (error) return 'error';
    if (warning) return 'warning';
    if (success) return 'success';
    return 'default';
  };

  const validationState = getValidationState();

  const borderClasses = {
    error: 'border-red-500 focus-within:border-red-500 focus-within:ring-red-500',
    warning: 'border-yellow-500 focus-within:border-yellow-500 focus-within:ring-yellow-500',
    success: 'border-green-500 focus-within:border-green-500 focus-within:ring-green-500',
    default: 'border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500'
  };

  const iconClasses = {
    error: 'text-red-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    default: 'text-gray-400'
  };

  const getValidationIcon = () => {
    switch (validationState) {
      case 'error':
        return <AlertTriangle className={cn('h-4 w-4', iconClasses.error)} />;
      case 'warning':
        return <Info className={cn('h-4 w-4', iconClasses.warning)} />;
      case 'success':
        return <CheckCircle className={cn('h-4 w-4', iconClasses.success)} />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <div className={cn(
        'relative rounded-md border transition-colors',
        borderClasses[validationState]
      )}>
        {children}
        {showValidationIcon && validationState !== 'default' && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {getValidationIcon()}
          </div>
        )}
      </div>
      
      {error && <FieldError message={error} />}
      {warning && !error && <FieldWarning message={warning} />}
      {success && !error && !warning && <FieldSuccess message={success} />}
    </div>
  );
};

// Real-time validation feedback
interface RealTimeValidationProps {
  value: string;
  rules: Array<{
    test: (value: string) => boolean;
    message: string;
    type?: 'error' | 'warning' | 'success';
  }>;
  className?: string;
}

export const RealTimeValidation: React.FC<RealTimeValidationProps> = ({
  value,
  rules,
  className = ''
}) => {
  const results = rules.map(rule => ({
    ...rule,
    passed: rule.test(value),
    type: rule.type || 'error'
  }));

  return (
    <div className={cn('space-y-1 text-sm', className)}>
      {results.map((result, index) => (
        <div
          key={index}
          className={cn(
            'flex items-center space-x-2 transition-colors',
            result.passed
              ? 'text-green-600'
              : result.type === 'warning'
              ? 'text-yellow-600'
              : 'text-red-600'
          )}
        >
          {result.passed ? (
            <CheckCircle className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
          <span className={cn(result.passed && 'line-through')}>
            {result.message}
          </span>
        </div>
      ))}
    </div>
  );
};

// Password strength indicator
interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className = ''
}) => {
  const getStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              strength >= level ? strengthColors[strength - 1] : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      <div className="text-sm text-gray-600">
        Password strength: <span className="font-medium">{strengthLabels[strength - 1] || 'Very Weak'}</span>
      </div>
    </div>
  );
};

// Form field character counter
interface CharacterCounterProps {
  current: number;
  max: number;
  className?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  className = ''
}) => {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage > 80;
  const isOverLimit = current > max;

  return (
    <div className={cn('text-sm', className)}>
      <div className="flex justify-between items-center">
        <span className={cn(
          'transition-colors',
          isOverLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-500'
        )}>
          {current}/{max} characters
        </span>
        {isOverLimit && (
          <span className="text-red-600 font-medium">
            {current - max} over limit
          </span>
        )}
      </div>
      <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
        <div
          className={cn(
            'h-1 rounded-full transition-all',
            isOverLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};
