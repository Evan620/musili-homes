// Re-export all data hooks for easy importing
export * from './useProperties';
export * from './useAgents';
export * from './useTasks';
export * from './useRealtime';

// Combined hook for common data operations
import { useProperties, useFeaturedProperties } from './useProperties';
import { useAgents } from './useAgents';
import { useTasks } from './useTasks';
import { useManualRefresh } from './useRealtime';

// Hook that provides all commonly used data with loading states
export const useAppData = () => {
  const properties = useProperties();
  const featuredProperties = useFeaturedProperties();
  const agents = useAgents();
  const tasks = useTasks();
  const refresh = useManualRefresh();

  const isLoading = properties.isLoading || featuredProperties.isLoading || agents.isLoading || tasks.isLoading;
  const isError = properties.isError || featuredProperties.isError || agents.isError || tasks.isError;
  const error = properties.error || featuredProperties.error || agents.error || tasks.error;

  return {
    // Data
    properties: properties.data || [],
    featuredProperties: featuredProperties.data || [],
    agents: agents.data || [],
    tasks: tasks.data || [],
    
    // Loading states
    isLoading,
    isError,
    error,
    
    // Individual loading states
    propertiesLoading: properties.isLoading,
    featuredPropertiesLoading: featuredProperties.isLoading,
    agentsLoading: agents.isLoading,
    tasksLoading: tasks.isLoading,
    
    // Individual error states
    propertiesError: properties.isError,
    featuredPropertiesError: featuredProperties.isError,
    agentsError: agents.isError,
    tasksError: tasks.isError,
    
    // Refresh functions
    refresh,
    
    // Individual refetch functions
    refetchProperties: properties.refetch,
    refetchFeaturedProperties: featuredProperties.refetch,
    refetchAgents: agents.refetch,
    refetchTasks: tasks.refetch,
  };
};

// Hook for checking if any data is currently being fetched
export const useIsFetching = () => {
  const properties = useProperties();
  const featuredProperties = useFeaturedProperties();
  const agents = useAgents();
  const tasks = useTasks();

  return properties.isFetching || featuredProperties.isFetching || agents.isFetching || tasks.isFetching;
};

// Hook for getting data freshness information
export const useDataFreshness = () => {
  const properties = useProperties();
  const featuredProperties = useFeaturedProperties();
  const agents = useAgents();
  const tasks = useTasks();

  return {
    properties: {
      lastUpdated: properties.dataUpdatedAt,
      isStale: properties.isStale,
      isFetching: properties.isFetching,
    },
    featuredProperties: {
      lastUpdated: featuredProperties.dataUpdatedAt,
      isStale: featuredProperties.isStale,
      isFetching: featuredProperties.isFetching,
    },
    agents: {
      lastUpdated: agents.dataUpdatedAt,
      isStale: agents.isStale,
      isFetching: agents.isFetching,
    },
    tasks: {
      lastUpdated: tasks.dataUpdatedAt,
      isStale: tasks.isStale,
      isFetching: tasks.isFetching,
    },
  };
};
