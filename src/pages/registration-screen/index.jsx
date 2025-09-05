import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Eye, EyeOff, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegistrationScreen = () => {
  const navigate = useNavigate();
  const { signUp, loading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [emailValidationStatus, setEmailValidationStatus] = useState(null); // 'valid', 'invalid', 'checking'
  const [passwordStrength, setPasswordStrength] = useState({
    hasLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });
  const [registrationStep, setRegistrationStep] = useState('form'); // 'form', 'success', 'verification'

  // Email domain validation helper
  const validateEmailDomain = (email) => {
    // Common disposable/temporary email domains that are typically blocked
    const blockedDomains = [
      'test.com',
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      'throwaway.email',
      'temp-mail.org',
      'example.com',
      'test.org'
    ];
    
    // Extract domain from email
    const domain = email?.toLowerCase()?.split('@')?.[1];
    
    if (blockedDomains?.includes(domain)) {
      return {
        isValid: false,
        reason: 'blocked_domain',
        message: 'This email domain is not allowed for registration. Please use a personal or business email address.'
      };
    }
    
    // Check for obvious test/invalid domains
    if (domain?.includes('test') || domain?.includes('example') || domain?.includes('invalid')) {
      return {
        isValid: false,
        reason: 'test_domain',
        message: 'Please use a real email address from a valid email provider (Gmail, Outlook, Yahoo, etc.).'
      };
    }
    
    // Check for common valid domains
    const trustedDomains = [
      'gmail.com',
      'outlook.com',
      'hotmail.com',
      'yahoo.com',
      'aol.com',
      'icloud.com',
      'protonmail.com',
      'zoho.com'
    ];
    
    if (trustedDomains?.includes(domain)) {
      return {
        isValid: true,
        reason: 'trusted_domain',
        message: 'Valid email domain'
      };
    }
    
    // For other domains, return as potentially valid
    return {
      isValid: true,
      reason: 'unknown_domain',
      message: 'Email appears valid'
    };
  };

  // Enhanced email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email?.trim()) {
      setEmailValidationStatus('invalid');
      return { isValid: false, message: 'Email address is required' };
    }
    
    if (!emailRegex?.test(email)) {
      setEmailValidationStatus('invalid');
      return { isValid: false, message: 'Please enter a valid email address format' };
    }
    
    // Check domain validation
    const domainCheck = validateEmailDomain(email);
    
    if (!domainCheck?.isValid) {
      setEmailValidationStatus('invalid');
      return { isValid: false, message: domainCheck?.message };
    }
    
    setEmailValidationStatus('valid');
    return { isValid: true, message: domainCheck?.message };
  };

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const strength = {
      hasLength: password?.length >= 8,
      hasUpper: /[A-Z]/?.test(password),
      hasLower: /[a-z]/?.test(password),
      hasNumber: /\d/?.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/?.test(password)
    };
    setPasswordStrength(strength);
    return strength;
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailValidation = validateEmail(formData?.email);
    if (!emailValidation?.isValid) {
      newErrors.email = emailValidation?.message;
    }

    // Password validation
    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else {
      const strength = checkPasswordStrength(formData?.password);
      if (!Object.values(strength)?.every(Boolean)) {
        newErrors.password = 'Password does not meet security requirements';
      }
    }

    // Confirm password validation
    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms and privacy validation
    if (!formData?.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the Terms of Service';
    }
    if (!formData?.acceptPrivacy) {
      newErrors.acceptPrivacy = 'You must accept the Privacy Policy';
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

    // Real-time email validation
    if (name === 'email') {
      setEmailValidationStatus('checking');
      setTimeout(() => {
        validateEmail(value);
      }, 500); // Debounce validation
    }

    // Check password strength on password change
    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  // Enhanced error handling for Supabase auth errors
  const handleSupabaseAuthError = (error) => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage?.includes('email address') && errorMessage?.includes('is invalid')) {
      setErrors({ 
        email: `The email address "${formData?.email}" cannot be used for registration. This may be due to domain restrictions or security policies. Please try:
        
        • Using a different email provider (Gmail, Outlook, Yahoo, etc.)
        • Using your work or personal email address
        • Avoiding temporary or disposable email addresses
        
        If you believe this is an error, please contact support.`
      });
    } else if (errorMessage?.includes('already registered') || errorMessage?.includes('already exists')) {
      setErrors({ 
        email: `An account with the email "${formData?.email}" already exists. Please try signing in instead, or use a different email address.` 
      });
    } else if (errorMessage?.includes('email') && errorMessage?.includes('not allowed')) {
      setErrors({ 
        email: `The email domain "${formData?.email?.split('@')?.[1]}" is not allowed for registration. Please use a different email provider such as Gmail, Outlook, or Yahoo.` 
      });
    } else if (errorMessage?.includes('signup') && errorMessage?.includes('disabled')) {
      setErrors({ 
        general: 'New registrations are temporarily disabled due to maintenance. Please try again in a few minutes or contact support for assistance.' 
      });
    } else if (errorMessage?.includes('rate limit') || errorMessage?.includes('too many')) {
      setErrors({ 
        general: 'Too many registration attempts. Please wait a few minutes before trying again.' 
      });
    } else {
      setErrors({ 
        general: `Registration failed: ${error?.message || 'An unexpected error occurred. Please check your information and try again. If the problem persists, contact support.'}`
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const { data, error } = await signUp(
        formData?.email,
        formData?.password,
        {
          data: {
            full_name: formData?.fullName,
            role: 'member'
          }
        }
      );

      if (error) {
        handleSupabaseAuthError(error);
        return;
      }

      // Check if email confirmation is required
      if (data?.user && !data?.session) {
        setRegistrationStep('verification');
      } else {
        setRegistrationStep('success');
        setTimeout(() => {
          navigate('/user-dashboard');
        }, 2000);
      }

    } catch (error) {
      console.error('Registration error:', error);
      handleSupabaseAuthError(error);
    }
  };

  // Registration success component
  const RegistrationSuccess = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
          <p className="text-gray-600">
            Welcome to USMBOK! You have been granted <span className="font-semibold text-blue-600">100,000 trial credits</span> valid for 7 days.
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Your Trial Benefits:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 100k credits for AI consultations</li>
            <li>• Access to all domain assistants</li>
            <li>• Full feature access for 7 days</li>
            <li>• No restrictions during trial period</li>
          </ul>
        </div>
        <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  );

  // Email verification component
  const EmailVerification = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <Mail className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We have sent a confirmation link to <span className="font-semibold">{formData?.email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Please click the link in your email to verify your account and start your 100k credit trial.
          </p>
        </div>
        <div className="space-y-4">
          <Button
            onClick={() => setRegistrationStep('form')}
            variant="outline"
            className="w-full"
          >
            Back to Registration
          </Button>
          <Link 
            to="/login-screen"
            className="block text-center text-blue-600 hover:text-blue-800 text-sm"
          >
            Already verified? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );

  if (registrationStep === 'success') {
    return <RegistrationSuccess />;
  }

  if (registrationStep === 'verification') {
    return <EmailVerification />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join USMBOK</h1>
            <p className="text-gray-600">Create your account and get 100k trial credits</p>
          </div>

          {/* Enhanced Email Guidelines Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">📧 Email Requirements</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>✅ Use personal or business email (Gmail, Outlook, Yahoo)</div>
              <div>❌ Avoid temporary or test email addresses</div>
              <div>❌ Domain restrictions may apply for security</div>
            </div>
          </div>

          {/* Trial Benefits Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 mb-6 text-white">
            <h3 className="font-semibold mb-2">🎉 Welcome Trial Offer</h3>
            <div className="text-sm space-y-1">
              <div>• <strong>100,000 credits</strong> to explore AI consultations</div>
              <div>• <strong>7 days</strong> full access to all features</div>
              <div>• <strong>All domains</strong> available immediately</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors?.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="text-sm whitespace-pre-line">{errors?.general}</div>
              </div>
            )}

            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData?.fullName || ''}
                  onChange={handleInputChange}
                  error={errors?.fullName}
                  className="pl-10"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
              {errors?.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors?.fullName}</p>
              )}
            </div>

            {/* Enhanced Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address (Gmail, Outlook, etc.)"
                  value={formData?.email || ''}
                  onChange={handleInputChange}
                  error={errors?.email}
                  className={`pl-10 pr-10 ${
                    emailValidationStatus === 'valid' ? 'border-green-300 bg-green-50' : 
                    emailValidationStatus === 'invalid' ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                {emailValidationStatus === 'valid' && (
                  <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                )}
                {emailValidationStatus === 'invalid' && (
                  <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 w-4 h-4" />
                )}
              </div>
              
              {/* Email validation feedback */}
              {formData?.email && emailValidationStatus === 'valid' && !errors?.email && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Email address looks good!
                </p>
              )}
              
              {errors?.email && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm whitespace-pre-line">{errors?.email}</p>
                  <div className="mt-2 text-xs text-red-600">
                    <strong>💡 Suggested alternatives:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>Try Gmail: yourname@gmail.com</li>
                      <li>Try Outlook: yourname@outlook.com</li>
                      <li>Use your work email address</li>
                      <li>Contact support if you need help</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData?.password || ''}
                  onChange={handleInputChange}
                  error={errors?.password}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData?.password && (
                <div className="mt-2 space-y-2">
                  <div className="text-xs text-gray-600">Password requirements:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${passwordStrength?.hasLength ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      8+ characters
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength?.hasUpper ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Uppercase
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength?.hasLower ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Lowercase
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength?.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Number
                    </div>
                    <div className={`flex items-center gap-1 ${passwordStrength?.hasSpecial ? 'text-green-600' : 'text-gray-400'} col-span-2`}>
                      <CheckCircle2 className="w-3 h-3" />
                      Special character
                    </div>
                  </div>
                </div>
              )}
              
              {errors?.password && (
                <p className="text-red-500 text-sm mt-1">{errors?.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData?.confirmPassword || ''}
                  onChange={handleInputChange}
                  error={errors?.confirmPassword}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors?.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors?.confirmPassword}</p>
              )}
            </div>

            {/* Terms and Privacy Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData?.acceptTerms || false}
                  onChange={handleInputChange}
                  className="mt-0.5"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700 leading-5">
                  I accept the{' '}
                  <Link to="/terms" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                    Terms of Service
                  </Link>
                </label>
              </div>
              {errors?.acceptTerms && (
                <p className="text-red-500 text-sm ml-6">{errors?.acceptTerms}</p>
              )}

              <div className="flex items-start gap-3">
                <Checkbox
                  id="acceptPrivacy"
                  name="acceptPrivacy"
                  checked={formData?.acceptPrivacy || false}
                  onChange={handleInputChange}
                  className="mt-0.5"
                />
                <label htmlFor="acceptPrivacy" className="text-sm text-gray-700 leading-5">
                  I accept the{' '}
                  <Link to="/privacy" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors?.acceptPrivacy && (
                <p className="text-red-500 text-sm ml-6">{errors?.acceptPrivacy}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || emailValidationStatus === 'invalid'}
              className={`w-full py-3 ${
                emailValidationStatus === 'invalid' ?'bg-gray-400 cursor-not-allowed' :'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
              } text-white`}
            >
              {loading ? 'Creating Account...' : 'Create Account & Start Trial'}
            </Button>
            
            {emailValidationStatus === 'invalid' && (
              <p className="text-center text-sm text-red-600">
                Please fix the email address before continuing
              </p>
            )}
          </form>

          {/* Sign In Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link 
                to="/login-screen" 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen;