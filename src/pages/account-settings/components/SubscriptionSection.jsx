import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useUserProfile } from '../../../contexts/UserProfileContext';

const SubscriptionSection = () => {
  const { isAdmin } = useUserProfile();
  const [currentPlan] = useState({
    name: 'Professional Plan',
    price: 49.99,
    billingCycle: 'monthly',
    nextBilling: '2025-02-02',
    status: 'active',
    autoRenew: true,
    creditsIncluded: 5000,
    creditsUsed: 2450,
    features: [
      'Access to all AI domains',
      '5,000 monthly credits',
      'Priority support',
      'Conversation history',
      'Export functionality',
      'Advanced analytics'
    ]
  });

  const availablePlans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 19.99,
      credits: 2000,
      features: ['Access to 5 AI domains', '2,000 monthly credits', 'Email support'],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional Plan',
      price: 49.99,
      credits: 5000,
      features: ['Access to all AI domains', '5,000 monthly credits', 'Priority support', 'Conversation history'],
      popular: true,
      current: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 99.99,
      credits: 12000,
      features: ['Access to all AI domains', '12,000 monthly credits', '24/7 support', 'Advanced analytics', 'API access'],
      popular: false
    }
  ];

  const [showPlans, setShowPlans] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePlanChange = async (planId) => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Changing to plan:', planId);
    } catch (error) {
      console.error('Failed to change plan:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = () => {
    console.log('Cancel subscription requested');
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-warning/10 text-warning';
      case 'expired':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const creditUsagePercentage = (currentPlan?.creditsUsed / currentPlan?.creditsIncluded) * 100;

  if (isAdmin) {
    return (
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Administrator Account</h3>
          <p className="text-sm text-muted-foreground">
            You have full access to all features and unlimited credits
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-success/10 border border-success/20 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                <Icon name="Crown" size={24} className="text-success" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-success mb-1">Administrator Access</h4>
                <p className="text-sm text-success/80">Unlimited credits and full system privileges</p>
              </div>
            </div>
          </div>

          {/* Admin Features */}
          <div>
            <h4 className="font-medium text-card-foreground mb-3">Administrator Features</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Unlimited AI conversations',
                'Full domain access',
                'System administration',
                'User management',
                'Analytics dashboard',
                'Priority support',
                'All premium features'
              ]?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-success" />
                  <span className="text-sm text-card-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Status */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Coins" size={16} className="text-accent" />
                <span className="text-sm font-medium text-card-foreground">Credit Limit</span>
              </div>
              <span className="text-lg font-bold text-success">Unlimited</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Current Subscription</h3>
          <p className="text-sm text-muted-foreground">
            Manage your subscription plan and billing preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Plan Overview */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="text-xl font-semibold text-card-foreground">
                  {currentPlan?.name}
                </h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(currentPlan?.status)}`}>
                  {currentPlan?.status?.charAt(0)?.toUpperCase() + currentPlan?.status?.slice(1)}
                </span>
              </div>
              <p className="text-2xl font-bold text-card-foreground">
                ${currentPlan?.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /{currentPlan?.billingCycle}
                </span>
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="Edit"
              iconPosition="left"
              onClick={() => setShowPlans(!showPlans)}
            >
              Change Plan
            </Button>
          </div>

          {/* Credit Usage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-card-foreground">Credit Usage</span>
              <span className="text-sm text-muted-foreground">
                {currentPlan?.creditsUsed?.toLocaleString()} / {currentPlan?.creditsIncluded?.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(creditUsagePercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round(creditUsagePercentage)}% used this billing cycle
            </p>
          </div>

          {/* Billing Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm font-medium text-card-foreground mb-1">Next Billing Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(currentPlan?.nextBilling)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground mb-1">Auto-Renewal</p>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${currentPlan?.autoRenew ? 'text-success' : 'text-muted-foreground'}`}>
                  {currentPlan?.autoRenew ? 'Enabled' : 'Disabled'}
                </span>
                <Button variant="ghost" size="sm" iconName="Settings">
                  Manage
                </Button>
              </div>
            </div>
          </div>

          {/* Plan Features */}
          <div>
            <p className="text-sm font-medium text-card-foreground mb-3">Plan Features</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan?.features?.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Icon name="Check" size={16} className="text-success" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Available Plans */}
      {showPlans && (
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Available Plans</h3>
            <p className="text-sm text-muted-foreground">
              Choose the plan that best fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {availablePlans?.map((plan) => (
              <div
                key={plan?.id}
                className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${
                  plan?.current
                    ? 'border-primary bg-primary/5'
                    : plan?.popular
                    ? 'border-secondary bg-secondary/5' :'border-border bg-card hover:border-muted-foreground'
                }`}
              >
                {plan?.popular && !plan?.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {plan?.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-card-foreground mb-2">{plan?.name}</h4>
                  <p className="text-3xl font-bold text-card-foreground">
                    ${plan?.price}
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan?.credits?.toLocaleString()} credits included
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan?.features?.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Icon name="Check" size={16} className="text-success" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan?.current ? "outline" : plan?.popular ? "default" : "outline"}
                  fullWidth
                  disabled={plan?.current || isUpdating}
                  loading={isUpdating}
                  onClick={() => handlePlanChange(plan?.id)}
                >
                  {plan?.current ? 'Current Plan' : 'Select Plan'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Subscription Actions */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Subscription Actions</h3>
          <p className="text-sm text-muted-foreground">
            Manage your subscription settings and billing
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" iconName="CreditCard" iconPosition="left">
            Update Payment Method
          </Button>
          <Button variant="outline" iconName="Download" iconPosition="left">
            Download Invoice
          </Button>
          <Button variant="outline" iconName="History" iconPosition="left">
            Billing History
          </Button>
          <Button
            variant="destructive"
            iconName="X"
            iconPosition="left"
            onClick={handleCancelSubscription}
          >
            Cancel Subscription
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSection;