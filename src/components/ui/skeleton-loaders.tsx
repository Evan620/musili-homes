import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Property Card Skeleton
export const PropertyCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn("overflow-hidden", className)}>
    <div className="relative">
      <Skeleton className="h-48 w-full" />
      <div className="absolute top-2 left-2">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="absolute top-2 right-2">
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
    <CardContent className="p-4">
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Property Grid Skeleton
export const PropertyGridSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 6, 
  className 
}) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <PropertyCardSkeleton key={index} />
    ))}
  </div>
);

// Agent Card Skeleton
export const AgentCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn("text-center", className)}>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-20 w-20 rounded-full mx-auto" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
        <div className="flex justify-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number; className?: string }> = ({ 
  columns = 5, 
  className 
}) => (
  <tr className={cn("border-b", className)}>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="py-3 px-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Table Skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  showHeader?: boolean;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 5, 
  showHeader = true,
  className 
}) => (
  <div className={cn("overflow-x-auto", className)}>
    <table className="w-full">
      {showHeader && (
        <thead>
          <tr className="border-b">
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="text-left py-3 px-4">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowSkeleton key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({ 
  fields = 6, 
  className 
}) => (
  <div className={cn("space-y-6", className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// Dashboard Stats Skeleton
export const DashboardStatsSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 4, 
  className 
}) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Navigation Skeleton
export const NavigationSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className 
}) => (
  <nav className={cn("space-y-2", className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-24" />
      </div>
    ))}
  </nav>
);

// Search Bar Skeleton
export const SearchBarSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex space-x-2", className)}>
    <Skeleton className="h-10 flex-1" />
    <Skeleton className="h-10 w-24" />
  </div>
);

// Filter Panel Skeleton
export const FilterPanelSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn("", className)}>
    <CardHeader>
      <Skeleton className="h-6 w-20" />
    </CardHeader>
    <CardContent className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

// Message/Chat Skeleton
export const MessageSkeleton: React.FC<{ isOwn?: boolean; className?: string }> = ({ 
  isOwn = false, 
  className 
}) => (
  <div className={cn("flex", isOwn ? "justify-end" : "justify-start", className)}>
    <div className={cn("max-w-xs space-y-2", isOwn ? "items-end" : "items-start")}>
      {!isOwn && <Skeleton className="h-8 w-8 rounded-full" />}
      <div className={cn("p-3 rounded-lg", isOwn ? "bg-blue-100" : "bg-gray-100")}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24 mt-1" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

// List Item Skeleton
export const ListItemSkeleton: React.FC<{ 
  showAvatar?: boolean; 
  showActions?: boolean;
  className?: string;
}> = ({ 
  showAvatar = true, 
  showActions = true,
  className 
}) => (
  <div className={cn("flex items-center space-x-4 p-4 border-b", className)}>
    {showAvatar && <Skeleton className="h-12 w-12 rounded-full" />}
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    {showActions && (
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
      </div>
    )}
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton: React.FC<{ 
  showBreadcrumb?: boolean;
  showActions?: boolean;
  className?: string;
}> = ({ 
  showBreadcrumb = true, 
  showActions = true,
  className 
}) => (
  <div className={cn("space-y-4", className)}>
    {showBreadcrumb && (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <span>/</span>
        <Skeleton className="h-4 w-20" />
      </div>
    )}
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {showActions && (
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      )}
    </div>
  </div>
);

// Generic Content Skeleton
export const ContentSkeleton: React.FC<{ 
  lines?: number;
  className?: string;
}> = ({ 
  lines = 3,
  className 
}) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index} 
        className={cn(
          "h-4",
          index === lines - 1 ? "w-2/3" : "w-full"
        )} 
      />
    ))}
  </div>
);
