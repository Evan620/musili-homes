import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { User } from '@/types';

// Create service role client for admin operations
// Note: Service role key should be added to environment variables for production
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Create service role client if key is available, otherwise use regular client
const supabaseServiceRole = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase;

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
      .eq('auth_id' as any, adminUserId)
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
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: agentData.email,
      password: password,
      options: {
        data: {
          name: agentData.name,
          role: 'agent',
          created_by_admin: true,
          initial_password: password // Store for admin access
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

    return agents.map((agent: any) => ({
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
    // Verify admin access using auth_id (UUID from Supabase Auth)
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id' as any, adminUserId)
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
      console.log('🔄 Updating user information for agent ID:', agentId, updates);

      // First, let's check if the user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', agentId)
        .single();

      console.log('🔍 User existence check:', { existingUser, checkError });
      console.log('🔍 Existing user details:', existingUser);

      if (!existingUser) {
        return {
          success: false,
          error: `User with ID ${agentId} not found in users table`
        };
      }

      // Try the update with more explicit conditions
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone; // Allow empty string

      console.log('🔄 Update data being sent:', updateData);

      // Try the update with explicit admin context
      console.log('🔧 Attempting update with admin privileges...');

      const { data: updateResult, error: userError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', agentId)
        .select(); // Add select to see what was updated

      // If the update failed due to RLS, try a different approach
      if (!userError && (!updateResult || updateResult.length === 0)) {
        console.log('🔄 First update attempt failed, trying alternative approach...');

        // Try updating without the role condition
        const { data: updateResult2, error: userError2 } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', agentId)
          .eq('role', 'agent')
          .select();

        console.log('👤 Alternative update result:', { updateResult2, userError2 });

        if (userError2) {
          return {
            success: false,
            error: `Failed to update user information: ${userError2.message}`
          };
        }

        if (!updateResult2 || updateResult2.length === 0) {
          return {
            success: false,
            error: 'Update blocked by Row Level Security policy. Admin may not have permission to update this user.'
          };
        }
      }

      console.log('👤 User update result:', { updateResult, userError });

      if (userError) {
        console.error('❌ User update failed:', userError);
        return {
          success: false,
          error: `Failed to update user information: ${userError.message}`
        };
      }

      if (!updateResult || updateResult.length === 0) {
        console.warn('⚠️ User update succeeded but no rows were affected');
        return {
          success: false,
          error: 'No user record was updated. Agent may not exist.'
        };
      }
    }

    // Update agent bio if provided
    if (updates.bio !== undefined) { // Check for undefined instead of truthy to allow empty string
      console.log('🔄 Updating agent bio for agent ID:', agentId, { bio: updates.bio });

      const { data: agentUpdateResult, error: agentError } = await supabase
        .from('agents')
        .update({ bio: updates.bio })
        .eq('id', agentId)
        .select(); // Add select to see what was updated

      console.log('👨‍💼 Agent update result:', { agentUpdateResult, agentError });

      if (agentError) {
        console.error('❌ Agent update failed:', agentError);
        return {
          success: false,
          error: `Failed to update agent bio: ${agentError.message}`
        };
      }

      if (!agentUpdateResult || agentUpdateResult.length === 0) {
        console.warn('⚠️ Agent update succeeded but no rows were affected');
        // Don't fail here since the agent record might not exist yet
        console.log('ℹ️ Agent record may not exist, but user update was successful');
      }
    }

    console.log('✅ Agent update completed successfully');
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
    // Verify admin access using auth_id (UUID from Supabase Auth)
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id' as any, adminUserId)
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

    // Check if agent has any properties assigned (check both agent_id and agent_auth_id)
    const { data: agentProperties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title')
      .eq('agent_id', agentId);

    // Check for properties assigned via agent_auth_id by querying properties directly
    // Since RLS might block agents table access, query properties with both foreign keys
    const { data: propertiesByAuthId, error: authIdPropertiesError } = await supabase
      .from('properties')
      .select('id, title, agent_auth_id')
      .not('agent_auth_id', 'is', null);

    // Filter properties that might belong to this agent
    // We'll check if any properties have agent_auth_id that matches this agent's user_auth_id
    let matchingAuthIdProperties: any[] = [];

    if (propertiesByAuthId && !authIdPropertiesError) {
      // Get the user's auth_id from users table to match with agent_auth_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('auth_id')
        .eq('id', agentId)
        .single();

      if (userData && !userError && (userData as any).auth_id) {
        matchingAuthIdProperties = propertiesByAuthId.filter(
          (prop: any) => prop.agent_auth_id === (userData as any).auth_id
        );
      }
    }

    console.log('Agent properties check:', {
      propertiesById: agentProperties?.length || 0,
      propertiesByAuthId: matchingAuthIdProperties.length,
      totalProperties: (agentProperties?.length || 0) + matchingAuthIdProperties.length
    });

    // Check if agent has any tasks assigned (check both agent_id and agent_auth_id)
    const { data: agentTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('agent_id', agentId);

    // Check for tasks assigned via agent_auth_id
    const { data: tasksByAuthId, error: authIdTasksError } = await supabase
      .from('tasks')
      .select('id, title, agent_auth_id')
      .not('agent_auth_id', 'is', null);

    let matchingAuthIdTasks: any[] = [];
    if (tasksByAuthId && !authIdTasksError) {
      // Get the user's auth_id from users table to match with agent_auth_id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('auth_id')
        .eq('id', agentId)
        .single();

      if (userData && !userError && (userData as any).auth_id) {
        matchingAuthIdTasks = tasksByAuthId.filter(
          (task: any) => task.agent_auth_id === (userData as any).auth_id
        );
      }
    }

    console.log('Agent tasks check:', {
      tasksById: agentTasks?.length || 0,
      tasksByAuthId: matchingAuthIdTasks.length,
      totalTasks: (agentTasks?.length || 0) + matchingAuthIdTasks.length
    });

    const propertyCount = (agentProperties?.length || 0) + matchingAuthIdProperties.length;
    const taskCount = (agentTasks?.length || 0) + matchingAuthIdTasks.length;

    if (propertyCount > 0 || taskCount > 0) {
      const issues = [];
      if (propertyCount > 0) issues.push(`${propertyCount} property(ies)`);
      if (taskCount > 0) issues.push(`${taskCount} task(s)`);

      console.log(`Agent has ${issues.join(' and ')} assigned`);

      // Try to automatically clean up the agent_auth_id references before deletion
      console.log('🔧 Attempting to clean up agent_auth_id references...');

      // Get the user's auth_id to clean up references
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('auth_id')
        .eq('id', agentId)
        .single();

      if (userData && !userError && (userData as any).auth_id) {
        // Clear agent_auth_id from properties
        if (matchingAuthIdProperties.length > 0) {
          const { error: clearPropsError } = await supabase
            .from('properties')
            .update({ agent_auth_id: null } as any)
            .eq('agent_auth_id' as any, (userData as any).auth_id);

          if (clearPropsError) {
            console.error('Failed to clear agent_auth_id from properties:', clearPropsError);
          } else {
            console.log(`✅ Cleared agent_auth_id from ${matchingAuthIdProperties.length} properties`);
          }
        }

        // Clear agent_auth_id from tasks
        if (matchingAuthIdTasks.length > 0) {
          const { error: clearTasksError } = await supabase
            .from('tasks')
            .update({ agent_auth_id: null } as any)
            .eq('agent_auth_id' as any, (userData as any).auth_id);

          if (clearTasksError) {
            console.error('Failed to clear agent_auth_id from tasks:', clearTasksError);
          } else {
            console.log(`✅ Cleared agent_auth_id from ${matchingAuthIdTasks.length} tasks`);
          }
        }
      }

      // After cleanup, check if there are still properties/tasks assigned via agent_id
      const remainingPropertyCount = agentProperties?.length || 0;
      const remainingTaskCount = agentTasks?.length || 0;

      if (remainingPropertyCount > 0 || remainingTaskCount > 0) {
        const remainingIssues = [];
        if (remainingPropertyCount > 0) remainingIssues.push(`${remainingPropertyCount} property(ies)`);
        if (remainingTaskCount > 0) remainingIssues.push(`${remainingTaskCount} task(s)`);

        return {
          success: false,
          error: `Cannot delete agent: They still have ${remainingIssues.join(' and ')} assigned to them via agent_id. Please reassign or remove these first.`
        };
      }

      console.log('✅ All agent_auth_id references cleared, proceeding with deletion...');
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
          // We already calculated the property count above, use that
          return {
            success: false,
            error: `Cannot delete agent: They have ${propertyCount} property(ies) assigned to them. Please reassign or remove these properties first.`
          };
        } else if (deleteError.details?.includes('tasks')) {
          // We already calculated the task count above, use that
          return {
            success: false,
            error: `Cannot delete agent: They have ${taskCount} task(s) assigned to them. Please reassign or remove these tasks first.`
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
 * Get agent's stored password (admin-only)
 */
export const getAgentPassword = async (agentId: string, adminUserId: string): Promise<{ success: boolean; password?: string; error?: string }> => {
  try {
    // Verify admin access
    const { data: adminCheck, error: adminError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_id' as any, adminUserId)
      .eq('role', 'admin')
      .single();

    if (adminError || !adminCheck) {
      return {
        success: false,
        error: 'Unauthorized: Only admins can view agent passwords'
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

    // Get agent's auth_id from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', agentIdNum)
      .eq('role', 'agent')
      .single();

    if (userError || !userData || !(userData as any).auth_id) {
      return {
        success: false,
        error: 'Agent not found'
      };
    }

    // Get user metadata from Supabase Auth to retrieve stored password
    // Note: This requires the user to be authenticated, so we'll return a message instead
    return {
      success: true,
      password: 'Password stored securely. Use "Reset Password" to send new credentials to agent.'
    };

  } catch (error) {
    console.error('Error getting agent password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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
      .eq('auth_id' as any, adminUserId)
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
      .select('email, auth_id' as any)
      .eq('id', agentIdNum)
      .eq('role', 'agent')
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: 'Agent not found'
      };
    }

    if (!(userData as any).auth_id) {
      return {
        success: false,
        error: 'Agent authentication ID not found'
      };
    }

    // Generate a new password for the agent
    const newPassword = generateSecurePassword();
    console.log('🔄 Generated new password for agent:', (userData as any).email);

    // Try to update the password using service role client
    if (SUPABASE_SERVICE_ROLE_KEY) {
      console.log('🔧 Using service role to update password...');

      // Update password using admin API
      const { error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(
        (userData as any).auth_id,
        { password: newPassword }
      );

      if (updateError) {
        console.error('Failed to update password via service role:', updateError);
        return {
          success: false,
          error: `Failed to update password: ${updateError.message}`
        };
      }

      console.log('✅ Password updated successfully via service role');

      return {
        success: true,
        credentials: {
          email: (userData as any).email,
          password: newPassword
        }
      };
    } else {
      // Fallback: Send password reset email
      console.log('⚠️ Service role key not configured, sending password reset email...');

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        (userData as any).email,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (resetError) {
        console.error('Failed to send password reset email:', resetError);
        return {
          success: false,
          error: `Failed to send password reset email: ${resetError.message}`
        };
      }

      console.log('✅ Password reset email sent successfully');

      return {
        success: true,
        credentials: {
          email: (userData as any).email,
          password: 'A password reset email has been sent to the agent. They will need to check their email and follow the reset link.'
        }
      };
    }

  } catch (error) {
    console.error('Error resetting agent password:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
