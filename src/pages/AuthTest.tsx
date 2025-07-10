import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, Shield, Mail, Key } from 'lucide-react';

const AuthTest: React.FC = () => {
  const { user, session, isAuthenticated, isAdmin, isAgent, login, logout } = useAuth();
  const [testEmail, setTestEmail] = useState('test@musili.co.ke');
  const [testPassword, setTestPassword] = useState('test123456');
  const [testName, setTestName] = useState('Test User');
  const [testRole, setTestRole] = useState<'admin' | 'agent'>('agent');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleCreateTestUser = async () => {
    setIsCreating(true);
    // Signup functionality removed - only admins can create users now
    console.log('Signup functionality has been removed. Only admins can create users.');
    setIsCreating(false);
  };

  const handleTestLogin = async () => {
    setIsLoggingIn(true);
    const result = await login(testEmail, testPassword);
    
    if (result.success) {
      console.log('Test login successful');
    } else {
      console.error('Test login failed:', result.error);
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Authentication Test</h1>
          <p className="mt-2 text-gray-600">
            Test Supabase authentication functionality
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Auth State */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Current Authentication State
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Authenticated:</span>
                <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="font-mono text-sm">{user?.id || 'None'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-sm">{user?.email || 'None'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="text-sm">{user?.name || 'None'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Role:</span>
                <span className={`text-sm font-medium ${
                  isAdmin ? 'text-purple-600' : isAgent ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {user?.role || 'None'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Session:</span>
                <span className={`text-sm ${session ? 'text-green-600' : 'text-red-600'}`}>
                  {session ? 'Active' : 'None'}
                </span>
              </div>
            </div>

            {isAuthenticated && (
              <div className="mt-6">
                <Button onClick={logout} variant="outline" className="w-full">
                  Logout
                </Button>
              </div>
            )}
          </Card>

          {/* Test User Creation */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Create Test User
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Email</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@musili.co.ke"
                />
              </div>
              
              <div>
                <Label htmlFor="testPassword">Password</Label>
                <Input
                  id="testPassword"
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="test123456"
                />
              </div>
              
              <div>
                <Label htmlFor="testName">Name</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Test User"
                />
              </div>
              
              <div>
                <Label htmlFor="testRole">Role</Label>
                <select
                  id="testRole"
                  value={testRole}
                  onChange={(e) => setTestRole(e.target.value as 'admin' | 'agent')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateTestUser}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create User'}
                </Button>
                
                <Button
                  onClick={handleTestLogin}
                  disabled={isLoggingIn}
                  variant="outline"
                  className="flex-1"
                >
                  {isLoggingIn ? 'Logging in...' : 'Test Login'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Session Details */}
        {session && (
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Session Details
            </h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(session, null, 2)}
            </pre>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Testing Instructions</h3>
          <div className="text-blue-800 space-y-2 text-sm">
            <p><strong>1. Create Test User:</strong> Fill in the form and click "Create User"</p>
            <p><strong>2. Check Email:</strong> Supabase will send a verification email</p>
            <p><strong>3. Verify Account:</strong> Click the link in the email to verify</p>
            <p><strong>4. Test Login:</strong> Use the same credentials to log in</p>
            <p><strong>5. Check State:</strong> Verify the authentication state updates correctly</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthTest;
