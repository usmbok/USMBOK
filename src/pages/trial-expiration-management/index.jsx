import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useUserCredit } from '../../contexts/UserCreditContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { ChevronRight, Clock, AlertTriangle, CreditCard, Users, Calendar, TrendingUp, Settings, Mail, User, CheckCircle, XCircle } from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';

const TrialExpirationManagement = () => {
  const { user } = useAuth();
  const { credits, loading: creditsLoading, getDailyUsage, getDaysRemaining } = useUserCredit();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trialUsers, setTrialUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSubscription, setUserSubscription] = useState(null);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [usageAnalytics, setUsageAnalytics] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    warningDays: 3,
    finalWarningDays: 1
  });

  // Fetch trial users (admin only)
  const fetchTrialUsers = async () => {
    try {
      const { data: subscriptions, error: subError } = await supabase?.from('user_subscriptions')?.select(`
          id,
          plan,
          is_active,
          created_at,
          credits_per_month,
          user_id,
          user_profiles!inner (
            id,
            email,
            full_name,
            role,
            created_at
          )
        `)?.eq('plan', 'trial')?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (subError) throw subError;

      // Calculate trial expiration for each user
      const usersWithExpiration = await Promise?.all(
        subscriptions?.map(async (sub) => {
          const trialStartDate = new Date(sub?.created_at);
          const trialEndDate = addDays(trialStartDate, 7); // 7-day trial
          const daysLeft = differenceInDays(trialEndDate, new Date());

          try {
            const { data: creditData } = await supabase?.from('user_credits')?.select('balance')?.eq('user_id', sub?.user_id)?.single();

            const usageResult = await supabase?.rpc('get_daily_credit_usage', {
              user_uuid: sub?.user_id,
              days_back: 7
            });

            return {
              ...sub,
              trialEndDate,
              daysLeft: Math?.max(0, daysLeft),
              isExpired: daysLeft < 0,
              creditsRemaining: creditData?.balance || 0,
              avgDailyUsage: usageResult?.data || 0
            };
          } catch (err) {
            console?.warn('Error fetching user analytics:', err);
            return {
              ...sub,
              trialEndDate,
              daysLeft: Math?.max(0, daysLeft),
              isExpired: daysLeft < 0,
              creditsRemaining: 0,
              avgDailyUsage: 0
            };
          }
        }) || []
      );

      setTrialUsers(usersWithExpiration);
    } catch (err) {
      console?.error('Error fetching trial users:', err);
      setError(err?.message);
    }
  };

  // Fetch current user's trial data
  const fetchUserTrialData = async () => {
    if (!user?.id) return;

    try {
      // Get user subscription
      const { data: subscription, error: subError } = await supabase?.from('user_subscriptions')?.select('*')?.eq('user_id', user?.id)?.eq('is_active', true)?.single();

      if (subError && subError?.code !== 'PGRST116') {
        throw subError;
      }

      setUserSubscription(subscription);

      if (subscription?.plan === 'trial') {
        // Calculate trial metrics
        const trialStartDate = new Date(subscription?.created_at);
        const trialEndDate = addDays(trialStartDate, 7);
        const daysLeft = differenceInDays(trialEndDate, new Date());
        
        setDaysRemaining(Math?.max(0, daysLeft));

        // Get usage analytics for the past 7 days
        const usagePromises = Array?.from({ length: 7 }, async (_, i) => {
          const date = addDays(new Date(), -i);
          const { data: usage } = await supabase?.rpc('get_daily_credit_usage', {
            user_uuid: user?.id,
            days_back: 1
          });

          return {
            date: format(date, 'MMM dd'),
            usage: usage || 0,
            remaining: credits?.balance || 0
          };
        });

        const analytics = await Promise?.all(usagePromises);
        setUsageAnalytics(analytics?.reverse());

        // Get average daily usage
        if (getDailyUsage) {
          const avgUsage = await getDailyUsage(7);
          setDailyUsage(avgUsage);
        }
      }
    } catch (err) {
      console?.error('Error fetching user trial data:', err);
      setError(err?.message);
    }
  };

  // Check user role and fetch appropriate data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user?.id) return;

        // Check user role
        const { data: profile, error: profileError } = await supabase?.from('user_profiles')?.select('role')?.eq('id', user?.id)?.single();

        if (profileError) throw profileError;

        // Admin users can see all trial users
        if (profile?.role === 'admin') {
          await fetchTrialUsers();
        }

        // All users can see their own trial data
        await fetchUserTrialData();

      } catch (err) {
        console?.error('Error initializing data:', err);
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [user?.id, credits?.balance]);

  // Extend trial (admin only)
  const extendTrial = async (userId, additionalDays = 7) => {
    try {
      // Update subscription end date
      const { error } = await supabase?.rpc('extend_trial', {
        user_id: userId,
        additional_days: additionalDays
      });

      if (error) throw error;

      // Refresh data
      await fetchTrialUsers();
      
      alert(`Trial extended by ${additionalDays} days successfully!`);
    } catch (err) {
      console?.error('Error extending trial:', err);
      alert(`Failed to extend trial: ${err?.message}`);
    }
  };

  // Send notification
  const sendNotification = async (userId, type = 'warning') => {
    try {
      const { error } = await supabase?.rpc('send_trial_notification', {
        user_id: userId,
        notification_type: type
      });

      if (error) throw error;
      
      alert('Notification sent successfully!');
    } catch (err) {
      console?.error('Error sending notification:', err);
      alert(`Failed to send notification: ${err?.message}`);
    }
  };

  // Suspend expired trial
  const suspendTrialUser = async (userId) => {
    try {
      const { error } = await supabase?.from('user_subscriptions')?.update({ is_active: false })?.eq('user_id', userId)?.eq('plan', 'trial');

      if (error) throw error;

      // Refresh data
      await fetchTrialUsers();
      
      alert('User trial suspended successfully!');
    } catch (err) {
      console?.error('Error suspending user:', err);
      alert(`Failed to suspend user: ${err?.message}`);
    }
  };

  if (loading || creditsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window?.location?.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = trialUsers?.length > 0;
  const isTrialUser = userSubscription?.plan === 'trial';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trial Expiration Management
          </h1>
          <p className="text-gray-600">
            Monitor trial periods, track usage, and manage subscription conversions
          </p>
        </div>

        {/* User's Own Trial Status (for trial users) */}
        {isTrialUser && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Trial Status</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="text-lg">
                        {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Trial expired'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      <span>{credits?.balance?.toLocaleString() || 0} credits left</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{Math?.max(0, daysRemaining)}</div>
                  <div className="text-blue-200">Days Left</div>
                </div>
              </div>

              {daysRemaining <= 3 && daysRemaining > 0 && (
                <div className="mt-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-300" />
                    <span className="font-medium">Trial Ending Soon!</span>
                  </div>
                  <p className="mt-1 text-yellow-100">
                    Your trial expires in {daysRemaining} days. Upgrade now to continue using all features.
                  </p>
                </div>
              )}

              {daysRemaining <= 0 && (
                <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-300" />
                    <span className="font-medium">Trial Expired</span>
                  </div>
                  <p className="mt-1 text-red-100">
                    Your trial has expired. Upgrade to a paid plan to restore access.
                  </p>
                </div>
              )}
            </div>

            {/* Usage Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Usage Pattern
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Daily Average</span>
                    <span className="font-medium">{dailyUsage?.toLocaleString() || 0} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Projected Days Left</span>
                    <span className="font-medium">
                      {dailyUsage > 0 ? Math?.floor((credits?.balance || 0) / dailyUsage) : '∞'} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Usage Efficiency</span>
                    <span className="font-medium text-green-600">
                      {dailyUsage > 0 ? Math?.round(((credits?.balance || 0) / 100000) * 100) : 100}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  Conversion Options
                </h3>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                    onClick={() => window.location.href = '/credit-management'}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade to Subscriber (1M credits/month)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.location.href = '/credit-management'}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Upgrade to Founder (5M credits/month)
                  </Button>
                </div>
                <div className="mt-4 text-sm text-gray-500 text-center">
                  <p>All plans include unlimited features</p>
                  <p>30-day money-back guarantee</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Trials</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {trialUsers?.filter(user => !user?.isExpired)?.length || 0}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {trialUsers?.filter(user => user?.daysLeft <= 3 && user?.daysLeft > 0)?.length || 0}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Expired</p>
                    <p className="text-2xl font-bold text-red-600">
                      {trialUsers?.filter(user => user?.isExpired)?.length || 0}
                    </p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {trialUsers?.length > 0 ? Math?.round((trialUsers?.filter(user => user?.isExpired)?.length / trialUsers?.length) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Trial Users List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  Trial Users Management
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trial Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trialUsers?.map((user) => (
                      <tr key={user?.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user?.user_profiles?.full_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user?.user_profiles?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {user?.isExpired ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : user?.daysLeft <= 3 ? (
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span className={`text-sm font-medium ${
                              user?.isExpired ? 'text-red-600' :
                              user?.daysLeft <= 3 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {user?.isExpired ? 'Expired' : `${user?.daysLeft} days left`}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Started {format(new Date(user?.created_at), 'MMM dd, yyyy')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user?.creditsRemaining?.toLocaleString()} credits left
                          </div>
                          <div className="text-xs text-gray-500">
                            ~{user?.avgDailyUsage?.toLocaleString()} daily usage
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => extendTrial(user?.user_id, 7)}
                            >
                              Extend Trial
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendNotification(user?.user_id, user?.daysLeft <= 1 ? 'final' : 'warning')}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Notify
                            </Button>
                            {user?.isExpired && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => suspendTrialUser(user?.user_id)}
                              >
                                Suspend
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {trialUsers?.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Trial Users</h3>
                    <p className="text-gray-500">No active trial users found.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Notification Settings
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings?.emailNotifications}
                        onChange={(e) => setNotificationSettings(prev => ({
                          ...prev,
                          emailNotifications: e?.target?.checked
                        }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">Email Notifications</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">Send automated email notifications</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warning Days
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={notificationSettings?.warningDays}
                      onChange={(e) => setNotificationSettings(prev => ({
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
                      value={notificationSettings?.finalWarningDays}
                      onChange={(e) => setNotificationSettings(prev => ({
                        ...prev,
                        finalWarningDays: parseInt(e?.target?.value)
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Non-trial users message */}
        {!isTrialUser && !isAdmin && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              You're not on a trial plan
            </h2>
            <p className="text-blue-600 mb-4">
              This page is for managing trial periods and conversions. You're currently using a paid plan.
            </p>
            <Button
              onClick={() => {
                if (window?.location) {
                  window.location.href = '/account-settings';
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Manage Your Subscription
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialExpirationManagement;