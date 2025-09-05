import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AccountSummaryPanel = ({ subscription, recentTransactions, accountStats }) => {
  const getSubscriptionStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-success bg-success/10';
      case 'expired':
        return 'text-error bg-error/10';
      case 'pending':
        return 'text-warning bg-warning/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-secondary/10 rounded-lg">
            <Icon name="User" size={20} className="text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Account Summary</h3>
            <p className="text-sm text-muted-foreground">Subscription and billing overview</p>
          </div>
        </div>
        <Link to="/account-settings">
          <Button variant="ghost" size="sm" iconName="Settings" />
        </Link>
      </div>
      <div className="space-y-6">
        {/* Subscription Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">Subscription</h4>
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSubscriptionStatusColor(subscription?.status)}`}>
                {subscription?.status}
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{subscription?.plan}</p>
                <p className="text-xs text-muted-foreground">
                  {subscription?.creditsPerMonth?.toLocaleString()} credits/month
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-card-foreground">
                {formatCurrency(subscription?.monthlyPrice)}
              </p>
              <p className="text-xs text-muted-foreground">per month</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next billing date</span>
            <span className="font-medium text-card-foreground">{subscription?.nextBillingDate}</span>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-card-foreground">Recent Transactions</h4>
            <Link to="/credit-management">
              <Button variant="ghost" size="sm" iconName="ExternalLink" />
            </Link>
          </div>
          
          <div className="space-y-2">
            {recentTransactions?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent transactions
              </p>
            ) : (
              recentTransactions?.slice(0, 3)?.map((transaction) => (
                <div key={transaction?.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction?.type === 'purchase' ? 'bg-success' : 'bg-primary'
                    }`} />
                    <div>
                      <p className="text-sm text-card-foreground">{transaction?.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction?.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      transaction?.type === 'purchase' ? 'text-success' : 'text-primary'
                    }`}>
                      {transaction?.type === 'purchase' ? '+' : ''}{transaction?.credits?.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(transaction?.amount)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Account Statistics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-card-foreground">Account Statistics</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold text-card-foreground">
                {accountStats?.totalConversations}
              </div>
              <p className="text-xs text-muted-foreground">Total Conversations</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold text-card-foreground">
                {accountStats?.totalCreditsUsed?.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Credits Used</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold text-card-foreground">
                {accountStats?.averageSessionTime}
              </div>
              <p className="text-xs text-muted-foreground">Avg. Session</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold text-card-foreground">
                {accountStats?.memberSince}
              </div>
              <p className="text-xs text-muted-foreground">Member Since</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummaryPanel;