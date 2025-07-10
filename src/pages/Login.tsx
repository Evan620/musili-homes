
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { isAuthenticated, isAdmin, isAgent, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 Login page - Auth state:', { isAuthenticated, isAdmin, isAgent, loading });

    if (isAuthenticated && !loading) {
      console.log('🔄 User already authenticated, redirecting...');
      if (isAdmin) {
        console.log('🔄 Redirecting admin to dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else if (isAgent) {
        console.log('🔄 Redirecting agent to dashboard');
        navigate('/agent/dashboard', { replace: true });
      } else {
        console.log('🔄 Redirecting to home');
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isAgent, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-soft-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-charcoal mx-auto mb-4"></div>
          <p className="text-deep-charcoal">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show redirecting message
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-soft-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-charcoal mx-auto mb-4"></div>
          <p className="text-deep-charcoal">Already logged in, redirecting...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-soft-ivory flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-thin text-deep-charcoal luxury-heading">Sign in to your account</h2>
          <p className="mt-2 text-sm text-deep-charcoal/70 luxury-text">
            Access your admin or agent dashboard
          </p>
        </div>
        <div className="bg-pure-white p-8 shadow-md rounded-lg border border-satin-silver">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
