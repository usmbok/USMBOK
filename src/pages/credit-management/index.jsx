import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../contexts/AuthContext';
import { useUserCredit } from '../../contexts/UserCreditContext';
import { supabase } from '../../lib/supabase';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import components
import CreditBalanceCard from './components/CreditBalanceCard';
import CreditBundleCard from './components/CreditBundleCard';
import PaymentMethodCard from './components/PaymentMethodCard';
import UsageAnalyticsChart from './components/UsageAnalyticsChart';
import TransactionHistory from './components/TransactionHistory';
import AutoRenewalSettings from './components/AutoRenewalSettings';
import StripePaymentForm from './components/StripePaymentForm';

const CreditManagement = () => {
  const { user } = useAuth();
  const { balance, loading: creditsLoading, fetchTransactions } = useUserCredit();
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    currentCredits: 0,
    dailyUsage: 0,
    daysRemaining: 0,
    subscription: null
  });

  // Mock credit bundles
  const creditBundles = [
    {
      id: 'starter',
      name: 'Starter Bundle',
      credits: 1000,
      price: 12.99,
      costPerCredit: 0.013,
      discount: null,
      badge: null,
      features: [
        'Perfect for occasional consultations',
        'Access to all AI domains',
        'Basic usage analytics',
        'Email support'
      ]
    },
    {
      id: 'basic',
      name: 'Basic Bundle',
      credits: 2000,
      price: 24.99,
      costPerCredit: 0.0125,
      discount: 4,
      badge: null,
      features: [
        'Great for regular users',
        'Access to all AI domains',
        'Advanced usage analytics',
        'Priority email support',
        'Conversation export'
      ]
    },
    {
      id: 'professional',
      name: 'Professional Bundle',
      credits: 5000,
      price: 49.99,
      costPerCredit: 0.01,
      discount: 23,
      badge: 'Best Value',
      features: [
        'Ideal for power users',
        'Access to all AI domains',
        'Advanced usage analytics',
        'Priority support',
        'Conversation export',
        'Custom prompt templates'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Bundle',
      credits: 10000,
      price: 89.99,
      costPerCredit: 0.009,
      discount: 31,
      badge: 'Maximum Value',
      features: [
        'Perfect for teams',
        'Access to all AI domains',
        'Advanced usage analytics',
        'Priority support',
        'Conversation export',
        'Custom prompt templates',
        'Usage reporting'
      ]
    }
  ];

  // Fetch enhanced dashboard data with actual database integration
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        // Get daily usage and subscription data - with proper error handling
        let dailyUsageData = 0;
        let daysRemainingData = 0;
        let subscriptionData = null;

        try {
          const { data: dailyUsage, error: usageError } = await supabase?.rpc('get_daily_credit_usage', { 
            user_uuid: user?.id, 
            days_back: 7 
          });
          if (!usageError) {
            dailyUsageData = dailyUsage || 0;
          }
        } catch (error) {
          console.warn('Could not fetch daily usage:', error);
        }

        try {
          const { data: daysRemaining, error: daysError } = await supabase?.rpc('get_days_remaining', { 
            user_uuid: user?.id 
          });
          if (!daysError) {
            daysRemainingData = daysRemaining || 0;
          }
        } catch (error) {
          console.warn('Could not fetch days remaining:', error);
        }

        // Get subscription data - using user_credits as fallback since user_subscriptions might not exist
        try {
          const { data: subscriptions, error: subError } = await supabase?.from('user_subscriptions')?.select('*')?.eq('user_id', user?.id)?.eq('is_active', true)?.order('created_at', { ascending: false })?.limit(1);
          
          if (subError || !subscriptions?.length) {
            // Fallback to user_credits table
            const { data: userCredit } = await supabase?.from('user_credits')?.select('*')?.eq('user_id', user?.id)?.limit(1);
            if (userCredit?.[0]) {
              subscriptionData = {
                plan: 'Trial',
                credits_per_month: 100000, // Default trial amount
                is_active: true
              };
            }
          } else {
            subscriptionData = subscriptions?.[0];
          }
        } catch (error) {
          console.warn('Could not fetch subscription data:', error);
          // Set default trial subscription
          subscriptionData = {
            plan: 'Trial',
            credits_per_month: 100000,
            is_active: true
          };
        }

        setDashboardData({
          currentCredits: balance || 0,
          dailyUsage: dailyUsageData,
          daysRemaining: daysRemainingData,
          subscription: subscriptionData
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set safe defaults
        setDashboardData({
          currentCredits: balance || 0,
          dailyUsage: 0,
          daysRemaining: 0,
          subscription: {
            plan: 'Trial',
            credits_per_month: 100000,
            is_active: true
          }
        });
      }
    };

    if (!creditsLoading) {
      fetchDashboardData();
    }
  }, [user?.id, balance, creditsLoading]);

  // Mock payment methods
  useEffect(() => {
    setPaymentMethods([
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026,
        holderName: 'John Doe'
      },
      {
        id: 'pm_2',
        type: 'card',
        brand: 'mastercard',
        last4: '5555',
        expiryMonth: 8,
        expiryYear: 2025,
        holderName: 'John Doe'
      }
    ]);
  }, []);

  const handlePurchaseBundle = (bundle) => {
    setSelectedBundle(bundle);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    // Handle successful payment
    console.log('Payment successful:', paymentResult);
    setShowPaymentForm(false);
    setSelectedBundle(null);
    // You would typically update the credit balance here
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedBundle(null);
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
    // Handle setting default payment method
    console.log('Setting default payment method:', paymentMethodId);
  };

  const handleDeletePaymentMethod = async (paymentMethodId) => {
    // Handle deleting payment method
    setPaymentMethods(prev => prev?.filter(pm => pm?.id !== paymentMethodId));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'purchase', label: 'Purchase Credits', icon: 'ShoppingCart' },
    { id: 'analytics', label: 'Usage Analytics', icon: 'BarChart3' },
    { id: 'history', label: 'Transaction History', icon: 'Receipt' },
    { id: 'settings', label: 'Auto-Renewal', icon: 'Settings' },
    { id: 'payment-methods', label: 'Payment Methods', icon: 'CreditCard' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Credit Management - KnowledgeChat Pro</title>
        <meta name="description" content="Manage your credits, purchase bundles, and track usage analytics for KnowledgeChat Pro AI consultations." />
      </Helmet>
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
                <Icon name="Coins" size={20} color="white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Credit Management</h1>
            </div>
            <p className="text-muted-foreground">
              Purchase credit bundles, monitor usage, and manage your consultation budget
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success/10 rounded-md flex items-center justify-center">
                  <Icon name="Coins" size={20} className="text-success" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {dashboardData?.currentCredits?.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Available Credits</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">{dashboardData?.dailyUsage}</div>
                  <div className="text-xs text-muted-foreground">Credits/Day</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-md flex items-center justify-center">
                  <Icon name="Calendar" size={20} className="text-secondary" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">{dashboardData?.daysRemaining}</div>
                  <div className="text-xs text-muted-foreground">Days Remaining</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent/10 rounded-md flex items-center justify-center">
                  <Icon name="DollarSign" size={20} className="text-accent" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {dashboardData?.subscription?.plan || 'Trial'}
                  </div>
                  <div className="text-xs text-muted-foreground">Current Plan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 border-b border-border">
            {tabs?.map((tab) => (
              <Button
                key={tab?.id}
                variant={activeTab === tab?.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab?.id)}
                iconName={tab?.icon}
                iconPosition="left"
                className="mb-2"
              >
                <span className="hidden sm:inline">{tab?.label}</span>
                <span className="sm:hidden">{tab?.label?.split(' ')?.[0]}</span>
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CreditBalanceCard 
                  currentCredits={dashboardData?.currentCredits}
                  totalCredits={dashboardData?.subscription?.credits_per_month || 100000}
                  projectedDays={dashboardData?.daysRemaining}
                  usageRate={dashboardData?.dailyUsage}
                />
                <AutoRenewalSettings />
              </div>
            )}

            {/* Purchase Credits Tab */}
            {activeTab === 'purchase' && (
              <div>
                {showPaymentForm ? (
                  <StripePaymentForm
                    selectedBundle={selectedBundle}
                    onPaymentSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                  />
                ) : (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-foreground mb-2">Choose Your Credit Bundle</h2>
                      <p className="text-muted-foreground">
                        Select the perfect credit bundle for your consultation needs
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {creditBundles?.map((bundle, index) => (
                        <CreditBundleCard
                          key={bundle?.id}
                          bundle={bundle}
                          isPopular={index === 2} // Professional bundle is most popular
                          onPurchase={handlePurchaseBundle}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Usage Analytics Tab */}
            {activeTab === 'analytics' && (
              <UsageAnalyticsChart />
            )}

            {/* Transaction History Tab */}
            {activeTab === 'history' && (
              <TransactionHistory />
            )}

            {/* Auto-Renewal Settings Tab */}
            {activeTab === 'settings' && (
              <AutoRenewalSettings />
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment-methods' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground mb-1">Payment Methods</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your saved payment methods for credit purchases
                    </p>
                  </div>
                  
                  <Button
                    variant="default"
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Add Payment Method
                  </Button>
                </div>

                <div className="space-y-4">
                  {paymentMethods?.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="CreditCard" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No Payment Methods</h3>
                      <p className="text-muted-foreground mb-4">
                        Add a payment method to purchase credits and enable auto-renewal
                      </p>
                      <Button
                        variant="default"
                        iconName="Plus"
                        iconPosition="left"
                      >
                        Add Your First Payment Method
                      </Button>
                    </div>
                  ) : (
                    paymentMethods?.map((paymentMethod, index) => (
                      <PaymentMethodCard
                        key={paymentMethod?.id}
                        paymentMethod={paymentMethod}
                        isDefault={index === 0}
                        onSetDefault={handleSetDefaultPaymentMethod}
                        onDelete={handleDeletePaymentMethod}
                        onEdit={() => console.log('Edit payment method:', paymentMethod?.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreditManagement;