import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Mail, Bell, Settings, Send, Clock, CheckCircle, AlertTriangle, User } from 'lucide-react';
import Button from '../../../components/ui/Button';

const NotificationCenter = ({ userId, isAdmin = false }) => {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    warningDays: 3,
    finalWarningDays: 1,
    reminderInterval: 24, // hours
    includeUsageStats: true
  });

  const notificationTemplates = [
    {
      id: 'trial_warning',
      name: 'Trial Warning (3 days)',
      subject: 'Your trial expires in 3 days',
      preview: 'Hi there! Just a friendly reminder that your trial expires soon...',
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />
    },
    {
      id: 'trial_final',
      name: 'Final Warning (1 day)',
      subject: 'Last day of your trial!',
      preview: 'This is your final reminder - your trial expires tomorrow...',
      type: 'urgent',
      icon: <Clock className="w-4 h-4 text-red-500" />
    },
    {
      id: 'trial_expired',
      name: 'Trial Expired',
      subject: 'Your trial has expired',
      preview: 'Your trial period has ended. Upgrade now to continue...',
      type: 'expired',
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />
    },
    {
      id: 'upgrade_success',
      name: 'Upgrade Success',
      subject: 'Welcome to your new plan!',
      preview: 'Thank you for upgrading! Your new plan is now active...',
      type: 'success',
      icon: <CheckCircle className="w-4 h-4 text-green-500" />
    }
  ];

  // Fetch notification history
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase?.from('user_notifications')?.select(`
          id,
          type,
          title,
          message,
          sent_at,
          read_at,
          user_profiles (
            full_name,
            email
          )
        `)?.eq(isAdmin ? 'type' : 'user_id', isAdmin ? 'trial_notification' : userId)?.order('sent_at', { ascending: false })?.limit(50);

      if (error && error?.code !== 'PGRST116') {
        throw error;
      }

      setNotifications(data || []);
    } catch (err) {
      console?.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Send notification
  const sendNotification = async (templateId, targetUserId = null) => {
    try {
      setLoading(true);
      
      const template = notificationTemplates?.find(t => t?.id === templateId);
      if (!template) throw new Error('Template not found');

      const { error } = await supabase?.rpc('send_trial_notification', {
        user_id: targetUserId || userId,
        notification_type: templateId,
        custom_message: null
      });

      if (error) throw error;

      await fetchNotifications();
      alert('Notification sent successfully!');
    } catch (err) {
      console?.error('Error sending notification:', err);
      alert(`Failed to send notification: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk send notifications
  const sendBulkNotifications = async (userIds, templateId) => {
    try {
      setLoading(true);
      
      const promises = userIds?.map(userId => 
        supabase?.rpc('send_trial_notification', {
          user_id: userId,
          notification_type: templateId,
          custom_message: null
        })
      );

      const results = await Promise?.allSettled(promises);
      const successful = results?.filter(r => r?.status === 'fulfilled')?.length;
      const failed = results?.filter(r => r?.status === 'rejected')?.length;

      await fetchNotifications();
      alert(`Sent ${successful} notifications successfully. ${failed} failed.`);
    } catch (err) {
      console?.error('Error sending bulk notifications:', err);
      alert(`Failed to send notifications: ${err?.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Update notification settings
  const updateSettings = async () => {
    try {
      const { error } = await supabase?.from('notification_settings')?.upsert({
          user_id: userId,
          ...settings,
          updated_at: new Date()?.toISOString()
        });

      if (error) throw error;
      alert('Settings updated successfully!');
    } catch (err) {
      console?.error('Error updating settings:', err);
      alert(`Failed to update settings: ${err?.message}`);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, isAdmin]);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notification Center
        </h3>
      </div>

      <div className="p-6">
        {/* Notification Templates (Admin View) */}
        {isAdmin && (
          <div className="mb-8">
            <h4 className="text-md font-semibold mb-4">Quick Send Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notificationTemplates?.map((template) => (
                <div key={template?.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {template?.icon}
                    <h5 className="font-medium">{template?.name}</h5>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template?.subject}</p>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {template?.preview}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendNotification(template?.id, userId)}
                    disabled={loading}
                    className="w-full"
                  >
                    <Send className="w-3 h-3 mr-2" />
                    Send Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification Settings */}
        <div className="mb-8">
          <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Notification Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.emailEnabled}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      emailEnabled: e?.target?.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Email Notifications</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Receive trial expiration notifications via email
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings?.includeUsageStats}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      includeUsageStats: e?.target?.checked
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm font-medium">Include Usage Statistics</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Add usage data and recommendations to notifications
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warning Days Before Expiration
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={settings?.warningDays}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    warningDays: parseInt(e?.target?.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Warning Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="3"
                  value={settings?.finalWarningDays}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    finalWarningDays: parseInt(e?.target?.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={updateSettings}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Settings
            </Button>
          </div>
        </div>

        {/* Notification History */}
        <div>
          <h4 className="text-md font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Recent Notifications
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {notifications?.length}
            </span>
          </h4>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading && notifications?.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : notifications?.length > 0 ? (
              notifications?.map((notification) => (
                <div key={notification?.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        notification?.type === 'success' ? 'bg-green-100' :
                        notification?.type === 'warning' ? 'bg-yellow-100' :
                        notification?.type === 'urgent'? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        <Mail className={`w-4 h-4 ${
                          notification?.type === 'success' ? 'text-green-600' :
                          notification?.type === 'warning' ? 'text-yellow-600' :
                          notification?.type === 'urgent'? 'text-red-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">
                          {notification?.title}
                        </h5>
                        {isAdmin && notification?.user_profiles && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <User className="w-3 h-3" />
                            <span>{notification?.user_profiles?.full_name}</span>
                            <span className="text-gray-400">•</span>
                            <span>{notification?.user_profiles?.email}</span>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notification?.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>
                            Sent {new Date(notification?.sent_at)?.toLocaleDateString()}
                          </span>
                          {notification?.read_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p>No notifications yet</p>
                <p className="text-sm">Notifications will appear here when sent</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;