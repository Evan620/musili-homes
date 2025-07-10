import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAgents, getAgentById } from '@/services/database';
import { Agent } from '@/types';

// Query keys for consistent caching
export const AGENT_QUERY_KEYS = {
  all: ['agents'] as const,
  lists: () => [...AGENT_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...AGENT_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...AGENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...AGENT_QUERY_KEYS.details(), id] as const,
};

// Hook to get all agents
export const useAgents = () => {
  return useQuery({
    queryKey: AGENT_QUERY_KEYS.lists(),
    queryFn: getAgents,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to get a single agent by ID
export const useAgent = (id: number) => {
  return useQuery({
    queryKey: AGENT_QUERY_KEYS.detail(id),
    queryFn: () => getAgentById(id),
    enabled: !!id, // Only run query if id is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to invalidate agent queries
export const useInvalidateAgents = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() }),
    invalidateAgent: (id: number) => queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.detail(id) }),
  };
};

// Hook to prefetch agents
export const usePrefetchAgents = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchAgents: () => {
      queryClient.prefetchQuery({
        queryKey: AGENT_QUERY_KEYS.lists(),
        queryFn: getAgents,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchAgent: (id: number) => {
      queryClient.prefetchQuery({
        queryKey: AGENT_QUERY_KEYS.detail(id),
        queryFn: () => getAgentById(id),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
};
