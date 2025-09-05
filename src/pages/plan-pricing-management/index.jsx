import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';

import { Settings, DollarSign, TrendingUp, Users, BarChart3, AlertTriangle, Save } from 'lucide-react';
import PricingTable from './components/PricingTable';
import ImpactAnalysis from './components/ImpactAnalysis';
import PricingHistory from './components/PricingHistory';
import SimulationPanel from './components/SimulationPanel';

const PlanPricingManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);
  const [pricingHistory, setPricingHistory] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkAdminAccess();
      fetchPricingData();
    }
  }, [user?.id]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('role')?.eq('id', user?.id)?.single();

      if (error) throw error;
      
      const adminAccess = data?.role === 'admin';
      setIsAdmin(adminAccess);
      
      if (!adminAccess) {
        setError('Access denied. Administrator privileges required.');
        setLoading(false);
        return;
      }
    } catch (err) {
      console.error('Error checking admin access:', err);
      setError('Failed to verify admin access');
      setLoading(false);
    }
  };

  const fetchPricingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch subscription plans
      const { data: plansData, error: plansError } = await supabase?.from('subscription_plans')?.select('*')?.order('price_usd', { ascending: true });

      if (plansError) throw plansError;
      setSubscriptionPlans(plansData || []);

      // Fetch pricing history from plan changes
      const { data: historyData, error: historyError } = await supabase?.from('subscription_plan_changes')?.select(`
          *,
          user_profiles!subscription_plan_changes_user_id_fkey(full_name),
          processed_by:processed_by(full_name)
        `)?.order('created_at', { ascending: false })?.limit(20);

      if (historyError) throw historyError;
      setPricingHistory(historyData || []);

      // Simulate analytics data (in production this would come from actual metrics)
      const mockAnalytics = {
        totalSubscribers: 1250,
        monthlyRevenue: 45780.50,
        conversionRate: 12.5,
        tierDistribution: {
          registered: 65,
          subscriber: 25,
          founder: 8,
          admin: 2
        },
        revenueByTier: {
          subscriber: 28450.75,
          founder: 17329.75
        }
      };
      setAnalyticsData(mockAnalytics);

    } catch (err) {
      console.error('Error fetching pricing data:', err);
      setError(err?.message || 'Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanEdit = (plan) => {
    setEditingPlan({ ...plan });
  };

  const handlePlanSave = async (updatedPlan) => {
    try {
      setLoading(true);
      setSaveStatus('saving');

      // Log the pricing change in admin activity
      const originalPlan = subscriptionPlans?.find(p => p?.id === updatedPlan?.id);
      
      await supabase?.from('admin_activity_logs')?.insert({
          admin_user_id: user?.id,
          target_user_id: null, // System-wide change
          action_type: 'pricing_update',
          action_description: `Updated pricing for ${updatedPlan?.name} tier`,
          before_state: originalPlan,
          after_state: updatedPlan,
          metadata: {
            price_change: updatedPlan?.price_usd - originalPlan?.price_usd,
            credits_change: updatedPlan?.credits_per_month - originalPlan?.credits_per_month
          }
        });

      // Update the subscription plan
      const { error } = await supabase?.from('subscription_plans')?.update({
          name: updatedPlan?.name,
          description: updatedPlan?.description,
          price_usd: updatedPlan?.price_usd,
          credits_per_month: updatedPlan?.credits_per_month,
          features: updatedPlan?.features,
          updated_at: new Date()?.toISOString()
        })?.eq('id', updatedPlan?.id);

      if (error) throw error;

      setSaveStatus('saved');
      setEditingPlan(null);
      await fetchPricingData();

      setTimeout(() => setSaveStatus(null), 3000);

    } catch (err) {
      console.error('Error saving plan:', err);
      setSaveStatus('error');
      setError(err?.message || 'Failed to save plan changes');
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const simulatePricingChange = async (changes) => {
    try {
      // Simulate impact analysis
      const baseSubscribers = analyticsData?.totalSubscribers || 1000;
      const currentRevenue = analyticsData?.monthlyRevenue || 40000;
      
      let projectedRevenue = 0;
      let subscriberImpact = 0;

      changes?.forEach(change => {
        const tierSubscribers = Math.floor(baseSubscribers * (analyticsData?.tierDistribution?.[change?.tier] / 100));
        const priceChange = change?.newPrice - change?.currentPrice;
        
        // Simple impact calculation (in production this would be more sophisticated)
        const revenueImpact = tierSubscribers * priceChange;
        const churnRate = Math.abs(priceChange) > 20 ? 0.15 : 0.05; // Higher churn for large increases
        const subscriberChange = priceChange > 0 ? -Math.floor(tierSubscribers * churnRate) : Math.floor(tierSubscribers * 0.1);
        
        projectedRevenue += revenueImpact;
        subscriberImpact += subscriberChange;
      });

      setSimulationData({
        revenueImpact: projectedRevenue,
        subscriberImpact: subscriberImpact,
        projectedRevenue: currentRevenue + projectedRevenue,
        conversionImpact: projectedRevenue > 0 ? -2.5 : 1.5,
        effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)?.toLocaleDateString()
      });

    } catch (err) {
      console.error('Error running simulation:', err);
      setError('Failed to run pricing simulation');
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h1 className="mt-2 text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-gray-600">
              You need administrator privileges to access plan pricing management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !subscriptionPlans?.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Plan Pricing Management</h1>
              <p className="mt-2 text-gray-600">
                Configure subscription pricing, analyze impact, and manage billing parameters
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {saveStatus && (
                <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                  saveStatus === 'saved' ? 'bg-green-100 text-green-800' :
                  saveStatus === 'saving'? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  {saveStatus === 'saved' && <Save className="w-4 h-4 mr-1" />}
                  {saveStatus === 'saving' && <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-1" />}
                  {saveStatus === 'error' && <AlertTriangle className="w-4 h-4 mr-1" />}
                  {saveStatus === 'saved' ? 'Changes Saved' : 
                   saveStatus === 'saving' ? 'Saving...' : 'Save Failed'}
                </div>
              )}
              <Button
                onClick={() => fetchPricingData()}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Settings className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Overview */}
        {analyticsData && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {analyticsData?.totalSubscribers?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Total Subscribers</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${analyticsData?.monthlyRevenue?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">Monthly Revenue</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {analyticsData?.conversionRate}%
                  </div>
                  <div className="text-sm text-gray-500">Conversion Rate</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(analyticsData?.tierDistribution)?.reduce((a, b) => Math.max(a, b))}%
                  </div>
                  <div className="text-sm text-gray-500">Top Tier Usage</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Table */}
        <div className="mb-8">
          <PricingTable
            subscriptionPlans={subscriptionPlans}
            onEdit={handlePlanEdit}
            onSave={handlePlanSave}
            editingPlan={editingPlan}
            onCancelEdit={() => setEditingPlan(null)}
            loading={loading}
          />
        </div>

        {/* Impact Analysis */}
        {analyticsData && (
          <div className="mb-8">
            <ImpactAnalysis
              analyticsData={analyticsData}
              subscriptionPlans={subscriptionPlans}
              onSimulate={simulatePricingChange}
            />
          </div>
        )}

        {/* Simulation Results */}
        {simulationData && (
          <div className="mb-8">
            <SimulationPanel
              simulationData={simulationData}
              onClear={() => setSimulationData(null)}
            />
          </div>
        )}

        {/* Pricing History */}
        <div className="mb-8">
          <PricingHistory
            pricingHistory={pricingHistory}
          />
        </div>

        {/* Mobile responsive message */}
        <div className="block md:hidden mt-6">
          <div className="text-center text-sm text-gray-500 bg-white rounded-lg p-4">
            <p>For optimal pricing management experience,</p>
            <p>please use a desktop or tablet device.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanPricingManagement;