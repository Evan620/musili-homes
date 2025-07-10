import React from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Search, 
  Plus, 
  Upload, 
  Filter,
  MessageSquare,
  Calendar,
  Image,
  Mail,
  Settings,
  Database,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Base empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  };

  const iconSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: { title: 'text-base', description: 'text-sm' },
    md: { title: 'text-lg', description: 'text-base' },
    lg: { title: 'text-xl', description: 'text-lg' }
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      sizeClasses[size],
      className
    )}>
      {icon && (
        <div className={cn(
          'text-gray-400 mb-4',
          iconSizeClasses[size]
        )}>
          {React.cloneElement(icon as React.ReactElement, {
            className: cn(iconSizeClasses[size], 'text-gray-400')
          })}
        </div>
      )}
      
      <h3 className={cn(
        'font-semibold text-gray-900 mb-2',
        textSizeClasses[size].title
      )}>
        {title}
      </h3>
      
      <p className={cn(
        'text-gray-600 mb-6 max-w-md',
        textSizeClasses[size].description
      )}>
        {description}
      </p>
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Properties empty state
export const PropertiesEmptyState: React.FC<{
  onAddProperty?: () => void;
  onImportProperties?: () => void;
  className?: string;
}> = ({ onAddProperty, onImportProperties, className }) => (
  <EmptyState
    icon={<Home />}
    title="No properties found"
    description="Get started by adding your first property or importing existing properties from a file."
    action={onAddProperty ? {
      label: "Add Property",
      onClick: onAddProperty
    } : undefined}
    secondaryAction={onImportProperties ? {
      label: "Import Properties",
      onClick: onImportProperties
    } : undefined}
    className={className}
  />
);

// Agents empty state
export const AgentsEmptyState: React.FC<{
  onAddAgent?: () => void;
  className?: string;
}> = ({ onAddAgent, className }) => (
  <EmptyState
    icon={<Users />}
    title="No agents found"
    description="Add agents to your team to start managing properties and client relationships."
    action={onAddAgent ? {
      label: "Add Agent",
      onClick: onAddAgent
    } : undefined}
    className={className}
  />
);

// Search results empty state
export const SearchEmptyState: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
  className?: string;
}> = ({ searchTerm, onClearSearch, className }) => (
  <EmptyState
    icon={<Search />}
    title="No results found"
    description={searchTerm 
      ? `No results found for "${searchTerm}". Try adjusting your search terms or filters.`
      : "No results found. Try adjusting your search terms or filters."
    }
    action={onClearSearch ? {
      label: "Clear Search",
      onClick: onClearSearch,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Filtered results empty state
export const FilteredEmptyState: React.FC<{
  onClearFilters?: () => void;
  className?: string;
}> = ({ onClearFilters, className }) => (
  <EmptyState
    icon={<Filter />}
    title="No matches found"
    description="No items match your current filters. Try adjusting or clearing your filters to see more results."
    action={onClearFilters ? {
      label: "Clear Filters",
      onClick: onClearFilters,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Messages empty state
export const MessagesEmptyState: React.FC<{
  onSendMessage?: () => void;
  className?: string;
}> = ({ onSendMessage, className }) => (
  <EmptyState
    icon={<MessageSquare />}
    title="No messages yet"
    description="Start a conversation by sending your first message."
    action={onSendMessage ? {
      label: "Send Message",
      onClick: onSendMessage
    } : undefined}
    className={className}
    size="sm"
  />
);

// Tasks empty state
export const TasksEmptyState: React.FC<{
  onCreateTask?: () => void;
  className?: string;
}> = ({ onCreateTask, className }) => (
  <EmptyState
    icon={<Calendar />}
    title="No tasks assigned"
    description="You're all caught up! No tasks are currently assigned to you."
    action={onCreateTask ? {
      label: "Create Task",
      onClick: onCreateTask
    } : undefined}
    className={className}
  />
);

// Images empty state
export const ImagesEmptyState: React.FC<{
  onUploadImages?: () => void;
  className?: string;
}> = ({ onUploadImages, className }) => (
  <EmptyState
    icon={<Image />}
    title="No images uploaded"
    description="Upload images to showcase this property to potential clients."
    action={onUploadImages ? {
      label: "Upload Images",
      onClick: onUploadImages
    } : undefined}
    className={className}
    size="sm"
  />
);

// Documents empty state
export const DocumentsEmptyState: React.FC<{
  onUploadDocument?: () => void;
  className?: string;
}> = ({ onUploadDocument, className }) => (
  <EmptyState
    icon={<FileText />}
    title="No documents found"
    description="Upload documents like contracts, certificates, or property details."
    action={onUploadDocument ? {
      label: "Upload Document",
      onClick: onUploadDocument
    } : undefined}
    className={className}
  />
);

// Email templates empty state
export const EmailTemplatesEmptyState: React.FC<{
  onCreateTemplate?: () => void;
  className?: string;
}> = ({ onCreateTemplate, className }) => (
  <EmptyState
    icon={<Mail />}
    title="No email templates"
    description="Create reusable email templates to streamline your communication with clients."
    action={onCreateTemplate ? {
      label: "Create Template",
      onClick: onCreateTemplate
    } : undefined}
    className={className}
  />
);

// Settings empty state
export const SettingsEmptyState: React.FC<{
  onConfigure?: () => void;
  className?: string;
}> = ({ onConfigure, className }) => (
  <EmptyState
    icon={<Settings />}
    title="No configuration found"
    description="Configure your settings to customize your experience."
    action={onConfigure ? {
      label: "Configure Settings",
      onClick: onConfigure
    } : undefined}
    className={className}
  />
);

// Data empty state (for tables, lists, etc.)
export const DataEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRefresh?: () => void;
  className?: string;
}> = ({ 
  title = "No data available",
  description = "There's no data to display at the moment.",
  onRefresh,
  className 
}) => (
  <EmptyState
    icon={<Database />}
    title={title}
    description={description}
    action={onRefresh ? {
      label: "Refresh",
      onClick: onRefresh,
      variant: "outline"
    } : undefined}
    className={className}
  />
);

// Error empty state
export const ErrorEmptyState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
  className?: string;
}> = ({ 
  title = "Something went wrong",
  description = "We encountered an error while loading this content.",
  onRetry,
  onGoBack,
  className 
}) => (
  <EmptyState
    icon={<AlertCircle />}
    title={title}
    description={description}
    action={onRetry ? {
      label: "Try Again",
      onClick: onRetry
    } : undefined}
    secondaryAction={onGoBack ? {
      label: "Go Back",
      onClick: onGoBack
    } : undefined}
    className={className}
  />
);

// Card-based empty state
interface CardEmptyStateProps extends EmptyStateProps {
  cardClassName?: string;
}

export const CardEmptyState: React.FC<CardEmptyStateProps> = ({
  cardClassName = '',
  ...props
}) => (
  <Card className={cn('border-dashed border-2 border-gray-300', cardClassName)}>
    <CardContent className="p-0">
      <EmptyState {...props} />
    </CardContent>
  </Card>
);

// Inline empty state (for smaller spaces)
interface InlineEmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const InlineEmptyState: React.FC<InlineEmptyStateProps> = ({
  icon,
  message,
  action,
  className = ''
}) => (
  <div className={cn(
    'flex items-center justify-center space-x-3 py-6 text-gray-500',
    className
  )}>
    {icon && (
      <div className="text-gray-400">
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-5 w-5'
        })}
      </div>
    )}
    <span className="text-sm">{message}</span>
    {action && (
      <Button
        size="sm"
        variant="ghost"
        onClick={action.onClick}
        className="text-blue-600 hover:text-blue-700"
      >
        {action.label}
      </Button>
    )}
  </div>
);
