import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PROPERTY_QUERY_KEYS } from './useProperties';
import { AGENT_QUERY_KEYS } from './useAgents';
import { TASK_QUERY_KEYS } from './useTasks';

// Hook to set up realtime subscriptions for automatic data updates
export const useRealtimeSubscriptions = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to properties table changes
    const propertiesChannel = supabase
      .channel('properties-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'properties',
        },
        (payload) => {
          console.log('Properties table changed:', payload);

          // Invalidate all property-related queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.all });

          // If it's a specific property update, invalidate that property's detail query
          if (payload.eventType === 'UPDATE' && payload.new?.id) {
            queryClient.invalidateQueries({
              queryKey: PROPERTY_QUERY_KEYS.detail(payload.new.id)
            });
          }

          // If we know which agent the property belongs to, invalidate their property queries
          if (payload.new?.agent_id || payload.old?.agent_id) {
            const agentId = payload.new?.agent_id || payload.old?.agent_id;
            queryClient.invalidateQueries({
              queryKey: ['agent-properties', agentId]
            });
          }
        }
      )
      .subscribe();

    // Subscribe to property_images table changes
    const propertyImagesChannel = supabase
      .channel('property-images-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_images',
        },
        (payload) => {
          console.log('Property images table changed:', payload);
          
          // Invalidate property queries since images are part of property data
          queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.all });
          
          // If we know which property the image belongs to, invalidate that specific property
          if (payload.new?.property_id || payload.old?.property_id) {
            const propertyId = payload.new?.property_id || payload.old?.property_id;
            queryClient.invalidateQueries({ 
              queryKey: PROPERTY_QUERY_KEYS.detail(propertyId) 
            });
          }
        }
      )
      .subscribe();

    // Subscribe to agents table changes
    const agentsChannel = supabase
      .channel('agents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
        },
        (payload) => {
          console.log('Agents table changed:', payload);
          
          // Invalidate all agent-related queries
          queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.all });
          queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
          
          // If it's a specific agent update, invalidate that agent's detail query
          if (payload.eventType === 'UPDATE' && payload.new?.id) {
            queryClient.invalidateQueries({ 
              queryKey: AGENT_QUERY_KEYS.detail(payload.new.id) 
            });
          }
        }
      )
      .subscribe();

    // Subscribe to users table changes (affects agents)
    const usersChannel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          console.log('Users table changed:', payload);
          
          // Invalidate agent queries since agents reference users
          queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.all });
          queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.lists() });
        }
      )
      .subscribe();

    // Subscribe to tasks table changes
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          console.log('Tasks table changed:', payload);

          // Invalidate all task-related queries
          queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });

          // If we know which agent the task belongs to, invalidate that agent's tasks
          if (payload.new?.agent_id || payload.old?.agent_id) {
            const agentId = payload.new?.agent_id || payload.old?.agent_id;
            queryClient.invalidateQueries({
              queryKey: TASK_QUERY_KEYS.byAgent(agentId)
            });
            // Also invalidate agent-specific task queries
            queryClient.invalidateQueries({
              queryKey: ['agent-tasks', agentId]
            });
          }
        }
      )
      .subscribe();

    // Subscribe to messages table changes
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          console.log('Messages table changed:', payload);

          // Invalidate message-related queries
          queryClient.invalidateQueries({ queryKey: ['messages'] });

          // If we know the sender or receiver, invalidate their specific message queries
          if (payload.new?.sender_id || payload.old?.sender_id) {
            const senderId = payload.new?.sender_id || payload.old?.sender_id;
            queryClient.invalidateQueries({
              queryKey: ['messages', 'user', senderId]
            });
          }

          if (payload.new?.receiver_id || payload.old?.receiver_id) {
            const receiverId = payload.new?.receiver_id || payload.old?.receiver_id;
            queryClient.invalidateQueries({
              queryKey: ['messages', 'user', receiverId]
            });
          }

          // Invalidate conversation-specific queries
          if (payload.new?.sender_id && payload.new?.receiver_id) {
            queryClient.invalidateQueries({
              queryKey: ['messages', 'conversation', payload.new.sender_id, payload.new.receiver_id]
            });
            queryClient.invalidateQueries({
              queryKey: ['messages', 'conversation', payload.new.receiver_id, payload.new.sender_id]
            });
          }
        }
      )
      .subscribe();

    // Cleanup function to unsubscribe from all channels
    return () => {
      supabase.removeChannel(propertiesChannel);
      supabase.removeChannel(propertyImagesChannel);
      supabase.removeChannel(agentsChannel);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [queryClient]);

  return null; // This hook doesn't return anything, it just sets up subscriptions
};

// Hook for manual data refresh (useful for pull-to-refresh functionality)
export const useManualRefresh = () => {
  const queryClient = useQueryClient();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
    queryClient.invalidateQueries({ queryKey: ['agent-tasks'] });
  };

  const refreshProperties = () => {
    queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.all });
  };

  const refreshAgents = () => {
    queryClient.invalidateQueries({ queryKey: AGENT_QUERY_KEYS.all });
  };

  const refreshTasks = () => {
    queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
  };

  const refreshMessages = () => {
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  };

  const refreshAgentData = (agentId: number) => {
    queryClient.invalidateQueries({ queryKey: ['agent-properties', agentId] });
    queryClient.invalidateQueries({ queryKey: ['agent-tasks', agentId] });
  };

  return {
    refreshAll,
    refreshProperties,
    refreshAgents,
    refreshTasks,
    refreshMessages,
    refreshAgentData,
  };
};
