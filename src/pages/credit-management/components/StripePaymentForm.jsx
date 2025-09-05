import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const StripePaymentForm = ({ 
  selectedBundle,
  onPaymentSuccess,
  onCancel 
}) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    email: '',
    billingAddress: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });
  
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      billingAddress: {
        ...prev?.billingAddress,
        [field]: value
      }
    }));
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const v = value?.replace(/\s+/g, '')?.replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v?.match(/\d{4,16}/g);
    const match = matches && matches?.[0] || '';
    const parts = [];
    for (let i = 0, len = match?.length; i < len; i += 4) {
      parts?.push(match?.substring(i, i + 4));
    }
    if (parts?.length) {
      return parts?.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value?.replace(/\s+/g, '')?.replace(/[^0-9]/gi, '');
    if (v?.length >= 2) {
      return v?.substring(0, 2) + '/' + v?.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentData?.cardNumber || paymentData?.cardNumber?.replace(/\s/g, '')?.length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!paymentData?.expiryDate || paymentData?.expiryDate?.length < 5) {
      newErrors.expiryDate = 'Please enter a valid expiry date';
    }
    
    if (!paymentData?.cvv || paymentData?.cvv?.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    
    if (!paymentData?.holderName?.trim()) {
      newErrors.holderName = 'Please enter the cardholder name';
    }
    
    if (!paymentData?.email?.trim() || !paymentData?.email?.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const paymentResult = {
        id: `pi_${Date.now()}`,
        amount: selectedBundle?.price * 100, // Stripe uses cents
        currency: 'usd',
        status: 'succeeded',
        credits: selectedBundle?.credits
      };
      
      if (onPaymentSuccess) {
        onPaymentSuccess(paymentResult);
      }
    } catch (error) {
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!selectedBundle) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Payment Details</h3>
          <p className="text-sm text-muted-foreground">Secure payment powered by Stripe</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={16} className="text-success" />
          <span className="text-xs text-success font-medium">SSL Secured</span>
        </div>
      </div>
      {/* Order Summary */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-foreground mb-3">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{selectedBundle?.name}</span>
            <span className="font-medium text-foreground">${selectedBundle?.price}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Credits</span>
            <span className="font-medium text-foreground">{selectedBundle?.credits?.toLocaleString()}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-bold text-foreground">${selectedBundle?.price}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors?.general && (
          <div className="bg-error/10 border border-error/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error" />
              <span className="text-sm text-error">{errors?.general}</span>
            </div>
          </div>
        )}

        {/* Card Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Card Information</h4>
          
          <Input
            label="Card Number"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={paymentData?.cardNumber}
            onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e?.target?.value))}
            error={errors?.cardNumber}
            maxLength={19}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Expiry Date"
              type="text"
              placeholder="MM/YY"
              value={paymentData?.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e?.target?.value))}
              error={errors?.expiryDate}
              maxLength={5}
              required
            />
            
            <Input
              label="CVV"
              type="text"
              placeholder="123"
              value={paymentData?.cvv}
              onChange={(e) => handleInputChange('cvv', e?.target?.value?.replace(/\D/g, ''))}
              error={errors?.cvv}
              maxLength={4}
              required
            />
          </div>
          
          <Input
            label="Cardholder Name"
            type="text"
            placeholder="John Doe"
            value={paymentData?.holderName}
            onChange={(e) => handleInputChange('holderName', e?.target?.value)}
            error={errors?.holderName}
            required
          />
        </div>

        {/* Billing Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Billing Information</h4>
          
          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={paymentData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />
          
          <Input
            label="Address"
            type="text"
            placeholder="123 Main Street"
            value={paymentData?.billingAddress?.line1}
            onChange={(e) => handleAddressChange('line1', e?.target?.value)}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              type="text"
              placeholder="New York"
              value={paymentData?.billingAddress?.city}
              onChange={(e) => handleAddressChange('city', e?.target?.value)}
            />
            
            <Input
              label="ZIP Code"
              type="text"
              placeholder="10001"
              value={paymentData?.billingAddress?.postalCode}
              onChange={(e) => handleAddressChange('postalCode', e?.target?.value)}
            />
          </div>
        </div>

        {/* Save Payment Method */}
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={savePaymentMethod}
            onChange={(e) => setSavePaymentMethod(e?.target?.checked)}
          />
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">
              Save payment method for future purchases
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Securely save this card for faster checkout next time
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Icon name="Lock" size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">Your payment information is secure</p>
              <p>We use industry-standard encryption to protect your data. Your card details are processed securely by Stripe and never stored on our servers.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="default"
            loading={isProcessing}
            iconName="CreditCard"
            iconPosition="left"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay $${selectedBundle?.price}`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StripePaymentForm;