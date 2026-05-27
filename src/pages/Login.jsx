import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin';
  const { isAuthenticated, isAdmin, authChecked, checkUserAuth } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (authChecked && isAuthenticated) {
      // Small delay to ensure auth state is fully updated
      const redirectTimer = setTimeout(() => {
        if (isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }, 300);
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isAdmin, authChecked, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isSignUp) {
        // Sign up flow
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        // For new sign ups, create user profile
        if (data?.user?.id) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: data.user.id,
                email: email,
                role: 'user',
                is_admin: false,
              }
            ]);

          if (profileError) {
            console.warn('Could not create user profile:', profileError);
          }
        }

        setSuccessMessage('✓ Account created! Check your email for the confirmation link.');
        setEmail('');
        setPassword('');
        setIsSignUp(false);
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        // Sign in flow
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw new Error(signInError.message || 'Invalid email or password');
        }

        // Manually refresh auth check after sign-in
        await checkUserAuth();

        // Show success message briefly
        setSuccessMessage('✓ Signed in successfully!');
        
        // Immediate redirect without waiting for message to clear
        // This prevents the blank screen issue
        setTimeout(() => {
          if (isAdmin) {
            navigate('/admin', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 100);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      
      if (errorMsg.includes('Email not confirmed')) {
        setError('Please verify your email first. Check your inbox for the confirmation link.');
      } else if (errorMsg.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (errorMsg.includes('User already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (errorMsg.includes('Password should be at least 6 characters')) {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ICON by Mitali</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your account' : 'Admin Access'}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full"
            />
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-black hover:bg-gray-900 text-white"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {/* Toggle between login and signup */}
        <div className="text-center text-sm">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              className="text-gray-900 font-semibold hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Info Message */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700 border border-blue-200">
          <p className="font-semibold mb-1">Admin Portal</p>
          <p className="text-blue-600">
            {isSignUp 
              ? 'Ask an existing admin to add you as an admin after sign up.'
              : 'Only users with admin privileges can access the dashboard. Sign in with your credentials.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
