import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemMetricsCard = ({ metrics = {} }) => {
  const {
    totalUsers = 0,
    activeUsers = 0,
    totalCreditsDistributed = 0,
    creditConsumption = 0,
    apiResponseTime = 0,
    errorRate = 0
  } = metrics;

  const getHealthStatus = () => {
    if (errorRate > 5) return { status: 'Poor', color: 'text-error', bg: 'bg-error/10' };
    if (errorRate > 2) return { status: 'Fair', color: 'text-warning', bg: 'bg-warning/10' };
    return { status: 'Excellent', color: 'text-success', bg: 'bg-success/10' };
  };

  const health = getHealthStatus();

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">System Metrics</h2>
          <p className="text-sm text-muted-foreground">Real-time system performance overview</p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${health?.bg}`}>
          <Icon name="Activity" size={16} className={health?.color} />
          <span className={`text-sm font-medium ${health?.color}`}>{health?.status}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Users" size={16} className="text-primary" />
          </div>
          <div className="text-lg font-semibold text-foreground">{totalUsers}</div>
          <div className="text-xs text-muted-foreground">Total Users</div>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="UserCheck" size={16} className="text-success" />
          </div>
          <div className="text-lg font-semibold text-foreground">{activeUsers}</div>
          <div className="text-xs text-muted-foreground">Active Users</div>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Coins" size={16} className="text-accent" />
          </div>
          <div className="text-lg font-semibold text-foreground">{totalCreditsDistributed?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Credits Distributed</div>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="TrendingDown" size={16} className="text-warning" />
          </div>
          <div className="text-lg font-semibold text-foreground">{creditConsumption?.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Daily Consumption</div>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="Zap" size={16} className="text-secondary" />
          </div>
          <div className="text-lg font-semibold text-foreground">{apiResponseTime}ms</div>
          <div className="text-xs text-muted-foreground">Avg Response</div>
        </div>

        <div className="text-center p-3 bg-muted/50 rounded-md">
          <div className="flex items-center justify-center mb-2">
            <Icon name="AlertTriangle" size={16} className={errorRate > 2 ? "text-error" : "text-success"} />
          </div>
          <div className="text-lg font-semibold text-foreground">{errorRate?.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Error Rate</div>
        </div>
      </div>
    </div>
  );
};

export default SystemMetricsCard;