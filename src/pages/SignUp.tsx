import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createOrUpdateUser } from '@/services/database';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [clearingSession, setClearingSession] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing session and check for admin
    const clearSessionAndCheckAdmin = async () => {
      try {
        // Check if there's an existing session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('🔄 Clearing existing session before admin signup...');
          setClearingSession(true);
          await supabase.auth.signOut();
          setClearingSession(false);
        }

        // Check for existing admin using a more reliable approach with timeout
        console.log('🔍 Checking if admin exists...');

        // Create a promise that times out after 5 seconds
        const adminCheckPromise = supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin');

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Admin check timeout')), 5000)
        );

        try {
          const { count, error } = await Promise.race([adminCheckPromise, timeoutPromise]) as any;

          if (error) {
            console.warn('⚠️ Error checking for admin, allowing signup:', error);
            // If we can't check, allow signup as fallback
            setAdminExists(false);
          } else {
            const hasAdmin = (count || 0) > 0;
            console.log('✅ Admin check complete. Admin exists:', hasAdmin, 'Count:', count);
            setAdminExists(hasAdmin);
          }
        } catch (timeoutError) {
          console.warn('⚠️ Admin check timed out, allowing signup as fallback');
          setAdminExists(false);
        }
      } catch (error) {
        console.error('❌ Error in admin check:', error);
        // If there's an error, allow signup as fallback
        setAdminExists(false);
        setClearingSession(false);
      }
    };

    clearSessionAndCheckAdmin();
  }, []);

  const handleClearSession = async () => {
    try {
      setClearingSession(true);
      console.log('🔄 Manually clearing session...');
      await supabase.auth.signOut();

      // Clear localStorage manually as well
      localStorage.removeItem('musilli-homes-auth');
      localStorage.clear();

      console.log('✅ Session cleared successfully');
      setClearingSession(false);

      // Refresh the page to reset everything
      window.location.reload();
    } catch (error) {
      console.error('❌ Error clearing session:', error);
      setClearingSession(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Ensure we're signed out before creating admin
      await supabase.auth.signOut();

      console.log('🔄 Creating admin account...');

      // Create user in Supabase Auth with role: admin
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'admin',
          },
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        setLoading(false);
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        console.log('✅ Auth user created, now creating database record...');

        // Insert admin into users table
        const dbUser = await createOrUpdateUser({
          email: data.user.email || email,
          name: name,
          role: 'admin',
          auth_id: data.user.id,
        });

        if (dbUser) {
          console.log('✅ Database user created successfully');

          // Update the user metadata to ensure consistency
          const { error: updateError } = await supabase.auth.updateUser({
            data: {
              name: name,
              role: 'admin',
            }
          });

          if (updateError) {
            console.warn('Could not update user metadata:', updateError);
          }

          // Sign out the user immediately so they have to confirm email first
          await supabase.auth.signOut();
          console.log('✅ User signed out, must confirm email to login');

          setSuccess(true);
        } else {
          setError('Failed to create admin profile in database.');
        }
      } else {
        setError('Unknown error occurred during signup.');
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (adminExists === null || clearingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {clearingSession ? 'Clearing existing session...' : 'Checking admin status...'}
          </p>
        </Card>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Admin Account Exists</h2>
            <p className="text-gray-600 mb-6">
              An administrator account is already set up for this system.
              New admin registration is disabled for security.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={() => navigate('/login')} className="w-full">
              Login to Existing Account
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Go to Homepage
            </Button>
            {process.env.NODE_ENV === 'development' && (
              <Button
                onClick={handleClearSession}
                variant="outline"
                className="w-full text-xs"
                disabled={clearingSession}
              >
                {clearingSession ? 'Clearing...' : 'Dev: Clear Session & Retry'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Create Admin Account</h2>
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
          <p className="text-sm">
            <strong>Note:</strong> After creating your account, you'll receive a confirmation email.
            You must confirm your email before you can login.
          </p>
        </div>
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Admin'}
          </Button>
        </form>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
            <p className="text-sm mb-3">{error}</p>
            <Button
              onClick={handleClearSession}
              variant="outline"
              size="sm"
              disabled={clearingSession}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              {clearingSession ? 'Clearing...' : 'Clear Session & Retry'}
            </Button>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mt-4">
            <h4 className="font-semibold mb-2">Admin Account Created Successfully! 🎉</h4>
            <p className="text-sm mb-3">
              A confirmation email has been sent to <strong>{email}</strong>
            </p>
            <p className="text-sm mb-3">
              <strong>Important:</strong> You must confirm your email before you can login.
            </p>
            <p className="text-sm mb-4">
              Check your inbox and click the confirmation link, then return to login.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full" size="sm">
              Go to Login Page
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SignUp; 