import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { query, insert, update } from '@/lib/turso';
import { paystackAPI, getPaymentMethods, SubscriptionInfo, TrialStatus, SubscriptionStatus } from '@/lib/paystack';
import { useCurrency } from './useCurrency';
import { generateId } from '@/lib/utils';

export const useSubscription = () => {
  const { user } = useAuth();
  const { code: currencyCode, convertFromUSD } = useCurrency();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subscription data
  const loadSubscription = useCallback(async () => {
    if (!user?.business_id) return;

    try {
      setLoading(true);
      setError(null);

      // Get subscription from database
      const subscriptionResult = await query(
        `SELECT s.*, pt.name as plan_name, pt.monthly_price_usd, pt.yearly_price_usd
         FROM subscriptions s
         JOIN pricing_tiers pt ON s.pricing_tier_id = pt.id
         WHERE s.business_id = ? AND s.status IN ('active', 'trialing', 'past_due')`,
        [user.business_id]
      );

      if (subscriptionResult.length > 0) {
        const sub = subscriptionResult[0];
        const now = new Date();
        const trialEndsAt = sub.trial_ends_at ? new Date(String(sub.trial_ends_at)) : null;
        const isOnTrial = trialEndsAt && trialEndsAt > now;

        const subscriptionInfo: SubscriptionInfo = {
          id: String(sub.id),
          status: String(sub.status) as SubscriptionStatus,
          currentPeriodStart: new Date(String(sub.current_period_start)),
          currentPeriodEnd: new Date(String(sub.current_period_end)),
          cancelAtPeriodEnd: Number(sub.cancel_at_period_end) === 1,
          trialStatus: {
            isOnTrial: !!isOnTrial,
            daysRemaining: isOnTrial ? Math.ceil((trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
            trialEndsAt,
            canExtend: false // Can be extended based on business logic
          },
          planName: String(sub.plan_name),
          amount: sub.billing_cycle === 'yearly' ? Number(sub.yearly_price_usd) : Number(sub.monthly_price_usd),
          currency: currencyCode,
          nextBillingDate: Number(sub.cancel_at_period_end) === 1 ? null : new Date(String(sub.current_period_end))
        };

        setSubscription(subscriptionInfo);
      } else {
        // Check if business is in trial
        const trialResult = await query(
          'SELECT * FROM subscription_trials WHERE business_id = ? AND converted_to_paid = 0',
          [user.business_id]
        );

        if (trialResult.length > 0) {
          const trial = trialResult[0];
          const trialEndsAt = new Date(String(trial.ends_at));
          const now = new Date();
          const isOnTrial = trialEndsAt > now;

          setSubscription({
            id: '',
            status: 'trialing',
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEndsAt,
            cancelAtPeriodEnd: false,
            trialStatus: {
              isOnTrial: !!isOnTrial,
              daysRemaining: isOnTrial ? Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
              trialEndsAt,
              canExtend: Number(trial.extended_count) < 1 // Allow one extension
            },
            planName: 'Free Trial',
            amount: 0,
            currency: currencyCode,
            nextBillingDate: null
          });
        } else {
          setSubscription(null);
        }
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('Failed to load subscription information');
    } finally {
      setLoading(false);
    }
  }, [user?.business_id, currencyCode]);

  // Initialize trial for new business
  const initializeTrial = useCallback(async () => {
    if (!user?.business_id) return;

    try {
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial

      await insert('subscription_trials', {
        id: generateId(),
        business_id: user.business_id,
        started_at: trialStart.toISOString(),
        ends_at: trialEnd.toISOString(),
        extended_count: 0,
        converted_to_paid: 0
      });

      // Update business trial status
      await update('businesses', {
        trial_started_at: trialStart.toISOString(),
        trial_ends_at: trialEnd.toISOString(),
        subscription_status: 'trial'
      }, { id: user.business_id });

      await loadSubscription();
    } catch (err) {
      console.error('Error initializing trial:', err);
      setError('Failed to initialize trial');
    }
  }, [user?.business_id, loadSubscription]);

  // Start subscription
  const startSubscription = useCallback(async (tierId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    if (!user?.business_id || !user?.email) return;

    try {
      setLoading(true);
      setError(null);

      // Get pricing tier details
      const tierResult = await query('SELECT * FROM pricing_tiers WHERE id = ?', [tierId]);
      if (tierResult.length === 0) {
        throw new Error('Pricing tier not found');
      }

      const tier = tierResult[0];
      const amount = billingCycle === 'yearly' ? Number(tier.yearly_price_usd) : Number(tier.monthly_price_usd);
      const localAmount = convertFromUSD(amount);

      // Get business name
      const businessResult = await query('SELECT name FROM businesses WHERE id = ?', [user.business_id]);
      const businessName = businessResult.length > 0 ? businessResult[0].name : 'Unknown Business';

      // Get payment methods for user's country
      const paymentMethods = getPaymentMethods(currencyCode);
      const channels = paymentMethods.methods.map(m => {
        switch (m.id) {
          case 'mpesa': return 'mobile_money';
          case 'card': return 'card';
          case 'bank': return 'bank_transfer';
          case 'ussd': return 'ussd';
          default: return 'card';
        }
      });

      // Initialize Paystack transaction
      const transaction = await paystackAPI.initializeTransaction({
        email: user.email,
        amount: localAmount,
        currency: paymentMethods.currency,
        reference: `sub_${user.business_id}_${Date.now()}`,
        callback_url: `${window.location.origin}/billing/success`,
        metadata: {
          business_id: user.business_id,
          tier_id: tierId,
          billing_cycle: billingCycle,
          custom_fields: [
            {
              display_name: 'Business Name',
              variable_name: 'business_name',
              value: businessName
            }
          ]
        },
        channels
      });

      // Store transaction in database
      await insert('payment_transactions', {
        id: generateId(),
        business_id: user.business_id,
        paystack_reference: transaction.data.reference,
        paystack_transaction_id: transaction.data.id,
        amount_usd: amount,
        amount_local: localAmount,
        currency: paymentMethods.currency,
        status: 'pending',
        billing_cycle: billingCycle,
        pricing_tier_id: tierId,
        metadata: JSON.stringify({
          paystack_data: transaction.data,
          user_agent: navigator.userAgent,
          ip_address: null // Would be set by server
        })
      });

      return transaction.data;
    } catch (err) {
      console.error('Error starting subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to start subscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.business_id, user?.email, currencyCode, convertFromUSD]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (cancelImmediately: boolean = false) => {
    if (!subscription?.id) return;

    try {
      setLoading(true);
      setError(null);

      if (cancelImmediately) {
        // Cancel immediately
        await update('subscriptions', {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_at_period_end: 0
        }, { id: subscription.id });

        // Update business status
        await update('businesses', {
          subscription_status: 'cancelled'
        }, { id: user.business_id });
      } else {
        // Cancel at period end
        await update('subscriptions', {
          cancel_at_period_end: 1
        }, { id: subscription.id });
      }

      await loadSubscription();
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  }, [subscription?.id, user?.business_id, loadSubscription]);

  // Extend trial
  const extendTrial = useCallback(async (days: number = 7) => {
    if (!user?.business_id) return;

    try {
      setLoading(true);
      setError(null);

      const trialResult = await query(
        'SELECT * FROM subscription_trials WHERE business_id = ?',
        [user.business_id]
      );

      if (trialResult.length === 0) {
        throw new Error('No trial found');
      }

      const trial = trialResult[0];
      const newEndDate = new Date(String(trial.ends_at));
      newEndDate.setDate(newEndDate.getDate() + days);

      await update('subscription_trials', {
        ends_at: newEndDate.toISOString(),
        extended_count: Number(trial.extended_count) + 1
      }, { business_id: user.business_id });

      await update('businesses', {
        trial_ends_at: newEndDate.toISOString()
      }, { id: user.business_id });

      await loadSubscription();
    } catch (err) {
      console.error('Error extending trial:', err);
      setError('Failed to extend trial');
    } finally {
      setLoading(false);
    }
  }, [user?.business_id, loadSubscription]);

  // Get payment history
  const getPaymentHistory = useCallback(async () => {
    if (!user?.business_id) return [];

    try {
      const payments = await query(
        `SELECT * FROM payment_transactions
         WHERE business_id = ?
         ORDER BY created_at DESC`,
        [user.business_id]
      );

      return payments;
    } catch (err) {
      console.error('Error getting payment history:', err);
      return [];
    }
  }, [user?.business_id]);

  // Load subscription on mount and when business changes
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  return {
    subscription,
    loading,
    error,
    loadSubscription,
    initializeTrial,
    startSubscription,
    cancelSubscription,
    extendTrial,
    getPaymentHistory,
    paymentMethods: getPaymentMethods(currencyCode)
  };
};