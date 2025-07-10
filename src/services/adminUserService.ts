import { supabase, supabaseAuth } from '@/integrations/supabase/client';
import { User } from '@/types';

export interface CreateAgentRequest {
  name: string;
  email: string;
  phone?: string;
  bio: string;
}

export interface CreateAgentResponse {
  success: boolean;
  agent?: User;
  credentials?: {
    email: string;
    password: string;
  };
  error?: string;
}

/**
 * Admin-only service for creating new agent accounts
 * This function should only be called by authenticated admins
 */
export const createAgentAccount = async (
  agentData: CreateAgentRequest,
  adminUserId: string
): Promise<CreateAgentResponse> => {
  try {
    // Defensive check for valid adminUserId
    if (!adminUserId) {
      return {
        success: false,
        error: 'Invalid admin user ID. Please ensure you are logged in as an admin.'
      };
    }
    // First, verify that the current user is an admin (use auth_id as UUID)
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', adminUserId)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminCheck) {
      console.error('Admin verification failed:', adminError);
      return {
        success: false,
        error: 'Unauthorized: Only admins can create agent accounts'
      };
    }

    // Check if email already exists
    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', agentData.email)
        .single();

      if (existingUser && !checkError) {
        return {
          success: false,
          error: 'An account with this email already exists'
        };
      }
    } catch (emailCheckError) {
      console.log('Email check failed due to RLS, proceeding with creation');
    }

    // Generate a secure password
    const password = generateSecurePassword();
    console.log('🔑 Generated password for agent:', agentData.email, 'Password length:', password.length);

    // Create the user in Supabase Auth using regular signup
    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email: agentData.email,
      password: password,
      options: {
        data: {
          name: agentData.name,
          role: 'agent',
          created_by_admin: true
        },
        emailRedirectTo: undefined
      }
    });

    if (authError || !authData.user) {
      console.error('Supabase Auth error:', authError);
      return {
        success: false,
        error: authError?.message || 'Failed to create user in authentication system'
      };
    }

    console.log('✅ Supabase Auth user created:', {
      id: authData.user.id,
      email: authData.user.email,
      emailConfirmed: authData.user.email_confirmed_at,
      userMetadata: authData.user.user_metadata
    });

    // Skipping direct insert into users table due to RLS. Profile will be created on first login.

    // Return success with credentials (include integer PK as string)
    return {
      success: true,
      agent: undefined,
      credentials: {
        email: agentData.email,
        password: password
      }
    };

  } catch (error) {
    console.error('Unexpected error in createAgentAccount:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

/**
 * Generate a secure random password
 */
function generateSecurePassword(): string {
  const length = 16;
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Get all agents (admin-only)
 */
export const getAllAgents = async (adminUserId: string): Promise<User[]> => {
  try {
    // Verify admin access (use auth_id as UUID)
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('auth_id, role')
      .eq('auth_id', adminUserId)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminCheck) {
      throw new Error('Unauthorized: Only admins can view all agents');
    }

    const { data: agents, error } = await supabase
      .from('users')
      .select(`
        *,
        agents (
          bio,
          user_auth_id
        )
      `)
      .eq('role', 'agent');

    if (error) {
      throw error;
    }

    return agents.map(agent => ({
      id: agent.auth_id, // UUID
      name: agent.name,
      email: agent.email,
      password: '',
      role: agent.role as 'agent',
      phone: agent.phone || '',
      photo: agent.photo || '',
      bio: agent.agents?.[0]?.bio || '',
      properties: []
    }));

  } catch (error) {
    console.error('Error fetching agents:', error);
    throw error;
  }
};

/**
 * Update agent information (admin-only)
 */
export const updateAgent = async (
  agentId: number,
  updates: Partial<CreateAgentRequest>,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify admin access
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', parseInt(adminUserId))
      .eq('role', 'admin')
      .single();

    if (adminError || !adminCheck) {
      return {
        success: false,
        error: 'Unauthorized: Only admins can update agent information'
      };
    }

    // Update user information
    if (updates.name || updates.email || updates.phone) {
      const { error: userError } = await supabase
        .from('users')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.email && { email: updates.email }),
          ...(updates.phone && { phone: updates.phone })
        })
        .eq('id', agentId);

      if (userError) {
        return {
          success: false,
          error: 'Failed to update user information'
        };
      }
    }

    // Update agent bio if provided
    if (updates.bio) {
      const { error: agentError } = await supabase
        .from('agents')
        .update({ bio: updates.bio })
        .eq('id', agentId);

      if (agentError) {
        return {
          success: false,
          error: 'Failed to update agent bio'
        };
      }
    }

    return { success: true };

  } catch (error) {
    console.error('Error updating agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

/**
 * Delete agent account (admin-only)
 */
export const deleteAgent = async (
  agentId: number,
  adminUserId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify admin access
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', parseInt(adminUserId))
      .eq('role', 'admin')
      .single();

    if (adminError || !adminCheck) {
      return {
        success: false,
        error: 'Unauthorized: Only admins can delete agent accounts'
      };
    }

    // Note: Due to CASCADE DELETE constraints, deleting from users table
    // will automatically delete from agents table
    console.log('Attempting to delete agent with ID:', agentId);

    // First, let's check if the user exists and has the right role
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', agentId);

    console.log('User check before deletion:', { userCheck, userCheckError });

    if (!userCheck || userCheck.length === 0) {
      console.log('No user found with ID:', agentId);
      return {
        success: false,
        error: `No user found with ID ${agentId}`
      };
    }

    if (userCheck[0].role !== 'agent') {
      console.log('User is not an agent:', userCheck[0]);
      return {
        success: false,
        error: `User ${agentId} is not an agent (role: ${userCheck[0].role})`
      };
    }

    // Check if agent has any properties assigned
    const { data: agentProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title')
      .eq('agent_id', agentId);

    console.log('Agent properties check:', { agentProperties, propertiesError });

    // Check if agent has any tasks assigned
    const { data: agentTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('agent_id', agentId);

    console.log('Agent tasks check:', { agentTasks, tasksError });

    const propertyCount = agentProperties?.length || 0;
    const taskCount = agentTasks?.length || 0;

    if (propertyCount > 0 || taskCount > 0) {
      const issues = [];
      if (propertyCount > 0) issues.push(`${propertyCount} property(ies)`);
      if (taskCount > 0) issues.push(`${taskCount} task(s)`);

      console.log(`Agent has ${issues.join(' and ')} assigned`);
      return {
        success: false,
        error: `Cannot delete agent: They have ${issues.join(' and ')} assigned to them. Please reassign or remove these first.`
      };
    }

    // Now attempt the deletion with returning the deleted data
    const { data: deleteData, error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', agentId)
      .eq('role', 'agent')
      .select(); // This will return the deleted records

    console.log('Delete result:', { deleteData, deleteError });

    if (deleteError) {
      console.error('Delete error details:', deleteError);

      // Check if it's a foreign key constraint error
      if (deleteError.code === '23503') {
        if (deleteError.details?.includes('properties')) {
          // Get the count of properties assigned to this agent
          const { data: propertiesCount } = await supabase
            .from('properties')
            .select('id', { count: 'exact' })
            .eq('agent_id', agentId);

          const count = propertiesCount?.length || 0;
          return {
            success: false,
            error: `Cannot delete agent: They have ${count} property(ies) assigned to them. Please reassign or remove these properties first.`
          };
        } else if (deleteError.details?.includes('tasks')) {
          // Get the count of tasks assigned to this agent
          const { data: tasksCount } = await supabase
            .from('tasks')
            .select('id', { count: 'exact' })
            .eq('agent_id', agentId);

          const count = tasksCount?.length || 0;
          return {
            success: false,
            error: `Cannot delete agent: They have ${count} task(s) assigned to them. Please reassign or remove these tasks first.`
          };
        } else {
          return {
            success: false,
            error: `Cannot delete agent: They have related data that must be removed first. Details: ${deleteError.details}`
          };
        }
      }

      return {
        success: false,
        error: `Failed to delete agent account: ${deleteError.message}`
      };
    }

    if (!deleteData || deleteData.length === 0) {
      console.log('No records were deleted - this might indicate RLS policy blocking deletion');
      return {
        success: false,
        error: 'No records were deleted. This might be due to permissions or the record not existing.'
      };
    }

    console.log('User record deleted successfully:', deleteData);

    // Check if the agent record was also deleted (should be due to CASCADE)
    const { data: agentCheck, error: agentCheckError } = await supabase
      .from('agents')
      .select('id, bio')
      .eq('id', agentId);

    console.log('Agent record check after deletion:', { agentCheck, agentCheckError });

    if (agentCheck && agentCheck.length > 0) {
      console.log('WARNING: Agent record still exists after user deletion - CASCADE DELETE may not be working');
      // Manually delete the agent record
      const { error: manualDeleteError } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId);

      if (manualDeleteError) {
        console.error('Failed to manually delete agent record:', manualDeleteError);
      } else {
        console.log('Manually deleted agent record');
      }
    }

    console.log('Agent deletion completed successfully');
    return { success: true };

  } catch (error) {
    console.error('Error deleting agent:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
};

/**
 * Reset agent password (admin-only)
 */
export const resetAgentPassword = async (agentId: string, adminUserId: string): Promise<{ success: boolean; credentials?: { email: string; password: string }; error?: string }> => {
  try {
    // Verify admin access using auth_id (UUID)
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id', adminUserId)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminCheck) {
      console.error('Admin verification failed:', adminError);
      return {
        success: false,
        error: 'Unauthorized: Only admins can reset agent passwords'
      };
    }

    // Convert agentId to number
    const agentIdNum = parseInt(agentId, 10);
    if (isNaN(agentIdNum)) {
      return {
        success: false,
        error: 'Invalid agent ID'
      };
    }

    // Get agent email and auth_id from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, auth_id')
      .eq('id', agentIdNum)
      .eq('role', 'agent')
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Agent not found'
      };
    }

    if (!userData.auth_id) {
      return {
        success: false,
        error: 'Agent authentication ID not found'
      };
    }

    // Generate a new secure password
    const newPassword = generateSecurePassword();

    // Update the password in Supabase Auth using the auth_id
    const { error: authError } = await supabaseAuth.auth.admin.updateUserById(
      userData.auth_id,
      { password: newPassword }
    );

    if (authError) {
      console.error('Auth password update error:', authError);
      return {
        success: false,
        error: 'Failed to update password in authentication system'
      };
    }

    return {
      success: true,
      credentials: {
        email: userData.email,
        password: newPassword
      }
    };

  } catch (error) {
    console.error('Error resetting agent password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
