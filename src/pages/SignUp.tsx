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
  const navigate = useNavigate();

  useEffect(() => {
    // Check if any admin exists in the users table
    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);
      if (error) {
        setAdminExists(false); // fallback: allow signup if error
      } else {
        setAdminExists((data?.length ?? 0) > 0);
      }
    };
    checkAdmin();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
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
      // Insert admin into users table
      const dbUser = await createOrUpdateUser({
        email: data.user.email,
        name: name,
        role: 'admin',
      });
      setLoading(false);
      if (dbUser) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to create admin profile in database.');
      }
    } else {
      setLoading(false);
      setError('Unknown error occurred.');
    }
  };

  if (adminExists === null) {
    return <div className="min-h-screen flex items-center justify-center">Checking admin status...</div>;
  }
  if (adminExists) {
    return <div className="min-h-screen flex items-center justify-center">An admin already exists. Signup is disabled.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Admin Account</h2>
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
        {error && <div className="text-red-500 mt-4 text-center">{error}</div>}
        {success && <div className="text-green-600 mt-4 text-center">Admin account created! Redirecting to login...</div>}
      </Card>
    </div>
  );
};

export default SignUp; 