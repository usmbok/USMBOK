import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PaymentMethodCard = ({ 
  paymentMethod,
  isDefault = false,
  onSetDefault,
  onDelete,
  onEdit 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { id, type, last4, brand, expiryMonth, expiryYear, holderName } = paymentMethod;

  const getCardIcon = (brand) => {
    const brandIcons = {
      visa: 'CreditCard',
      mastercard: 'CreditCard',
      amex: 'CreditCard',
      discover: 'CreditCard',
      default: 'CreditCard'
    };
    return brandIcons?.[brand?.toLowerCase()] || brandIcons?.default;
  };

  const getCardBrand = (brand) => {
    const brandNames = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover'
    };
    return brandNames?.[brand?.toLowerCase()] || brand;
  };

  const handleSetDefault = async () => {
    setIsLoading(true);
    try {
      if (onSetDefault) {
        await onSetDefault(id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      setIsLoading(true);
      try {
        if (onDelete) {
          await onDelete(id);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const isExpired = () => {
    const currentDate = new Date();
    const currentYear = currentDate?.getFullYear();
    const currentMonth = currentDate?.getMonth() + 1;
    
    return expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth);
  };

  return (
    <div className={`bg-card border rounded-lg p-4 ${
      isDefault ? 'border-primary bg-primary/5' : 'border-border'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
            <Icon name={getCardIcon(brand)} size={20} className="text-muted-foreground" />
          </div>
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-foreground">
                {getCardBrand(brand)} •••• {last4}
              </span>
              {isDefault && (
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  Default
                </span>
              )}
              {isExpired() && (
                <span className="bg-error text-error-foreground px-2 py-1 rounded text-xs font-medium">
                  Expired
                </span>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {holderName} • Expires {expiryMonth?.toString()?.padStart(2, '0')}/{expiryYear}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isDefault && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSetDefault}
              loading={isLoading}
              disabled={isExpired()}
            >
              Set Default
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            iconName="Edit"
            disabled={isLoading}
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            iconName="Trash2"
            disabled={isLoading || isDefault}
            className="text-error hover:text-error"
          />
        </div>
      </div>
      {isExpired() && (
        <div className="mt-3 p-2 bg-error/10 border border-error/20 rounded text-xs text-error">
          This payment method has expired. Please update or add a new payment method.
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;