import React from 'react';
import Icon from '../../../components/AppIcon';

const CreditUsageTracker = ({ 
  sessionUsage = 0, 
  totalCredits = 0, 
  lastTransactionTokens = 0,
  showDetails = false 
}) => {
  const remainingCredits = totalCredits - sessionUsage;
  const usagePercentage = totalCredits > 0 ? (sessionUsage / totalCredits) * 100 : 0;

  const getUsageColor = () => {
    if (usagePercentage > 80) return 'text-error';
    if (usagePercentage > 60) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    if (usagePercentage > 80) return 'bg-error';
    if (usagePercentage > 60) return 'bg-warning';
    return 'bg-success';
  };

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-md">
        <Icon name="Zap" size={14} className="text-accent" />
        <span className="text-sm text-muted-foreground">Session:</span>
        <span className={`text-sm font-mono font-medium ${getUsageColor()}`}>
          {sessionUsage?.toLocaleString()}
        </span>
        {lastTransactionTokens > 0 && (
          <span className="text-xs text-muted-foreground">
            (+{lastTransactionTokens})
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">Credit Usage</h4>
        <div className="flex items-center space-x-1">
          <Icon name="Zap" size={14} className="text-accent" />
          <span className="text-xs text-muted-foreground">Real-time</span>
        </div>
      </div>
      {/* Usage Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Session Usage</span>
          <span>{usagePercentage?.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>
      {/* Usage Statistics */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground">Used This Session</div>
          <div className={`font-mono font-medium ${getUsageColor()}`}>
            {sessionUsage?.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Remaining</div>
          <div className={`font-mono font-medium ${getUsageColor()}`}>
            {remainingCredits?.toLocaleString()}
          </div>
        </div>
      </div>
      {/* Last Transaction */}
      {lastTransactionTokens > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Last Response</span>
            <div className="flex items-center space-x-1">
              <Icon name="Zap" size={12} className="text-accent" />
              <span className="font-mono">{lastTransactionTokens} tokens</span>
            </div>
          </div>
        </div>
      )}
      {/* Low Credit Warning */}
      {remainingCredits < 100 && (
        <div className="mt-3 p-2 bg-warning/10 border border-warning/20 rounded-md">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={14} className="text-warning" />
            <span className="text-xs text-warning">Low credits remaining</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditUsageTracker;