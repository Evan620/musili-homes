import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

// Toast context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Toast>) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast provider
interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  maxToasts = 5,
  defaultDuration = 5000
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'loading' ? undefined : defaultDuration)
    };

    setToasts(prev => {
      const updated = [newToast, ...prev];
      return updated.slice(0, maxToasts);
    });

    // Auto-remove toast after duration (unless persistent or loading)
    if (newToast.duration && !newToast.persistent && newToast.type !== 'loading') {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [maxToasts, defaultDuration]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast, clearAll }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, updateToast, clearAll } = context;

  // Convenience methods
  const toast = {
    success: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'success', title, description, ...options }),
    
    error: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'error', title, description, ...options }),
    
    warning: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'warning', title, description, ...options }),
    
    info: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'info', title, description, ...options }),
    
    loading: (title: string, description?: string, options?: Partial<Toast>) =>
      addToast({ type: 'loading', title, description, persistent: true, ...options }),
    
    promise: async <T,>(
      promise: Promise<T>,
      {
        loading: loadingMessage,
        success: successMessage,
        error: errorMessage
      }: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: any) => string);
      }
    ) => {
      const toastId = addToast({
        type: 'loading',
        title: loadingMessage,
        persistent: true
      });

      try {
        const result = await promise;
        updateToast(toastId, {
          type: 'success',
          title: typeof successMessage === 'function' ? successMessage(result) : successMessage,
          persistent: false,
          duration: 5000
        });
        return result;
      } catch (error) {
        updateToast(toastId, {
          type: 'error',
          title: typeof errorMessage === 'function' ? errorMessage(error) : errorMessage,
          persistent: false,
          duration: 5000
        });
        throw error;
      }
    },

    dismiss: removeToast,
    dismissAll: clearAll
  };

  return toast;
};

// Toast container component
const ToastContainer: React.FC = () => {
  const { toasts } = useContext(ToastContext)!;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// Individual toast item
interface ToastItemProps {
  toast: Toast;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useContext(ToastContext)!;
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
        return 'border-l-blue-500';
      case 'loading':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-lg p-4 border-l-4',
        'transform transition-all duration-300 ease-in-out',
        getBorderColor(),
        isVisible && !isExiting
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900">
            {toast.title}
          </h4>
          {toast.description && (
            <p className="mt-1 text-sm text-gray-600">
              {toast.description}
            </p>
          )}
          {toast.action && (
            <div className="mt-3">
              <button
                onClick={toast.action.onClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        
        {toast.type !== 'loading' && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// Preset toast configurations for common actions
export const toastPresets = {
  // Property actions
  propertyCreated: (propertyTitle: string) => ({
    type: 'success' as const,
    title: 'Property Created',
    description: `${propertyTitle} has been successfully created.`
  }),

  propertyUpdated: (propertyTitle: string) => ({
    type: 'success' as const,
    title: 'Property Updated',
    description: `${propertyTitle} has been successfully updated.`
  }),

  propertyDeleted: (propertyTitle: string) => ({
    type: 'success' as const,
    title: 'Property Deleted',
    description: `${propertyTitle} has been successfully deleted.`
  }),

  // User actions
  loginSuccess: (userName: string) => ({
    type: 'success' as const,
    title: 'Welcome back!',
    description: `Successfully logged in as ${userName}.`
  }),

  logoutSuccess: () => ({
    type: 'info' as const,
    title: 'Logged out',
    description: 'You have been successfully logged out.'
  }),

  // File operations
  fileUploaded: (fileName: string) => ({
    type: 'success' as const,
    title: 'File Uploaded',
    description: `${fileName} has been successfully uploaded.`
  }),

  fileUploadError: (fileName: string) => ({
    type: 'error' as const,
    title: 'Upload Failed',
    description: `Failed to upload ${fileName}. Please try again.`
  }),

  // Form validation
  formSaved: () => ({
    type: 'success' as const,
    title: 'Changes Saved',
    description: 'Your changes have been successfully saved.'
  }),

  formError: (message?: string) => ({
    type: 'error' as const,
    title: 'Validation Error',
    description: message || 'Please check the form for errors and try again.'
  }),

  // Network errors
  networkError: () => ({
    type: 'error' as const,
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    action: {
      label: 'Retry',
      onClick: () => window.location.reload()
    }
  }),

  // Generic messages
  operationSuccess: (operation: string) => ({
    type: 'success' as const,
    title: 'Success',
    description: `${operation} completed successfully.`
  }),

  operationError: (operation: string, error?: string) => ({
    type: 'error' as const,
    title: 'Error',
    description: error || `Failed to ${operation.toLowerCase()}. Please try again.`
  })
};
