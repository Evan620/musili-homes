import { Property } from '@/types';
import { getProperties, getPropertyById, getFeaturedProperties } from '@/services/database';

// Export async functions that fetch from database
export const properties: Property[] = [];

// Initialize data
getProperties().then(data => {
  properties.length = 0;
  properties.push(...data);
});

// Keep the original function names for backward compatibility
export { getPropertyById, getFeaturedProperties };
