import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DomainCard = ({ 
  domain, 
  onStartConsultation, 
  isPopular = false,
  userCredits = 0 
}) => {
  const canAfford = userCredits >= domain?.estimatedCost;
  
  return (
    <div className={`relative bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-200 ${
      isPopular ? 'ring-2 ring-primary/20 border-primary/30' : ''
    }`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
          Popular
        </div>
      )}
      {/* Domain Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${domain?.iconBg}`}>
          <Icon name={domain?.icon} size={24} className={domain?.iconColor} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground mb-1">
            {domain?.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {domain?.description}
          </p>
        </div>
      </div>
      {/* Sample Use Cases */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-card-foreground mb-2">Sample Use Cases:</h4>
        <ul className="space-y-1">
          {domain?.useCases?.slice(0, 3)?.map((useCase, index) => (
            <li key={index} className="flex items-start space-x-2">
              <Icon name="ChevronRight" size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <span className="text-xs text-muted-foreground">{useCase}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Cost Information */}
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-md">
        <div className="flex items-center space-x-2">
          <Icon name="Coins" size={16} className="text-accent" />
          <span className="text-sm font-medium text-card-foreground">Est. Cost</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-mono font-medium ${canAfford ? 'text-success' : 'text-error'}`}>
            {domain?.estimatedCost} credits
          </span>
          <p className="text-xs text-muted-foreground">per consultation</p>
        </div>
      </div>
      {/* Action Button */}
      <Button
        variant={canAfford ? "default" : "outline"}
        fullWidth
        disabled={!canAfford}
        onClick={() => onStartConsultation(domain)}
        iconName="MessageSquare"
        iconPosition="left"
      >
        {canAfford ? 'Start Consultation' : 'Insufficient Credits'}
      </Button>
      {/* Insufficient Credits Warning */}
      {!canAfford && (
        <div className="flex items-center space-x-2 mt-2 p-2 bg-error/10 rounded-md">
          <Icon name="AlertCircle" size={14} className="text-error" />
          <span className="text-xs text-error">
            Need {domain?.estimatedCost - userCredits} more credits
          </span>
        </div>
      )}
    </div>
  );
};

export default DomainCard;