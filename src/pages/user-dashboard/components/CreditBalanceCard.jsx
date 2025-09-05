import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useUserProfile } from '../../../contexts/UserProfileContext';

const CreditBalanceCard = ({ credits, monthlyAllowance, usagePercentage, nextBillingDate }) => {
  const { isAdmin } = useUserProfile();

  const getCreditStatusColor = () => {
    if (isAdmin) return 'text-success';
    if (usagePercentage >= 90) return 'text-error';
    if (usagePercentage >= 70) return 'text-warning';
    return 'text-success';
  };

  const getCreditStatusBg = () => {
    if (isAdmin) return 'bg-success/10';
    if (usagePercentage >= 90) return 'bg-error/10';
    if (usagePercentage >= 70) return 'bg-warning/10';
    return 'bg-success/10';
  };

  const getProgressBarColor = () => {
    if (usagePercentage >= 90) return 'bg-error';
    if (usagePercentage >= 70) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg ${getCreditStatusBg()}`}>
            <Icon name="Coins" size={24} className="text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Credit Balance</h3>
            <p className="text-sm text-muted-foreground">Monthly allowance tracking</p>
          </div>
        </div>
        {!isAdmin && (
          <Link to="/credit-management">
            <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
              Buy Credits
            </Button>
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {/* Current Balance */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${getCreditStatusColor()}`}>
            {isAdmin ? 'Unlimited' : credits?.toLocaleString()}
          </div>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Admin privileges' : 'Credits remaining'}
          </p>
        </div>

        {!isAdmin && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Usage this month</span>
                <span className={`font-medium ${getCreditStatusColor()}`}>
                  {usagePercentage}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{monthlyAllowance?.toLocaleString()} credits</span>
              </div>
            </div>

            {/* Next Billing */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Next billing</span>
              </div>
              <span className="text-sm font-medium text-card-foreground">
                {nextBillingDate}
              </span>
            </div>
          </>
        )}

        {isAdmin && (
          <div className="flex items-center justify-center pt-4 border-t border-border">
            <div className="flex items-center space-x-2 text-success">
              <Icon name="Crown" size={16} className="text-success" />
              <span className="text-sm font-medium">Administrator Account</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditBalanceCard;