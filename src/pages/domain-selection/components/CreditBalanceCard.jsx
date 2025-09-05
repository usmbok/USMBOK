import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useUserProfile } from '../../../contexts/UserProfileContext';

const CreditBalanceCard = ({ credits = 0, estimatedConsultations = 0 }) => {
  const { isAdmin } = useUserProfile();

  const getCreditStatusColor = () => {
    if (isAdmin) return 'text-success';
    if (credits < 500) return 'text-error';
    if (credits < 1000) return 'text-warning';
    return 'text-success';
  };

  const getCreditStatusBg = () => {
    if (isAdmin) return 'bg-success/10 border-success/20';
    if (credits < 500) return 'bg-error/10 border-error/20';
    if (credits < 1000) return 'bg-warning/10 border-warning/20';
    return 'bg-success/10 border-success/20';
  };

  return (
    <div className={`bg-card border rounded-lg p-6 ${getCreditStatusBg()}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
            <Icon name="Coins" size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Credit Balance</h3>
            <p className="text-sm text-muted-foreground">Available for consultations</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-mono font-bold ${getCreditStatusColor()}`}>
            {isAdmin ? 'Unlimited' : credits?.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {isAdmin ? 'admin' : 'credits'}
          </p>
        </div>
      </div>
      
      {!isAdmin && (
        <>
          {/* Consultation Capacity */}
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center space-x-2">
              <Icon name="MessageSquare" size={16} className="text-muted-foreground" />
              <span className="text-sm text-card-foreground">Est. Consultations</span>
            </div>
            <span className="text-sm font-medium text-card-foreground">
              ~{estimatedConsultations} sessions
            </span>
          </div>
          
          {/* Credit Status Message */}
          <div className="mb-4">
            {credits < 500 && (
              <div className="flex items-start space-x-2 p-3 bg-error/10 rounded-md">
                <Icon name="AlertTriangle" size={16} className="text-error mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-error">Low Credit Balance</p>
                  <p className="text-xs text-error/80">Consider purchasing more credits to continue consultations</p>
                </div>
              </div>
            )}
            {credits >= 500 && credits < 1000 && (
              <div className="flex items-start space-x-2 p-3 bg-warning/10 rounded-md">
                <Icon name="AlertCircle" size={16} className="text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning">Moderate Credit Balance</p>
                  <p className="text-xs text-warning/80">You have sufficient credits for several consultations</p>
                </div>
              </div>
            )}
            {credits >= 1000 && (
              <div className="flex items-start space-x-2 p-3 bg-success/10 rounded-md">
                <Icon name="CheckCircle" size={16} className="text-success mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-success">Healthy Credit Balance</p>
                  <p className="text-xs text-success/80">You're all set for extensive consultations</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {isAdmin && (
        <div className="mb-4 p-3 bg-success/10 rounded-md">
          <div className="flex items-center space-x-2">
            <Icon name="Crown" size={16} className="text-success" />
            <div>
              <p className="text-sm font-medium text-success">Administrator Account</p>
              <p className="text-xs text-success/80">Unlimited access to all consultations and features</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        {!isAdmin && (
          <Link to="/credit-management" className="flex-1">
            <Button variant="outline" fullWidth iconName="Plus" iconPosition="left">
              Buy Credits
            </Button>
          </Link>
        )}
        <Link to="/conversation-history" className="flex-1">
          <Button variant="ghost" fullWidth iconName="History" iconPosition="left">
            View History
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CreditBalanceCard;