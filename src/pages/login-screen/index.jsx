import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserCredit } from '../../contexts/UserCreditContext';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Eye, EyeOff, Mail, AlertCircle, CheckCircle2, Loader } from 'lucide-react';
import Icon from '../../components/AppIcon';


const LoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, resetPassword, loading, user } = useAuth();
  const { balance } = useUserCredit();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = location?.state?.from?.pathname || '/user-dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location?.state]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target || {};
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear specific field error
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);

      if (error) {
        if (error?.message?.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please check your credentials.' });
        } else if (error?.message?.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link before signing in.' });
        } else {
          setErrors({ general: error?.message || 'Sign in failed' });
        }
        return;
      }

      // Successful login - redirect to dashboard
      navigate('/user-dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred' });
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e?.preventDefault();

    if (!resetEmail?.trim()) {
      setResetStatus({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(resetEmail)) {
      setResetStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    try {
      const { error } = await resetPassword(resetEmail);

      if (error) {
        setResetStatus({ type: 'error', message: error?.message || 'Failed to send reset email' });
      } else {
        setResetStatus({ 
          type: 'success', 
          message: 'Password reset link sent! Check your email for instructions.' 
        });
      }
    } catch (error) {
      setResetStatus({ type: 'error', message: 'An unexpected error occurred' });
    }
  };

  // Password reset modal component
  const PasswordResetModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Reset Password</h3>
        
        {resetStatus?.type === 'success' ? (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-6">{resetStatus?.message}</p>
            <Button
              onClick={() => {
                setShowPasswordReset(false);
                setResetStatus(null);
                setResetEmail('');
              }}
              className="w-full"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <p className="text-gray-600 mb-4">
              Enter your email address and we will send you a link to reset your password.
            </p>
            
            <div className="mb-4">
              <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="Enter your email address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e?.target?.value || '')}
                className="w-full"
              />
            </div>

            {resetStatus?.type === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{resetStatus?.message}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordReset(false);
                  setResetStatus(null);
                  setResetEmail('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          {/* Demo Credentials Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Info" size={16} className="text-blue-600" />
              <h3 className="text-sm font-medium text-blue-800">Demo Credentials</h3>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Admin:</strong> ian@ianmclayton.com / password123</div>
              <div><strong>User:</strong> demo@example.com / password123</div>
            </div>
          </div>

          {/* Login Status Message */}
          {location?.state?.message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2 text-blue-700">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{location?.state?.message}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors?.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{errors?.general}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData?.email || ''}
                  onChange={handleInputChange}
                  error={errors?.email}
                  className="pl-10"
                  autoComplete="email"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors?.email && (
                <p className="text-red-500 text-sm mt-1">{errors?.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData?.password || ''}
                  onChange={handleInputChange}
                  error={errors?.password}
                  className="pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors?.password && (
                <p className="text-red-500 text-sm mt-1">{errors?.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData?.rememberMe || false}
                  onChange={handleInputChange}
                />
                <label htmlFor="rememberMe" className="text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordReset(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Social Login Options - Placeholder */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled
              >
                GitHub
              </Button>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Social login coming soon
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Do not have an account?{' '}
              <Link 
                to="/registration-screen" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign up for free trial
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Get 100k credits free for 7 days
            </p>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && <PasswordResetModal />}
    </div>
  );
};

export default LoginScreen;