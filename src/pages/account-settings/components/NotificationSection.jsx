import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const NotificationSection = () => {
  const [notifications, setNotifications] = useState({
    email: {
      creditThreshold: true,
      billingReminders: true,
      featureUpdates: false,
      securityAlerts: true,
      weeklyDigest: true,
      promotionalOffers: false
    },
    push: {
      creditThreshold: true,
      billingReminders: false,
      securityAlerts: true,
      sessionReminders: true
    },
    sms: {
      securityAlerts: true,
      billingReminders: false
    }
  });

  const [preferences, setPreferences] = useState({
    creditThresholdLevel: '500',
    digestFrequency: 'weekly',
    timezone: 'America/New_York'
  });

  const [isSaving, setIsSaving] = useState(false);

  const timezoneOptions = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' }
  ];

  const digestFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'never', label: 'Never' }
  ];

  const creditThresholdOptions = [
    { value: '100', label: '100 credits remaining' },
    { value: '250', label: '250 credits remaining' },
    { value: '500', label: '500 credits remaining' },
    { value: '1000', label: '1,000 credits remaining' }
  ];

  const handleNotificationChange = (category, type, value) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev?.[category],
        [type]: value
      }
    }));
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Notification settings saved:', { notifications, preferences });
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const notificationCategories = [
    {
      id: 'email',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: 'Mail',
      settings: [
        { key: 'creditThreshold', label: 'Credit threshold alerts', description: 'When your credits are running low' },
        { key: 'billingReminders', label: 'Billing reminders', description: 'Payment due dates and invoice notifications' },
        { key: 'featureUpdates', label: 'Feature updates', description: 'New features and product announcements' },
        { key: 'securityAlerts', label: 'Security alerts', description: 'Login attempts and security-related events' },
        { key: 'weeklyDigest', label: 'Weekly digest', description: 'Summary of your activity and usage' },
        { key: 'promotionalOffers', label: 'Promotional offers', description: 'Special deals and discounts' }
      ]
    },
    {
      id: 'push',
      title: 'Push Notifications',
      description: 'Browser notifications when using the app',
      icon: 'Bell',
      settings: [
        { key: 'creditThreshold', label: 'Credit threshold alerts', description: 'When your credits are running low' },
        { key: 'billingReminders', label: 'Billing reminders', description: 'Payment due dates' },
        { key: 'securityAlerts', label: 'Security alerts', description: 'Important security events' },
        { key: 'sessionReminders', label: 'Session reminders', description: 'Reminders about active sessions' }
      ]
    },
    {
      id: 'sms',
      title: 'SMS Notifications',
      description: 'Text messages to your phone',
      icon: 'MessageSquare',
      settings: [
        { key: 'securityAlerts', label: 'Security alerts', description: 'Critical security notifications only' },
        { key: 'billingReminders', label: 'Billing reminders', description: 'Payment due notifications' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Notification Preferences */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Notification Preferences</h3>
          <p className="text-sm text-muted-foreground">
            Configure how and when you want to receive notifications
          </p>
        </div>

        <div className="space-y-6">
          {/* Global Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <Select
              label="Credit Threshold Alert"
              options={creditThresholdOptions}
              value={preferences?.creditThresholdLevel}
              onChange={(value) => handlePreferenceChange('creditThresholdLevel', value)}
              description="Get notified when credits reach this level"
            />
            
            <Select
              label="Digest Frequency"
              options={digestFrequencyOptions}
              value={preferences?.digestFrequency}
              onChange={(value) => handlePreferenceChange('digestFrequency', value)}
              description="How often to receive activity summaries"
            />
            
            <Select
              label="Timezone"
              options={timezoneOptions}
              value={preferences?.timezone}
              onChange={(value) => handlePreferenceChange('timezone', value)}
              description="For scheduling notifications"
              searchable
            />
          </div>

          {/* Notification Categories */}
          {notificationCategories?.map((category) => (
            <div key={category?.id} className="border border-border rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={category?.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-card-foreground">{category?.title}</h4>
                  <p className="text-sm text-muted-foreground">{category?.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {category?.settings?.map((setting) => (
                  <Checkbox
                    key={setting?.key}
                    label={setting?.label}
                    description={setting?.description}
                    checked={notifications?.[category?.id]?.[setting?.key]}
                    onChange={(e) => handleNotificationChange(category?.id, setting?.key, e?.target?.checked)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">
            Manage all notifications at once
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            iconName="Bell"
            iconPosition="left"
            onClick={() => {
              const allEnabled = { ...notifications };
              Object.keys(allEnabled)?.forEach(category => {
                Object.keys(allEnabled?.[category])?.forEach(setting => {
                  allEnabled[category][setting] = true;
                });
              });
              setNotifications(allEnabled);
            }}
          >
            Enable All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="BellOff"
            iconPosition="left"
            onClick={() => {
              const allDisabled = { ...notifications };
              Object.keys(allDisabled)?.forEach(category => {
                Object.keys(allDisabled?.[category])?.forEach(setting => {
                  allDisabled[category][setting] = false;
                });
              });
              setNotifications(allDisabled);
            }}
          >
            Disable All
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            iconName="RotateCcw"
            iconPosition="left"
            onClick={() => {
              // Reset to default settings
              setNotifications({
                email: {
                  creditThreshold: true,
                  billingReminders: true,
                  featureUpdates: false,
                  securityAlerts: true,
                  weeklyDigest: true,
                  promotionalOffers: false
                },
                push: {
                  creditThreshold: true,
                  billingReminders: false,
                  securityAlerts: true,
                  sessionReminders: true
                },
                sms: {
                  securityAlerts: true,
                  billingReminders: false
                }
              });
            }}
          >
            Reset to Default
          </Button>
        </div>
      </div>
      {/* Save Settings */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
        <Button
          variant="default"
          loading={isSaving}
          iconName="Save"
          iconPosition="left"
          onClick={handleSaveSettings}
        >
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationSection;