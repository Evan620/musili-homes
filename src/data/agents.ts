import { Agent, Admin, User } from '@/types';
import { getAgents, getAllUsers, getUserByEmail } from '@/services/database';

// Export async functions that fetch from database
export const agents: Agent[] = [];
export const admins: Admin[] = [];

// Initialize data
getAgents().then(data => {
  agents.length = 0;
  agents.push(...data);
});

getAllUsers().then(data => {
  const adminUsers = data.filter(user => user.role === 'admin');
  admins.length = 0;
  admins.push(...adminUsers as Admin[]);
});

// Keep original function exports for compatibility
export { getAllUsers, getUserByEmail };
