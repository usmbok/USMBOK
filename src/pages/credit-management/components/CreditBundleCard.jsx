import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CreditBundleCard = ({ 
  bundle,
  isPopular = false,
  onPurchase 
}) => {
  const { id, name, credits, price, costPerCredit, discount, features, badge } = bundle;

  const handlePurchase = () => {
    if (onPurchase) {
      onPurchase(bundle);
    }
  };

  return (
    <div className={`relative bg-card border rounded-lg p-6 transition-all duration-200 hover:shadow-md ${
      isPopular ? 'border-primary shadow-sm' : 'border-border'
    }`}>
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
            Most Popular
          </div>
        </div>
      )}
      {/* Bundle Badge */}
      {badge && (
        <div className="absolute top-4 right-4">
          <div className="bg-accent text-accent-foreground px-2 py-1 rounded text-xs font-medium">
            {badge}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">{name}</h3>
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon name="Coins" size={20} className="text-accent" />
          <span className="text-2xl font-bold text-foreground">
            {credits?.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">credits</span>
        </div>
        
        {/* Pricing */}
        <div className="text-center">
          <div className="text-3xl font-bold text-foreground">${price}</div>
          <div className="text-sm text-muted-foreground">
            ${costPerCredit?.toFixed(3)} per credit
          </div>
          {discount && (
            <div className="text-xs text-success font-medium mt-1">
              Save {discount}% vs smaller bundles
            </div>
          )}
        </div>
      </div>
      {/* Features */}
      <div className="space-y-3 mb-6">
        {features?.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Icon name="Check" size={16} className="text-success flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>
      {/* Purchase Button */}
      <Button
        variant={isPopular ? "default" : "outline"}
        fullWidth
        onClick={handlePurchase}
        iconName="CreditCard"
        iconPosition="left"
      >
        Purchase Bundle
      </Button>
      {/* Value Indicator */}
      <div className="mt-3 text-center">
        <div className="text-xs text-muted-foreground">
          Estimated {Math.round(credits / 136)} days of usage
        </div>
      </div>
    </div>
  );
};

export default CreditBundleCard;