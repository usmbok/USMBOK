import React from 'react';
import Icon from '../../../components/AppIcon';
import { useUserProfile } from '../../../contexts/UserProfileContext';

const CreditBalanceCard = ({ 
  currentCredits = 2450, 
  totalCredits = 5000, 
  projectedDays = 18,
  usageRate = 136 
}) => {
  const { isAdmin } = useUserProfile();
  const usagePercentage = ((totalCredits - currentCredits) / totalCredits) * 100;
  
  const getCreditStatusColor = () => {
    if (isAdmin) return 'text-success';
    if (currentCredits < 500) return 'text-error';
    if (currentCredits < 1000) return 'text-warning';
    return 'text-success';
  };

  const getCreditStatusBg = () => {
    if (isAdmin) return 'bg-success/10 border-success/20';
    if (currentCredits < 500) return 'bg-error/10 border-error/20';
    if (currentCredits < 1000) return 'bg-warning/10 border-warning/20';
    return 'bg-success/10 border-success/20';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">Credit Balance</h2>
          <p className="text-sm text-muted-foreground">Current available credits</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${getCreditStatusBg()}`}>
          <Icon name="Coins" size={20} className="text-accent" />
          <span className={`text-2xl font-bold font-mono ${getCreditStatusColor()}`}>
            {isAdmin ? 'Unlimited' : currentCredits?.toLocaleString()}
          </span>
        </div>
      </div>
      
      {!isAdmin && (
        <>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Usage Progress</span>
              <span className="text-sm font-medium text-foreground">
                {Math.round(usagePercentage)}% used
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
              <span>0</span>
              <span>{totalCredits?.toLocaleString()} total</span>
            </div>
          </div>
          
          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-md">
              <div className="flex items-center justify-center mb-2">
                <Icon name="TrendingUp" size={16} className="text-primary" />
              </div>
              <div className="text-lg font-semibold text-foreground">{usageRate}</div>
              <div className="text-xs text-muted-foreground">Credits/day</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-md">
              <div className="flex items-center justify-center mb-2">
                <Icon name="Calendar" size={16} className="text-secondary" />
              </div>
              <div className="text-lg font-semibold text-foreground">{projectedDays}</div>
              <div className="text-xs text-muted-foreground">Days remaining</div>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-md">
              <div className="flex items-center justify-center mb-2">
                <Icon name="Zap" size={16} className="text-accent" />
              </div>
              <div className="text-lg font-semibold text-foreground">
                {Math.round((currentCredits / usageRate) * 10) / 10}
              </div>
              <div className="text-xs text-muted-foreground">Weeks left</div>
            </div>
          </div>
          
          {/* Low Credit Warning */}
          {currentCredits < 1000 && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
              <div className="flex items-center space-x-2">
                <Icon name="AlertTriangle" size={16} className="text-warning" />
                <span className="text-sm font-medium text-warning">Low Credit Warning</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Consider purchasing additional credits to avoid interruption in your consultations.
              </p>
            </div>
          )}
        </>
      )}

      {isAdmin && (
        <div className="grid grid-cols-1 gap-4">
          <div className="text-center p-4 bg-success/10 rounded-md border border-success/20">
            <div className="flex items-center justify-center mb-3">
              <Icon name="Crown" size={24} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-success mb-2">Administrator Account</h3>
            <p className="text-sm text-success/80">
              Unlimited credit access with full system privileges
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditBalanceCard;