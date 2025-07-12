import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get all possible URL parameters that Supabase might send
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const code = searchParams.get('code');
  const type = searchParams.get('type');
  const tokenHash = searchParams.get('token_hash');
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyResetToken = async () => {
      try {
        const allParams = Object.fromEntries(searchParams.entries());
        console.log('🔍 Reset password URL parameters:', {
          accessToken: !!accessToken,
          refreshToken: !!refreshToken,
          code: !!code,
          type,
          tokenHash: !!tokenHash,
          token: !!token,
          allParams
        });

        // For debugging, let's also log the actual values (be careful with sensitive data)
        console.log('🔍 Actual parameter values:', {
          type,
          hasCode: !!code,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasTokenHash: !!tokenHash,
          allParamKeys: Object.keys(allParams)
        });

        // Also check the URL hash for tokens (common in Supabase auth flows)
        const urlHash = window.location.hash;
        if (urlHash) {
          console.log('🔍 URL hash found:', urlHash);
          const hashParams = new URLSearchParams(urlHash.substring(1));
          const hashAccessToken = hashParams.get('access_token');
          const hashRefreshToken = hashParams.get('refresh_token');
          const hashType = hashParams.get('type');

          console.log('🔍 Hash parameters:', {
            hasHashAccessToken: !!hashAccessToken,
            hasHashRefreshToken: !!hashRefreshToken,
            hashType,
            allHashParams: Object.fromEntries(hashParams.entries())
          });

          // If we found tokens in the hash, use them
          if (hashAccessToken && hashRefreshToken) {
            console.log('🔄 Using tokens from URL hash...');
            const { data, error } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken,
            });

            if (error) {
              console.error('Error setting session from hash:', error);
            } else {
              console.log('✅ Session set successfully from hash');
              setIsValidToken(true);
              return;
            }
          }
        }

        // Handle different types of Supabase auth URLs
        if (type === 'recovery' && (accessToken && refreshToken)) {
          // Standard Supabase password recovery flow
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            toast({
              title: 'Invalid Reset Link',
              description: 'This password reset link is invalid or has expired.',
              variant: 'destructive',
            });
            navigate('/login');
            return;
          }

          console.log('✅ Session set successfully for password reset');
          setIsValidToken(true);
        } else if (type === 'recovery' && tokenHash) {
          // Handle token hash based recovery
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (error) {
            console.error('Error verifying OTP:', error);
            toast({
              title: 'Invalid Reset Link',
              description: 'This password reset link is invalid or has expired.',
              variant: 'destructive',
            });
            navigate('/login');
            return;
          }

          console.log('✅ OTP verified successfully for password reset');
          setIsValidToken(true);
        } else if (code || type === 'recovery') {
          // Handle password reset with code or recovery type
          console.log('🔄 Password reset parameters detected');

          // Don't try to verify the token here - just allow the form to load
          // We'll verify the token when the user actually submits the form
          console.log('✅ Allowing password reset form to load');
          setIsValidToken(true);
        } else {
          console.log('❌ No valid reset parameters found');
          toast({
            title: 'Invalid Reset Link',
            description: 'This password reset link is missing required parameters.',
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error verifying reset token:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while verifying the reset link.',
          variant: 'destructive',
        });
        navigate('/login');
      } finally {
        setIsCheckingToken(false);
      }
    };

    verifyResetToken();
  }, [accessToken, refreshToken, code, type, tokenHash, token, navigate, toast, searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const code = searchParams.get('code');

      if (!code) {
        toast({
          title: 'Invalid Reset Link',
          description: 'This password reset link is missing the verification code.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      console.log('🔄 Updating password using verification code...');

      // Get the email from URL parameters (we now include it in the reset link)
      const email = searchParams.get('email');

      if (!email) {
        toast({
          title: 'Invalid Reset Link',
          description: 'This password reset link is missing the email address.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      console.log('🔄 Verifying OTP with email and code...');

      // Use the correct verifyOtp method with email and token
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: code,
        type: 'recovery',
      });

      if (error) {
        console.error('Error verifying OTP:', error);

        // Provide more specific error messages based on the error type
        let errorMessage = 'This password reset link is invalid or has expired. Please request a new one.';

        if (error.message.includes('expired')) {
          errorMessage = 'This password reset link has expired. Password reset links are only valid for a short time. Please request a new password reset email.';
        } else if (error.message.includes('invalid')) {
          errorMessage = 'This password reset link is invalid. It may have already been used. Please request a new password reset email.';
        }

        toast({
          title: 'Reset Link Issue',
          description: errorMessage,
          variant: 'destructive',
        });

        // Instead of navigating to login, let's offer to request a new reset
        setTimeout(() => {
          if (confirm('Would you like to request a new password reset email?')) {
            // Redirect to a page where they can request a new reset
            window.location.href = '/login';
          } else {
            navigate('/login');
          }
        }, 2000);
        return;
      }

      console.log('✅ OTP verified successfully, now updating password...');

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        toast({
          title: 'Error',
          description: updateError.message || 'Failed to update password.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated. You can now log in with your new password.',
      });

      // Sign out the user so they can log in with the new password
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Verifying reset link...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {password && confirmPassword && password !== confirmPassword && (
              <div className="text-sm text-red-600">
                Passwords do not match
              </div>
            )}

            {password && password.length < 6 && (
              <div className="text-sm text-red-600">
                Password must be at least 6 characters long
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || password !== confirmPassword || password.length < 6}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating Password...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Update Password</span>
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
