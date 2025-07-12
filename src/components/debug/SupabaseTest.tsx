import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SupabaseTest: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test 1: Basic connection
      addResult('Basic Connection', 'Testing Supabase connection...');
      
      // Test 2: Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      addResult('Get Session', { sessionData, sessionError });

      // Test 3: Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      addResult('Get User', { userData, userError });

      // Test 4: Test database connection (try to query a simple table)
      const { data: dbTest, error: dbError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      addResult('Database Connection', { dbTest, dbError });

      // Test 5: Test RLS policies
      const { data: propertiesTest, error: propertiesError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      addResult('Properties Table Access', { propertiesTest, propertiesError });

      addResult('Connection Test', 'All tests completed');
    } catch (error) {
      addResult('Connection Test Error', error);
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    setLoading(true);
    try {
      const testEmail = 'test@musillihomes.co.ke';
      const testPassword = 'test123456';

      addResult('Signup Test', `Attempting signup with ${testEmail}`);

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: 'Test User',
            role: 'user'
          }
        }
      });

      addResult('Signup Result', { data, error });
    } catch (error) {
      addResult('Signup Error', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const testEmail = 'admin@musillihomes.co.ke';
      const testPassword = 'admin123';

      addResult('Login Test', `Attempting login with ${testEmail}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      addResult('Login Result', { data, error });
    } catch (error) {
      addResult('Login Error', error);
    } finally {
      setLoading(false);
    }
  };

  const testLogout = async () => {
    setLoading(true);
    try {
      addResult('Logout Test', 'Attempting logout');

      const { error } = await supabase.auth.signOut();

      addResult('Logout Result', { error });
    } catch (error) {
      addResult('Logout Error', error);
    } finally {
      setLoading(false);
    }
  };

  const testEnvironment = () => {
    const env = {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      currentUrl: window.location.href,
      userAgent: navigator.userAgent
    };

    addResult('Environment Check', env);
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed top-4 left-4 z-50 max-w-lg">
      <Card className="border-2 border-green-500 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-green-800">🧪 Supabase Test Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Test Actions */}
          <div className="space-y-2">
            <h4 className="font-medium text-green-800">Test Actions:</h4>
            <div className="grid grid-cols-2 gap-1">
              <Button 
                size="sm" 
                onClick={testEnvironment} 
                disabled={loading}
                className="text-xs"
              >
                Check Env
              </Button>
              <Button 
                size="sm" 
                onClick={testConnection} 
                disabled={loading}
                className="text-xs"
              >
                Test Connection
              </Button>
              <Button 
                size="sm" 
                onClick={testSignup} 
                disabled={loading}
                variant="outline"
                className="text-xs"
              >
                Test Signup
              </Button>
              <Button 
                size="sm" 
                onClick={testLogin} 
                disabled={loading}
                variant="outline"
                className="text-xs"
              >
                Test Login
              </Button>
              <Button 
                size="sm" 
                onClick={testLogout} 
                disabled={loading}
                variant="destructive"
                className="text-xs"
              >
                Test Logout
              </Button>
              <Button 
                size="sm" 
                onClick={clearResults} 
                disabled={loading}
                variant="secondary"
                className="text-xs"
              >
                Clear Results
              </Button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-1">
              <h4 className="font-medium text-green-800">Test Results:</h4>
              <div className="bg-white p-2 rounded text-xs max-h-64 overflow-y-auto space-y-2">
                {results.map((result, index) => (
                  <div key={index} className="border-b border-gray-200 pb-2">
                    <div className="font-medium text-green-700">
                      {result.test}
                    </div>
                    <div className="text-gray-600 text-xs">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </div>
                    <pre className="mt-1 text-xs bg-gray-50 p-1 rounded overflow-x-auto">
                      {typeof result.result === 'string' 
                        ? result.result 
                        : JSON.stringify(result.result, null, 2)
                      }
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center text-green-700">
              Running tests...
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 p-2 rounded border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-1">Instructions:</h4>
            <div className="text-blue-700 text-xs space-y-1">
              <div>1. Check environment variables first</div>
              <div>2. Test connection to verify Supabase setup</div>
              <div>3. Try signup to create a test account</div>
              <div>4. Try login with the test account</div>
              <div>5. Check browser console for additional errors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
