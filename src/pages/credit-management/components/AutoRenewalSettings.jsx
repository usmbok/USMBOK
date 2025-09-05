import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const AutoRenewalSettings = () => {
  const [isAutoRenewalEnabled, setIsAutoRenewalEnabled] = useState(true);
  const [minimumThreshold, setMinimumThreshold] = useState('500');
  const [renewalBundle, setRenewalBundle] = useState('2000');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const thresholdOptions = [
    { value: '100', label: '100 credits' },
    { value: '250', label: '250 credits' },
    { value: '500', label: '500 credits' },
    { value: '1000', label: '1,000 credits' }
  ];

  const bundleOptions = [
    { value: '1000', label: 'Starter Bundle - 1,000 credits ($12.99)' },
    { value: '2000', label: 'Basic Bundle - 2,000 credits ($24.99)' },
    { value: '5000', label: 'Professional Bundle - 5,000 credits ($49.99)' },
    { value: '10000', label: 'Enterprise Bundle - 10,000 credits ($89.99)' }
  ];

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Show success message or handle response
    } finally {
      setIsLoading(false);
    }
  };

  const getBundlePrice = (bundleValue) => {
    const prices = {
      '1000': 12.99,
      '2000': 24.99,
      '5000': 49.99,
      '10000': 89.99
    };
    return prices?.[bundleValue] || 0;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Auto-Renewal Settings</h3>
          <p className="text-sm text-muted-foreground">Automatically purchase credits when running low</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon 
            name={isAutoRenewalEnabled ? "Shield" : "ShieldOff"} 
            size={20} 
            className={isAutoRenewalEnabled ? "text-success" : "text-muted-foreground"} 
          />
          <span className={`text-sm font-medium ${
            isAutoRenewalEnabled ? "text-success" : "text-muted-foreground"
          }`}>
            {isAutoRenewalEnabled ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
      {/* Enable/Disable Auto-Renewal */}
      <div className="space-y-6">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={isAutoRenewalEnabled}
            onChange={(e) => setIsAutoRenewalEnabled(e?.target?.checked)}
          />
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">
              Enable Auto-Renewal
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Automatically purchase credits when your balance falls below the threshold
            </p>
          </div>
        </div>

        {/* Auto-Renewal Configuration */}
        {isAutoRenewalEnabled && (
          <div className="space-y-4 pl-6 border-l-2 border-primary/20">
            {/* Minimum Threshold */}
            <div>
              <Select
                label="Minimum Credit Threshold"
                description="Purchase new credits when balance drops below this amount"
                options={thresholdOptions}
                value={minimumThreshold}
                onChange={setMinimumThreshold}
                className="mb-4"
              />
            </div>

            {/* Renewal Bundle */}
            <div>
              <Select
                label="Auto-Renewal Bundle"
                description="The credit bundle to purchase automatically"
                options={bundleOptions}
                value={renewalBundle}
                onChange={setRenewalBundle}
                className="mb-4"
              />
            </div>

            {/* Preview */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="Info" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Auto-Renewal Preview</span>
              </div>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Trigger threshold:</span>
                  <span className="font-medium text-foreground">
                    {parseInt(minimumThreshold)?.toLocaleString()} credits
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bundle to purchase:</span>
                  <span className="font-medium text-foreground">
                    {parseInt(renewalBundle)?.toLocaleString()} credits
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cost per renewal:</span>
                  <span className="font-medium text-foreground">
                    ${getBundlePrice(renewalBundle)?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span>Balance after renewal:</span>
                  <span className="font-medium text-success">
                    {(parseInt(minimumThreshold) + parseInt(renewalBundle))?.toLocaleString()} credits
                  </span>
                </div>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e?.target?.checked)}
              />
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground">
                  Email Notifications
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  Receive email confirmations when auto-renewal purchases are made
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Method Warning */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-warning mb-1">Payment Method Required</h4>
              <p className="text-xs text-muted-foreground">
                Auto-renewal requires a valid default payment method. Make sure your payment information is up to date to avoid service interruption.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            iconName="RotateCcw"
            iconPosition="left"
          >
            Reset to Defaults
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            
            <Button
              variant="default"
              size="sm"
              loading={isLoading}
              onClick={handleSaveSettings}
              iconName="Save"
              iconPosition="left"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoRenewalSettings;