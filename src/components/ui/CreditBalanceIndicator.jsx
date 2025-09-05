import React from 'react';
import Icon from '../AppIcon';
import { useUserProfile } from '../../contexts/UserProfileContext';

const CreditBalanceIndicator = ({ credits = 0, showLabel = true, size = 'default' }) => {
  const { isAdmin } = useUserProfile();

  const getCreditStatusColor = () => {
    if (isAdmin) return 'text-success';
    if (credits < 500) return 'text-error';
    if (credits < 1000) return 'text-warning';
    return 'text-success';
  };

  const getCreditStatusBg = () => {
    if (isAdmin) return 'bg-success/10';
    if (credits < 500) return 'bg-error/10';
    if (credits < 1000) return 'bg-warning/10';
    return 'bg-success/10';
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 14,
    default: 16,
    lg: 18
  };

  return (
    <div className={`flex items-center space-x-2 ${getCreditStatusBg()} rounded-md ${sizeClasses?.[size]}`}>
      <Icon name="Coins" size={iconSizes?.[size]} className="text-accent" />
      {showLabel && (
        <span className="text-xs text-muted-foreground hidden sm:inline">Credits</span>
      )}
      <span className={`font-mono font-medium ${getCreditStatusColor()}`}>
        {isAdmin ? 'Unlimited' : credits?.toLocaleString()}
      </span>
    </div>
  );
};

export default CreditBalanceIndicator;