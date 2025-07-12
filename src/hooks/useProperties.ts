import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProperties, getFeaturedProperties, getPropertyById } from '@/services/database';
import { Property, PropertyFormData } from '@/types';

// Query keys for consistent caching
export const PROPERTY_QUERY_KEYS = {
  all: ['properties'] as const,
  lists: () => [...PROPERTY_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...PROPERTY_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...PROPERTY_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PROPERTY_QUERY_KEYS.details(), id] as const,
  featured: () => [...PROPERTY_QUERY_KEYS.all, 'featured'] as const,
};

// Hook to get all properties
export const useProperties = () => {
  return useQuery({
    queryKey: PROPERTY_QUERY_KEYS.lists(),
    queryFn: getProperties,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchInterval: false, // No background refetch
    retry: 3, // Retry 3 times on failure
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

// Hook to get featured properties
export const useFeaturedProperties = () => {
  const query = useQuery({
    queryKey: PROPERTY_QUERY_KEYS.featured(),
    queryFn: getFeaturedProperties,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchInterval: false,
    retry: 3, // Retry 3 times
    retryDelay: 1000, // 1 second delay
  });

  return query;
};

// Hook to get a single property by ID
export const useProperty = (id: number) => {
  return useQuery({
    queryKey: PROPERTY_QUERY_KEYS.detail(id),
    queryFn: () => getPropertyById(id),
    enabled: !!id, // Only run query if id is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus
    refetchInterval: false, // No background refetch
  });
};

// Hook to invalidate property queries (useful after mutations)
export const useInvalidateProperties = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.lists() }),
    invalidateFeatured: () => queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.featured() }),
    invalidateProperty: (id: number) => queryClient.invalidateQueries({ queryKey: PROPERTY_QUERY_KEYS.detail(id) }),
  };
};

// Hook to prefetch properties (useful for performance)
export const usePrefetchProperties = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchProperties: () => {
      queryClient.prefetchQuery({
        queryKey: PROPERTY_QUERY_KEYS.lists(),
        queryFn: getProperties,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchFeatured: () => {
      queryClient.prefetchQuery({
        queryKey: PROPERTY_QUERY_KEYS.featured(),
        queryFn: getFeaturedProperties,
        staleTime: 5 * 60 * 1000,
      });
    },
    prefetchProperty: (id: number) => {
      queryClient.prefetchQuery({
        queryKey: PROPERTY_QUERY_KEYS.detail(id),
        queryFn: () => getPropertyById(id),
        staleTime: 5 * 60 * 1000,
      });
    },
  };
};

// Hook for property mutations (create, update, delete)
export const usePropertyMutations = () => {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateProperties();

  const createProperty = useMutation({
    mutationFn: async (data: { propertyData: PropertyFormData; imageUrls?: string[] }) => {
      const { createProperty } = await import('@/services/database');
      return createProperty(data.propertyData, data.imageUrls || []);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all property-related queries across the entire app
        invalidateAll();
        queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
        queryClient.invalidateQueries({ queryKey: ['featured-properties'] });
        return result.property;
      } else {
        throw new Error(result.error || 'Failed to create property');
      }
    },
  });

  const updateProperty = useMutation({
    mutationFn: async (data: {
      propertyId: number;
      propertyData: Partial<Omit<Property, 'id' | 'createdAt'>>;
      imageUrls?: string[]
    }) => {
      const { updateProperty } = await import('@/services/database');
      return updateProperty(data.propertyId.toString(), data.propertyData, data.imageUrls);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all property-related queries across the entire app
        invalidateAll();
        queryClient.invalidateQueries({ queryKey: ['agent-properties'] });
        queryClient.invalidateQueries({ queryKey: ['featured-properties'] });
        return result.property;
      } else {
        throw new Error(result.error || 'Failed to update property');
      }
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (propertyId: number) => {
      const { deleteProperty } = await import('@/services/database');
      return deleteProperty(propertyId);
    },
    onSuccess: (result) => {
      if (result.success) {
        invalidateAll();
      } else {
        throw new Error(result.error || 'Failed to delete property');
      }
    },
  });

  return {
    createProperty,
    updateProperty,
    deleteProperty
  };
};
