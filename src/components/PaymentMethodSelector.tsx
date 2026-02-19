import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Smartphone, CreditCard, Building } from 'lucide-react';
import { getPaymentMethods } from '@/lib/paystack';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface PaymentMethodSelectorProps {
  countryCode: string;
  selectedMethod: string | null;
  onMethodSelect: (methodId: string) => void;
  amount: number;
  currency: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  countryCode,
  selectedMethod,
  onMethodSelect,
  amount,
  currency
}) => {
  const paymentConfig = getPaymentMethods(countryCode);
  const [hoveredMethod, setHoveredMethod] = useState<string | null>(null);

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'mpesa':
        return <Smartphone className="h-6 w-6" />;
      case 'card':
        return <CreditCard className="h-6 w-6" />;
      case 'bank':
        return <Building className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getMethodDescription = (methodId: string) => {
    switch (methodId) {
      case 'mpesa':
        return 'Pay instantly with your M-Pesa mobile money account';
      case 'card':
        return 'Secure payment with Visa, Mastercard, or other cards';
      case 'bank':
        return 'Direct bank transfer for business accounts';
      case 'ussd':
        return 'Pay using your mobile banking USSD code';
      default:
        return 'Secure payment method';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
        <p className="text-muted-foreground">
          Select your preferred payment method for {currency} {amount.toLocaleString()}
        </p>
        <Badge variant="outline" className="mt-2">
          Available in {paymentConfig.name}
        </Badge>
      </div>

      <div className="grid gap-4">
        {paymentConfig.methods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedMethod === method.id
                ? 'border-primary bg-primary/5 shadow-md'
                : hoveredMethod === method.id
                ? 'border-primary/50'
                : ''
            }`}
            onClick={() => onMethodSelect(method.id)}
            onMouseEnter={() => setHoveredMethod(method.id)}
            onMouseLeave={() => setHoveredMethod(null)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    selectedMethod === method.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {getMethodIcon(method.id)}
                  </div>
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {method.name}
                      {method.id === paymentConfig.default && (
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      )}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {getMethodDescription(method.id)}
                    </p>
                  </div>
                </div>
                {selectedMethod === method.id && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>🔒 Your payment information is secure and encrypted</p>
        <p className="mt-1">💳 Powered by Paystack - Trusted by businesses worldwide</p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;