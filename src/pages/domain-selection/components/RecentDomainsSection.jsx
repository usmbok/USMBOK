import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentDomainsSection = ({ recentDomains = [], onStartConsultation, userCredits = 0 }) => {
  if (recentDomains?.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
          <Icon name="Clock" size={16} className="text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-card-foreground">Recent Domains</h2>
          <p className="text-sm text-muted-foreground">Continue where you left off</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recentDomains?.map((domain) => {
          const canAfford = userCredits >= domain?.estimatedCost;
          
          return (
            <div
              key={domain?.id}
              className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${domain?.iconBg}`}>
                <Icon name={domain?.icon} size={20} className={domain?.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-card-foreground truncate">{domain?.title}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Last used: {domain?.lastUsed}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className={`text-xs font-mono ${canAfford ? 'text-success' : 'text-error'}`}>
                    {domain?.estimatedCost} credits
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={!canAfford}
                onClick={() => onStartConsultation(domain)}
                iconName="ArrowRight"
              >
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentDomainsSection;