import React from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useManualRefresh, useIsFetching } from '@/hooks/useData';

interface DataStatusProps {
  lastUpdated?: number;
  isStale?: boolean;
  isFetching?: boolean;
  className?: string;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

export const DataStatus: React.FC<DataStatusProps> = ({
  lastUpdated,
  isStale,
  isFetching,
  className,
  showRefreshButton = true,
  onRefresh
}) => {
  const { refreshAll } = useManualRefresh();
  const globalIsFetching = useIsFetching();

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      refreshAll();
    }
  };

  const formatLastUpdated = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  const isCurrentlyFetching = isFetching || globalIsFetching;

  return (
    <div className={cn('flex items-center gap-2 text-sm text-gray-600', className)}>
      {/* Connection status */}
      <div className="flex items-center gap-1">
        {navigator.onLine ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
      </div>

      {/* Last updated */}
      <span className={cn(
        'text-xs',
        isStale && 'text-orange-500',
        !isStale && 'text-green-600'
      )}>
        Updated {formatLastUpdated(lastUpdated)}
      </span>

      {/* Fetching indicator */}
      {isCurrentlyFetching && (
        <div className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
          <span className="text-xs text-blue-500">Updating...</span>
        </div>
      )}

      {/* Manual refresh button */}
      {showRefreshButton && !isCurrentlyFetching && (
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      )}
    </div>
  );
};

interface GlobalDataStatusProps {
  className?: string;
}

export const GlobalDataStatus: React.FC<GlobalDataStatusProps> = ({ className }) => {
  const isFetching = useIsFetching();
  
  if (!isFetching) return null;

  return (
    <div className={cn(
      'fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2',
      className
    )}>
      <RefreshCw className="h-4 w-4 animate-spin" />
      <span className="text-sm">Updating data...</span>
    </div>
  );
};
