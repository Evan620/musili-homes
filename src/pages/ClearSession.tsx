import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ClearSession: React.FC = () => {
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleClearSession = async () => {
    try {
      setClearing(true);
      setMessage('Clearing session...');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear all localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear specific auth keys
      const authKeys = [
        'musilli-homes-auth',
        'sb-localhost-auth-token',
        'supabase.auth.token'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      setMessage('Session cleared successfully! Redirecting...');
      
      // Wait a moment then redirect
      setTimeout(() => {
        window.location.href = '/sign_up';
      }, 2000);
      
    } catch (error) {
      console.error('Error clearing session:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setClearing(false);
    }
  };

  const handleCheckSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log('Current session:', session);
      console.log('Current user:', user);
      
      setMessage(`Session: ${session ? 'EXISTS' : 'NONE'}, User: ${user ? user.email : 'NONE'}`);
    } catch (error) {
      console.error('Error checking session:', error);
      setMessage(`Error checking session: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Clear Session</h2>
        <p className="text-gray-600 mb-6">
          Use this page to clear any stuck authentication sessions.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleCheckSession} 
            variant="outline" 
            className="w-full"
          >
            Check Current Session
          </Button>
          
          <Button 
            onClick={handleClearSession} 
            className="w-full"
            disabled={clearing}
          >
            {clearing ? 'Clearing...' : 'Clear Session & Redirect'}
          </Button>
          
          <Button 
            onClick={() => navigate('/sign_up')} 
            variant="outline" 
            className="w-full"
          >
            Go to Sign Up
          </Button>
          
          <Button 
            onClick={() => navigate('/login')} 
            variant="outline" 
            className="w-full"
          >
            Go to Login
          </Button>
        </div>
        
        {message && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded">
            {message}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClearSession;
