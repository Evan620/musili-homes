import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.log('⚠️ Auth initialization timeout, setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state change:', _event, session?.user?.email);
      setSession(session);

      if (session?.user) {
        // Use metadata role directly - it's reliable and fast
        const userRole = session.user.user_metadata?.role || 'agent';
        console.log('✅ Using metadata role:', userRole, 'for user:', session.user.email);

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          role: userRole,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
      clearTimeout(fallbackTimeout); // Clear timeout when auth completes
    });

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔄 Initial session check:', session?.user?.email);
      setSession(session);

      if (session?.user) {
        // Use metadata role directly - it's reliable and fast
        const userRole = session.user.user_metadata?.role || 'agent';
        console.log('✅ Using initial metadata role:', userRole, 'for user:', session.user.email);

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
          role: userRole,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
      clearTimeout(fallbackTimeout); // Clear timeout when initial session completes
    }).catch((error) => {
      console.error('❌ Failed to get initial session:', error);
      setLoading(false);
      clearTimeout(fallbackTimeout); // Clear timeout on error
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallbackTimeout); // Clear timeout on cleanup
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return { success: false, error: error.message };

    // After successful login, check if user profile exists in users table
    if (data?.user) {
      const { id, email: userEmail, user_metadata } = data.user;
      
      // Try to insert user profile directly (handle conflicts gracefully)
      const { data: insertedUser, error: insertUserError } = await supabase
        .from('users')
        .insert({
          email: userEmail,
          name: user_metadata?.name || userEmail.split('@')[0],
          role: user_metadata?.role || 'agent',
          phone: user_metadata?.phone || null,
          photo: user_metadata?.photo || null,
          password: '', // Not used
          auth_id: id, // Link to Supabase Auth user
          created_at: new Date().toISOString()
        } as any)
        .select()
        .single();

      // If insert succeeded, create agent profile
      if (insertedUser && !insertUserError) {
        // Try to insert agent profile (handle conflicts gracefully)
        const { error: agentError } = await supabase
          .from('agents')
          .insert({
            id: insertedUser.id,
            user_auth_id: id, // Link to Supabase Auth user ID
            bio: user_metadata?.bio || ''
          });

        if (agentError && agentError.code !== '23505') { // Ignore unique constraint violations
          console.error('Agent profile creation error:', agentError);
        }
      } else if (insertUserError && insertUserError.code !== '23505') { // Ignore unique constraint violations
        console.error('User profile creation error:', insertUserError);
        
        // If user already exists, try to update agent profile
        const { data: existingUser, error: userCheckError } = await supabase
          .from('users')
          .select('id, auth_id')
          .eq('email', userEmail)
          .single();

        if (existingUser && !userCheckError) {
          // Update auth_id in users table if it's null
          if (!(existingUser as any).auth_id) {
            const { error: updateUserError } = await supabase
              .from('users')
              .update({ auth_id: id } as any)
              .eq('id', existingUser.id)
              .is('auth_id' as any, null);

            if (updateUserError) {
              console.error('User auth_id update error:', updateUserError);
            }
          }

          // Check if agent profile exists
          const { data: agentProfile, error: agentCheckError } = await supabase
            .from('agents')
            .select('id')
            .eq('id', existingUser.id)
            .single();

          if (!agentProfile && !agentCheckError) {
            // Create agent profile if it doesn't exist
            const { error: agentError } = await supabase
              .from('agents')
              .insert({
                id: existingUser.id,
                user_auth_id: (existingUser as any).auth_id || id, // Use existing auth_id or current id
                bio: user_metadata?.bio || ''
              });

            if (agentError && agentError.code !== '23505') {
              console.error('Agent profile creation error:', agentError);
            }
          } else if (agentProfile && !agentCheckError) {
            // Update user_auth_id if it's null
            const { error: updateAgentError } = await supabase
              .from('agents')
              .update({ user_auth_id: (existingUser as any).auth_id || id } as any)
              .eq('id', existingUser.id)
              .is('user_auth_id' as any, null);

            if (updateAgentError) {
              console.error('Agent user_auth_id update error:', updateAgentError);
            }
          }
        }
      }
    }
    return { success: true };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    logout,
    resetPassword,
    isAuthenticated: !!session && !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
