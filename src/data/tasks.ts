import { Task } from '@/types';
import { getTasks, getTasksByAgentId, addTask, updateTaskStatus } from '@/services/database';

// Export async functions that fetch from database
export const tasks: Task[] = [];

// Initialize data
getTasks().then(data => {
  tasks.length = 0;
  tasks.push(...data);
});

// Keep original function exports for compatibility
export { getTasksByAgentId, addTask, updateTaskStatus };
