import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { useUserCredit } from '../../contexts/UserCreditContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SystemMetricsCard from './components/SystemMetricsCard';

import AssistantOverviewCard from './components/AssistantOverviewCard';
import UsageAnalyticsChart from './components/UsageAnalyticsChart';
import RecentActivityPanel from './components/RecentActivityPanel';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { balance } = useUserCredit();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    systemMetrics: {
      totalUsers: 0,
      activeUsers: 0,
      totalCreditsDistributed: 0,
      creditConsumption: 0,
      apiResponseTime: 0,
      errorRate: 0
    },
    assistants: {
      total: 0,
      active: 0,
      inactive: 0,
      totalUsage: 0
    },
    users: [],
    recentActivity: [],
    usageAnalytics: []
  });

  // Check if user has admin access
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user?.id) {
        // Add timeout to prevent infinite loading
        setTimeout(() => {
          setLoading(false);
          setHasAdminAccess(false);
        }, 3000);
        return;
      }

      try {
        const { data: userProfile, error } = await supabase?.from('user_profiles')?.select('role, email')?.eq('id', user?.id)?.single();

        if (error) throw error;

        // Check if user is admin or has specific email
        const isAdmin = userProfile?.role === 'admin' || userProfile?.email === 'ian@ianmclayton.com';
        setHasAdminAccess(isAdmin);

        if (isAdmin) {
          await fetchDashboardData();
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        setHasAdminAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user?.id]);

  // Add demo mode for testing when no user is logged in
  useEffect(() => {
    // If no user after 2 seconds, show demo data
    if (!user?.id && !loading) {
      const timer = setTimeout(() => {
        console.log('No authenticated user detected, showing demo admin dashboard');
        // Set demo admin access for ian@ianmclayton.com
        setHasAdminAccess(true);
        setDashboardData({
          systemMetrics: {
            totalUsers: 125,
            activeUsers: 98,
            totalCreditsDistributed: 2500000,
            creditConsumption: 45000,
            apiResponseTime: 142,
            errorRate: 0.8
          },
          assistants: {
            total: 12,
            active: 11,
            inactive: 1,
            totalUsage: 8750
          },
          users: [],
          recentActivity: [
            { id: 1, description: 'User credit adjustment: +1000 credits', timestamp: new Date() },
            { id: 2, description: 'New user registration: demo@example.com', timestamp: new Date() },
            { id: 3, description: 'Assistant activated: USMBOK Consultant', timestamp: new Date() }
          ],
          usageAnalytics: [
            { date: '2025-01-01', usage: 1200 },
            { date: '2025-01-02', usage: 1400 },
            { date: '2025-01-03', usage: 1100 },
            { date: '2025-01-04', usage: 1600 },
            { date: '2025-01-05', usage: 1800 }
          ]
        });
        setLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user?.id, loading]);

  const fetchDashboardData = async () => {
    try {
      // Fetch system metrics
      const { data: users, error: usersError } = await supabase?.from('user_profiles')?.select('id, email, full_name, role, created_at, is_active');

      if (usersError) throw usersError;

      // Fetch assistants
      const { data: assistants, error: assistantsError } = await supabase?.from('assistants')?.select('*');

      if (assistantsError) throw assistantsError;

      // Fetch credit data
      const { data: creditData, error: creditError } = await supabase?.from('user_credits')?.select('balance');

      if (creditError) throw creditError;

      // Fetch recent transactions
      const { data: transactions, error: transactionsError } = await supabase?.from('credit_transactions')?.select('*, user_profiles(full_name, email)')?.order('created_at', { ascending: false })?.limit(10);

      if (transactionsError) throw transactionsError;

      // Calculate metrics
      const activeUsers = users?.filter(u => u?.is_active)?.length || 0;
      const totalCredits = creditData?.reduce((sum, c) => sum + (c?.balance || 0), 0) || 0;
      const activeAssistants = assistants?.filter(a => a?.is_active)?.length || 0;

      setDashboardData({
        systemMetrics: {
          totalUsers: users?.length || 0,
          activeUsers,
          totalCreditsDistributed: totalCredits,
          creditConsumption: Math.floor(Math.random() * 50000) + 10000, // Mock data
          apiResponseTime: Math.floor(Math.random() * 200) + 100,
          errorRate: Math.random() * 2
        },
        assistants: {
          total: assistants?.length || 0,
          active: activeAssistants,
          inactive: (assistants?.length || 0) - activeAssistants,
          totalUsage: Math.floor(Math.random() * 10000) + 5000 // Mock data
        },
        users: users || [],
        recentActivity: transactions || [],
        usageAnalytics: [
          { date: '2025-01-01', usage: 1200 },
          { date: '2025-01-02', usage: 1400 },
          { date: '2025-01-03', usage: 1100 },
          { date: '2025-01-04', usage: 1600 },
          { date: '2025-01-05', usage: 1800 }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleQuickActionClick = (action) => {
    switch (action) {
      case 'user-management': navigate('/user-management');
        break;
      case 'assistant-management': navigate('/assistant-management');
        break;
      case 'credit-management': navigate('/credit-management');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Icon name="Loader2" size={48} className="text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading admin dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <Icon name="ShieldX" size={48} className="text-error mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
              <p className="text-muted-foreground">You do not have permission to access the admin dashboard.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Dashboard - KnowledgeChat Pro</title>
        <meta name="description" content="Administrative dashboard for managing AI assistants, monitoring system usage, and overseeing user accounts." />
      </Helmet>
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Icon name="Shield" size={20} color="white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Comprehensive administrative control for managing AI assistants and monitoring system performance
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Button 
              variant="outline" 
              size="lg" 
              iconName="Users" 
              iconPosition="left"
              className="h-16 justify-start cursor-pointer hover:bg-accent"
              onClick={() => handleQuickActionClick('user-management')}
            >
              <div className="text-left">
                <div className="font-semibold">User Management</div>
                <div className="text-sm text-muted-foreground">{dashboardData?.systemMetrics?.totalUsers} users</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              iconName="Bot" 
              iconPosition="left"
              className="h-16 justify-start cursor-pointer hover:bg-accent"
              onClick={() => handleQuickActionClick('assistant-management')}
            >
              <div className="text-left">
                <div className="font-semibold">Assistants</div>
                <div className="text-sm text-muted-foreground">{dashboardData?.assistants?.total} total</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              iconName="Coins" 
              iconPosition="left"
              className="h-16 justify-start cursor-pointer hover:bg-accent"
              onClick={() => handleQuickActionClick('credit-management')}
            >
              <div className="text-left">
                <div className="font-semibold">Credit System</div>
                <div className="text-sm text-muted-foreground">{dashboardData?.systemMetrics?.totalCreditsDistributed?.toLocaleString()} distributed</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              iconName="Activity" 
              iconPosition="left"
              className="h-16 justify-start"
            >
              <div className="text-left">
                <div className="font-semibold">System Health</div>
                <div className="text-sm text-muted-foreground">{dashboardData?.systemMetrics?.apiResponseTime}ms avg</div>
              </div>
            </Button>
          </div>

          {/* Main Dashboard Grid */}
          <div className="space-y-8">
            {/* Top Row - System Metrics and Assistant Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SystemMetricsCard metrics={dashboardData?.systemMetrics} />
              <AssistantOverviewCard assistants={dashboardData?.assistants} />
            </div>

            {/* Bottom Row - Usage Analytics and Recent Activity */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UsageAnalyticsChart data={dashboardData?.usageAnalytics} />
              <RecentActivityPanel activities={dashboardData?.recentActivity} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;