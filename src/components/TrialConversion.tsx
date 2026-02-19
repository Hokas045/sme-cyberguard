"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle, Crown, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useCurrency } from '@/hooks/useCurrency';
import PaymentMethodSelector from './PaymentMethodSelector';

interface TrialConversionProps {
  onConversionComplete?: () => void;
}

const TrialConversion: React.FC<TrialConversionProps> = ({ onConversionComplete }) => {
  const { subscription, startSubscription, extendTrial, loading } = useSubscription();
  const { code: currencyCode, convertFromUSD } = useCurrency();
  const router = useRouter();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [conversionStep, setConversionStep] = useState<'warning' | 'plans' | 'payment' | 'processing'>('warning');

  const trialStatus = subscription?.trialStatus;
  const daysRemaining = trialStatus?.daysRemaining || 0;
  const isUrgent = daysRemaining <= 3;

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 23,
      features: [
        'Up to 10 devices',
        'Real-time monitoring',
        'Email alerts',
        'Basic phishing protection'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 46,
      features: [
        'Up to 25 devices',
        'Everything in Starter',
        'SMS/WhatsApp alerts',
        'Advanced threat detection',
        'Priority support'
      ],
      popular: true
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setConversionStep('payment');
    setShowPaymentSelector(true);
  };

  const handlePaymentMethodSelect = async (methodId: string) => {
    setSelectedPaymentMethod(methodId);

    if (selectedPlan) {
      try {
        setConversionStep('processing');
        const transaction = await startSubscription(selectedPlan, billingCycle);

        // Redirect to Paystack payment page
        if (transaction.authorization_url) {
          window.location.href = transaction.authorization_url;
        }
      } catch (error) {
        console.error('Payment initialization failed:', error);
        setConversionStep('payment');
      }
    }
  };

  const handleExtendTrial = async () => {
    try {
      await extendTrial(7);
    } catch (error) {
      console.error('Trial extension failed:', error);
    }
  };

  const getUrgencyColor = () => {
    if (daysRemaining <= 1) return 'destructive';
    if (daysRemaining <= 3) return 'secondary';
    return 'default';
  };

  const getProgressValue = () => {
    const totalTrialDays = 14;
    const daysUsed = totalTrialDays - daysRemaining;
    return (daysUsed / totalTrialDays) * 100;
  };

  if (!trialStatus?.isOnTrial) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-4xl mx-auto"
      >
        {conversionStep === 'warning' && (
          <Card className={`border-2 ${isUrgent ? 'border-destructive' : 'border-warning'}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                {isUrgent ? (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                ) : (
                  <Clock className="h-6 w-6 text-warning" />
                )}
                <div>
                  <CardTitle className={`flex items-center gap-2 ${
                    isUrgent ? 'text-destructive' : 'text-warning'
                  }`}>
                    Trial {isUrgent ? 'Ending Soon' : 'Update'}
                    <Badge variant={getUrgencyColor()}>
                      {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Your 14-day free trial will end on {trialStatus.trialEndsAt?.toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Trial Progress</span>
                  <span>{14 - daysRemaining}/14 days used</span>
                </div>
                <Progress value={getProgressValue()} className="h-2" />
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {isUrgent
                    ? "Your trial is ending soon. Choose a plan below to continue protecting your business."
                    : "Don't lose access to advanced security features. Upgrade now to maintain full protection."
                  }
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setConversionStep('plans')}
                  className="flex-1"
                  size="lg"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Choose Plan
                </Button>
                {trialStatus.canExtend && (
                  <Button
                    variant="outline"
                    onClick={handleExtendTrial}
                    disabled={loading}
                    className="flex-1"
                    size="lg"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Extend Trial (+7 days)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {conversionStep === 'plans' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Choose Your Plan
              </CardTitle>
              <CardDescription>
                Select the plan that best fits your business needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
                <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
                  Monthly
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="px-6"
                >
                  {billingCycle === 'monthly' ? 'Switch to Yearly' : 'Switch to Monthly'}
                </Button>
                <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
                  Yearly
                  <Badge variant="secondary" className="ml-2">Save 17%</Badge>
                </span>
              </div>

              {/* Plan Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      plan.popular ? 'border-primary shadow-md' : ''
                    }`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.popular && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {currencyCode} {convertFromUSD(plan.price * (billingCycle === 'yearly' ? 12 * 0.83 : 1)).toLocaleString()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            per {billingCycle === 'yearly' ? 'year' : 'month'}
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setConversionStep('warning')} className="flex-1">
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {conversionStep === 'payment' && showPaymentSelector && selectedPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
              <CardDescription>
                Choose your payment method to activate your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelector
                countryCode={currencyCode}
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={handlePaymentMethodSelect}
                amount={convertFromUSD(
                  plans.find(p => p.id === selectedPlan)?.price || 0 *
                  (billingCycle === 'yearly' ? 12 * 0.83 : 1)
                )}
                currency={currencyCode}
              />

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setConversionStep('plans')} className="flex-1">
                  Back to Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {conversionStep === 'processing' && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
              <p className="text-muted-foreground">
                Redirecting to secure payment page...
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default TrialConversion;
