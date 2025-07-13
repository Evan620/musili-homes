import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

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
        // Use metadata role directly - no database queries to avoid hanging
        const userRole = session.user.user_metadata?.role || 'agent';
        console.log('✅ Using metadata role:', userRole, 'for user:', session.user.email);

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
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
        // Use metadata role directly - no database queries to avoid hanging
        const userRole = session.user.user_metadata?.role || 'agent';
        console.log('✅ Using metadata role on initial load:', userRole, 'for user:', session.user.email);

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
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

    // Login successful - user profile will be handled by auth state change
    // No database operations to avoid RLS policy conflicts
    console.log('✅ Login successful for:', data?.user?.email);
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
