import React from 'react';
import { Clock, AlertTriangle, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';

const TrialStatusCard = ({ 
  user, 
  daysRemaining, 
  creditsBalance, 
  isAdmin = false, 
  onExtendTrial, 
  onSendNotification, 
  onSuspend 
}) => {
  const isExpired = daysRemaining <= 0;
  const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
  
  const getStatusColor = () => {
    if (isExpired) return 'text-red-600';
    if (isExpiringSoon) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = () => {
    if (isExpired) return <XCircle className="w-5 h-5 text-red-500" />;
    if (isExpiringSoon) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getBackgroundGradient = () => {
    if (isExpired) return 'from-red-600 to-red-700';
    if (isExpiringSoon) return 'from-yellow-600 to-orange-600';
    return 'from-blue-600 to-purple-600';
  };

  return (
    <div className={`bg-gradient-to-r ${getBackgroundGradient()} rounded-lg p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-2">
            {isAdmin ? `${user?.full_name}'s Trial` : 'Your Trial Status'}
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="text-lg">
                {isExpired ? 'Trial expired' : `${daysRemaining} days remaining`}
              </span>
            </div>
            {creditsBalance !== undefined && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <span>{creditsBalance?.toLocaleString() || 0} credits left</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{Math?.max(0, daysRemaining)}</div>
          <div className="text-blue-200">Days Left</div>
        </div>
      </div>

      {/* Status Messages */}
      {isExpiringSoon && (
        <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-300" />
            <span className="font-medium">Trial Ending Soon!</span>
          </div>
          <p className="mt-1 text-yellow-100">
            {isAdmin 
              ? `${user?.full_name}'s trial expires in ${daysRemaining} days.`
              : `Your trial expires in ${daysRemaining} days. Upgrade now to continue using all features.`
            }
          </p>
        </div>
      )}

      {isExpired && (
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-300" />
            <span className="font-medium">Trial Expired</span>
          </div>
          <p className="mt-1 text-red-100">
            {isAdmin 
              ? `${user?.full_name}'s trial has expired.` : 'Your trial has expired. Upgrade to a paid plan to restore access.'
            }
          </p>
        </div>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => onExtendTrial?.(user?.id, 7)}
          >
            Extend Trial
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => onSendNotification?.(user?.id, isExpiringSoon ? 'final' : 'warning')}
          >
            Send Notification
          </Button>
          {isExpired && (
            <Button
              size="sm"
              variant="outline"
              className="bg-red-500/20 border-red-400/20 text-red-100 hover:bg-red-500/30"
              onClick={() => onSuspend?.(user?.id)}
            >
              Suspend
            </Button>
          )}
        </div>
      )}

      {/* User Conversion Actions */}
      {!isAdmin && !isExpired && (
        <div className="flex items-center gap-2 mt-4">
          <Button
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => {window.location.href = '/credit-management'}}
          >
            Upgrade Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => {window.location.href = '/account-settings'}}
          >
            View Plans
          </Button>
        </div>
      )}
    </div>
  );
};

export default TrialStatusCard;