import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const SecuritySection = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSessions, setShowSessions] = useState(false);

  // Mock session data
  const activeSessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'New York, NY',
      ipAddress: '192.168.1.100',
      lastActive: '2025-01-02T18:45:00Z',
      current: true
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'New York, NY',
      ipAddress: '192.168.1.101',
      lastActive: '2025-01-02T16:30:00Z',
      current: false
    },
    {
      id: 3,
      device: 'Firefox on MacOS',
      location: 'Boston, MA',
      ipAddress: '10.0.0.50',
      lastActive: '2025-01-01T14:20:00Z',
      current: false
    }
  ];

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (passwordErrors?.[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!passwordForm?.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm?.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm?.newPassword?.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordForm?.newPassword !== passwordForm?.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;

    setIsChangingPassword(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTerminateSession = (sessionId) => {
    console.log('Terminating session:', sessionId);
  };

  const formatLastActive = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Active now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date?.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Change Password</h3>
          <p className="text-sm text-muted-foreground">
            Update your password to keep your account secure
          </p>
        </div>

        <div className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={passwordForm?.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e?.target?.value)}
            error={passwordErrors?.currentPassword}
            required
          />
          
          <Input
            label="New Password"
            type="password"
            value={passwordForm?.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
            error={passwordErrors?.newPassword}
            description="Must be at least 8 characters long"
            required
          />
          
          <Input
            label="Confirm New Password"
            type="password"
            value={passwordForm?.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
            error={passwordErrors?.confirmPassword}
            required
          />

          <Button
            variant="default"
            loading={isChangingPassword}
            iconName="Lock"
            iconPosition="left"
            onClick={handlePasswordSubmit}
          >
            Update Password
          </Button>
        </div>
      </div>
      {/* Two-Factor Authentication */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              twoFactorEnabled 
                ? 'bg-success/10 text-success' :'bg-muted text-muted-foreground'
            }`}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <Checkbox
            label="Enable Two-Factor Authentication"
            description="Require a verification code from your phone in addition to your password"
            checked={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e?.target?.checked)}
          />

          {twoFactorEnabled && (
            <div className="ml-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Scan the QR code with your authenticator app or enter the setup key manually.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" size="sm" iconName="QrCode">
                  Show QR Code
                </Button>
                <Button variant="outline" size="sm" iconName="Key">
                  Show Setup Key
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Active Sessions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Active Sessions</h3>
            <p className="text-sm text-muted-foreground">
              Manage your active sessions across different devices
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            iconName={showSessions ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            onClick={() => setShowSessions(!showSessions)}
          >
            {showSessions ? 'Hide' : 'Show'} Sessions
          </Button>
        </div>

        {showSessions && (
          <div className="space-y-4">
            {activeSessions?.map((session) => (
              <div
                key={session?.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name="Monitor" size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-card-foreground">
                        {session?.device}
                      </p>
                      {session?.current && (
                        <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {session?.location} • {session?.ipAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatLastActive(session?.lastActive)}
                    </p>
                  </div>
                </div>
                
                {!session?.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="X"
                    onClick={() => handleTerminateSession(session?.id)}
                  >
                    Terminate
                  </Button>
                )}
              </div>
            ))}
            
            <div className="pt-4 border-t border-border">
              <Button
                variant="destructive"
                size="sm"
                iconName="LogOut"
                iconPosition="left"
              >
                Terminate All Other Sessions
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySection;