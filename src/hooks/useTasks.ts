import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTasks, getTasksByAgentId, addTask, updateTaskStatus } from '@/services/database';
import { Task } from '@/types';

// Query keys for consistent caching
export const TASK_QUERY_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...TASK_QUERY_KEYS.lists(), { filters }] as const,
  byAgent: (agentId: number) => [...TASK_QUERY_KEYS.all, 'byAgent', agentId] as const,
};

// Hook to get all tasks
export const useTasks = () => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.lists(),
    queryFn: getTasks,
    staleTime: 2 * 60 * 1000, // 2 minutes (tasks change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get tasks by agent ID
export const useTasksByAgent = (agentId: number) => {
  return useQuery({
    queryKey: TASK_QUERY_KEYS.byAgent(agentId),
    queryFn: () => getTasksByAgentId(agentId),
    enabled: !!agentId, // Only run query if agentId is provided
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to invalidate task queries
export const useInvalidateTasks = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.lists() }),
    invalidateByAgent: (agentId: number) => queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.byAgent(agentId) }),
  };
};

// Hook for task mutations
export const useTaskMutations = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateTasks();

  const createTask = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      invalidateAll();
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number; status: string }) => 
      updateTaskStatus(taskId, status),
    onSuccess: () => {
      invalidateAll();
    },
  });

  return {
    createTask,
    updateTask,
  };
};
