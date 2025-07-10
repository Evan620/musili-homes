import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { createOrUpdateUser } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AuthDebug: React.FC = () => {
  const { user, session, loading, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testCredentials, setTestCredentials] = useState({
    email: 'lazarusogero1@gmail.com',
    password: 'Evan@2002'
  });

  useEffect(() => {
    const getDebugInfo = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        setDebugInfo({
          sessionData,
          sessionError,
          userData,
          userError,
          url: window.location.href,
          supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        });
      } catch (error) {
        console.error('Debug info error:', error);
        setDebugInfo({ error: error.message });
      }
    };

    getDebugInfo();
  }, [session]);

  const handleTestLogin = async () => {
    try {
      console.log('Testing login with:', testCredentials);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testCredentials.email,
        password: testCredentials.password,
      });

      console.log('Login result:', { data, error });
      
      if (error) {
        alert(`Login error: ${error.message}`);
      } else {
        alert('Login successful!');
      }
    } catch (error) {
      console.error('Test login error:', error);
      alert(`Test login error: ${error.message}`);
    }
  };

  const handleTestSignup = async () => {
    try {
      console.log('Testing signup with:', testCredentials);
      
      const { data, error } = await supabase.auth.signUp({
        email: testCredentials.email,
        password: testCredentials.password,
        options: {
          data: {
            name: 'Test Admin',
            role: 'admin'
          }
        }
      });

      console.log('Signup result:', { data, error });
      
      if (error) {
        alert(`Signup error: ${error.message}`);
      } else {
        alert('Signup successful! Check your email for verification.');
      }
    } catch (error) {
      console.error('Test signup error:', error);
      alert(`Test signup error: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        alert(`Logout error: ${error.message}`);
      } else {
        alert('Logged out successfully!');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert(`Logout error: ${error.message}`);
    }
  };

  const handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Storage cleared! Please refresh the page.');
  };

  const handleCreateUserInDB = async () => {
    try {
      if (!user) {
        alert('No user logged in!');
        return;
      }

      console.log('Creating user in database:', user);

      const dbUser = await createOrUpdateUser({
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: 'admin', // Set as admin for testing
        phone: user.phone,
        photo: user.photo
      });

      if (dbUser) {
        alert(`User created in database! ID: ${dbUser.id}, Role: ${dbUser.role}`);
      } else {
        alert('Failed to create user in database');
      }
    } catch (error) {
      console.error('Create user error:', error);
      alert(`Create user error: ${error.message}`);
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-800">🔧 Auth Debug Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Auth Status */}
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Auth Status:</h4>
            <div className="flex flex-wrap gap-1">
              <Badge variant={loading ? "secondary" : "outline"}>
                Loading: {loading ? "Yes" : "No"}
              </Badge>
              <Badge variant={isAuthenticated ? "default" : "destructive"}>
                Authenticated: {isAuthenticated ? "Yes" : "No"}
              </Badge>
              <Badge variant={session ? "default" : "secondary"}>
                Session: {session ? "Yes" : "No"}
              </Badge>
              <Badge variant={user ? "default" : "secondary"}>
                User: {user ? "Yes" : "No"}
              </Badge>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="space-y-1">
              <h4 className="font-medium text-blue-800">User Info:</h4>
              <div className="bg-white p-2 rounded text-xs">
                <div>Email: {user.email}</div>
                <div>Role: {user.role || 'None'}</div>
                <div>Name: {user.name || 'None'}</div>
              </div>
            </div>
          )}

          {/* Session Info */}
          {session && (
            <div className="space-y-1">
              <h4 className="font-medium text-blue-800">Session Info:</h4>
              <div className="bg-white p-2 rounded text-xs">
                <div>Access Token: {session.access_token ? 'Present' : 'Missing'}</div>
                <div>Refresh Token: {session.refresh_token ? 'Present' : 'Missing'}</div>
                <div>Expires: {new Date(session.expires_at * 1000).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="space-y-1">
              <h4 className="font-medium text-blue-800">Debug Info:</h4>
              <div className="bg-white p-2 rounded text-xs max-h-32 overflow-y-auto">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Test Credentials */}
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Test Credentials:</h4>
            <div className="space-y-1">
              <input
                type="email"
                placeholder="Email"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-2 py-1 text-xs border rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-2 py-1 text-xs border rounded"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            <h4 className="font-medium text-blue-800">Actions:</h4>
            <div className="grid grid-cols-2 gap-1">
              <Button size="sm" onClick={handleTestLogin} className="text-xs">
                Test Login
              </Button>
              <Button size="sm" onClick={handleTestSignup} variant="outline" className="text-xs">
                Test Signup
              </Button>
              <Button
                size="sm"
                onClick={handleCreateUserInDB}
                variant="default"
                className="text-xs"
                disabled={!user}
              >
                Create in DB
              </Button>
              <Button size="sm" onClick={handleLogout} variant="destructive" className="text-xs">
                Logout
              </Button>
              <Button size="sm" onClick={handleClearStorage} variant="secondary" className="text-xs">
                Clear Storage
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-1">Instructions:</h4>
            <div className="text-yellow-700 text-xs space-y-1">
              <div>1. You're already logged in! Click "Create in DB" to add user to database</div>
              <div>2. This will create the user record needed for the app</div>
              <div>3. Then try accessing admin features</div>
              <div>4. If issues persist, check Supabase Site URL settings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
