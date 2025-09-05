import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserCredit } from '../../contexts/UserCreditContext';
import Button from '../../components/ui/Button';
import { LogOut, Shield, Clock, CreditCard, MessageSquare, CheckCircle2, AlertTriangle, Loader, ArrowLeft } from 'lucide-react';

const LogoutConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, loading: authLoading, user } = useAuth();
  const { balance, credits } = useUserCredit();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/login-screen', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Get session info
  const sessionInfo = {
    credits: balance || 0,
    accountType: credits?.role || user?.user_metadata?.role || 'member',
    lastActivity: new Date()?.toLocaleTimeString(),
    unsavedChanges: location?.state?.unsavedChanges || false
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Logout error:', error);
        // Still try to redirect even if there's an error
      }

      setShowSuccess(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/login-screen', { 
          replace: true,
          state: { 
            message: 'You have been successfully logged out. Thank you for using USMBOK!' 
          }
        });
      }, 2000);

    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: navigate anyway
      navigate('/login-screen', { 
        replace: true,
        state: { 
          message: 'Session ended. Please log in again.' 
        }
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    const returnTo = location?.state?.returnTo || '/user-dashboard';
    navigate(returnTo, { replace: true });
  };

  // Success screen
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Logged Out Successfully</h2>
          <p className="text-gray-600 mb-4">
            Your session has been securely terminated. Redirecting you to the login screen...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader className="w-4 h-4 animate-spin" />
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40" />
      
      <div className="relative z-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Confirm Logout</h1>
            <p className="text-gray-600">
              Are you sure you want to end your current session?
            </p>
          </div>

          {/* Session Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">Current Session Details</h3>
            
            {/* Credit Balance */}
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Credit Balance: {sessionInfo?.credits?.toLocaleString() || '0'} credits
                </p>
                <p className="text-xs text-gray-500">
                  Your credits will be preserved for your next session
                </p>
              </div>
            </div>

            {/* Account Type */}
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Account: {sessionInfo?.accountType === 'admin' ? 'Admin' : 
                           sessionInfo?.accountType === 'premium' ? 'Premium' : 'Member'}
                </p>
                {sessionInfo?.accountType === 'member' && sessionInfo?.credits >= 100000 && (
                  <p className="text-xs text-green-600">
                    ✓ Free trial active with 100k credits
                  </p>
                )}
              </div>
            </div>

            {/* Auto-save Notice */}
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Conversations Auto-saved
                </p>
                <p className="text-xs text-gray-500">
                  All your chat history will be available when you return
                </p>
              </div>
            </div>

            {/* Session Time */}
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  Last Activity: {sessionInfo?.lastActivity}
                </p>
                <p className="text-xs text-gray-500">
                  Session will be securely terminated
                </p>
              </div>
            </div>
          </div>

          {/* Warning for unsaved changes */}
          {sessionInfo?.unsavedChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Unsaved Changes Detected</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                You may have unsaved work. Your progress will be automatically saved.
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2 text-blue-800 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Security Notice</span>
            </div>
            <p className="text-xs text-blue-700">
              Logging out will immediately invalidate your session tokens and clear all stored credentials for maximum security.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
              disabled={isLoggingOut}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Stay Logged In
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="flex-1"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Logging out...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Confirm Logout
                </div>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              You can log back in anytime to continue your AI consultations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;