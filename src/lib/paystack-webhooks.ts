import { query, insert, update } from './turso';
import { verifyWebhookSignature } from './paystack';
import { generateId } from './utils';

// Webhook event types
export type PaystackWebhookEvent =
  | 'charge.success'
  | 'charge.failed'
  | 'subscription.create'
  | 'subscription.disable'
  | 'invoice.create'
  | 'invoice.payment_failed';

export interface PaystackWebhookPayload {
  event: PaystackWebhookEvent;
  data: any;
}

// Process Paystack webhook
export async function processPaystackWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<{ success: boolean; message: string; reference?: string }> {
  try {
    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(payload, signature, secret);
    if (!isValidSignature) {
      throw new Error('Invalid webhook signature');
    }

    const webhookData: PaystackWebhookPayload = JSON.parse(payload);
    const { event, data } = webhookData;

    // Log webhook event for audit trail
    await insert('audit_logs', {
      id: generateId(),
      event_type: 'webhook_received',
      event_source: 'paystack',
      event_data: JSON.stringify({
        event,
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        status: data.status
      }),
      ip_address: null, // Would be set by server
      user_agent: null,
      created_at: new Date().toISOString()
    });

    switch (event) {
      case 'charge.success':
        return await handleChargeSuccess(data);

      case 'charge.failed':
        return await handleChargeFailed(data);

      case 'subscription.create':
        return await handleSubscriptionCreate(data);

      case 'subscription.disable':
        return await handleSubscriptionDisable(data);

      case 'invoice.create':
        return await handleInvoiceCreate(data);

      case 'invoice.payment_failed':
        return await handleInvoicePaymentFailed(data);

      default:
        console.log(`Unhandled webhook event: ${event}`);
        return { success: true, message: `Event ${event} logged but not processed` };
    }
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Log error for audit trail
    await insert('audit_logs', {
      id: generateId(),
      event_type: 'webhook_error',
      event_source: 'paystack',
      event_data: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        payload: payload.substring(0, 500) // Truncate for storage
      }),
      created_at: new Date().toISOString()
    });

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Webhook processing failed'
    };
  }
}

// Handle successful charge
async function handleChargeSuccess(data: any): Promise<{ success: boolean; message: string; reference?: string }> {
  const { reference, amount, currency, customer, metadata } = data;

  try {
    // Find the payment transaction
    const transactions = await query(
      'SELECT * FROM payment_transactions WHERE paystack_reference = ?',
      [reference]
    );

    if (transactions.length === 0) {
      throw new Error(`Transaction not found: ${reference}`);
    }

    const transaction = transactions[0];
    const businessId = String(transaction.business_id);

    // Update transaction status
    await update('payment_transactions', {
      status: 'success',
      paystack_transaction_id: data.id,
      processed_at: new Date().toISOString()
    }, { paystack_reference: reference });

    // Check if this is a subscription payment
    if (metadata?.tier_id) {
      // Create or update subscription
      const tierResult = await query('SELECT * FROM pricing_tiers WHERE id = ?', [metadata.tier_id]);
      if (tierResult.length === 0) {
        throw new Error('Pricing tier not found');
      }

      const tier = tierResult[0];
      const billingCycle = metadata.billing_cycle || 'monthly';

      // Calculate period dates
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

      // Check if subscription already exists
      const existingSubs = await query(
        'SELECT * FROM subscriptions WHERE business_id = ? AND status IN ("active", "trialing")',
        [businessId]
      );

      if (existingSubs.length > 0) {
        // Update existing subscription
        await update('subscriptions', {
          pricing_tier_id: metadata.tier_id,
          status: 'active',
          billing_cycle: billingCycle,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: 0
        }, { id: existingSubs[0].id });
      } else {
        // Create new subscription
        await insert('subscriptions', {
          id: generateId(),
          business_id: businessId,
          pricing_tier_id: metadata.tier_id,
          status: 'active',
          billing_cycle: billingCycle,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: 0
        });
      }

      // Update business status
      await update('businesses', {
        subscription_status: 'active',
        subscription_tier: String(tier.tier_code),
        subscription_started_at: now.toISOString(),
        subscription_expires_at: periodEnd.toISOString()
      }, { id: businessId });

      // Convert trial if it exists
      await update('subscription_trials', {
        converted_to_paid: 1,
        converted_at: now.toISOString()
      }, { business_id: businessId });

      // Log successful conversion
      await insert('audit_logs', {
        id: generateId(),
        event_type: 'subscription_activated',
        event_source: 'paystack_webhook',
        event_data: JSON.stringify({
          business_id: businessId,
          tier_id: metadata.tier_id,
          billing_cycle: billingCycle,
          amount: amount / 100, // Convert from kobo/cents
          currency
        }),
        created_at: new Date().toISOString()
      });
    }

    return {
      success: true,
      message: 'Payment processed successfully',
      reference
    };
  } catch (error) {
    console.error('Charge success processing error:', error);
    throw error;
  }
}

// Handle failed charge
async function handleChargeFailed(data: any): Promise<{ success: boolean; message: string; reference?: string }> {
  const { reference, failure_reason } = data;

  try {
    // Update transaction status
    await update('payment_transactions', {
      status: 'failed',
      failure_reason: failure_reason || 'Payment failed',
      processed_at: new Date().toISOString()
    }, { paystack_reference: reference });

    // Log failure
    await insert('audit_logs', {
      id: generateId(),
      event_type: 'payment_failed',
      event_source: 'paystack_webhook',
      event_data: JSON.stringify({
        reference,
        failure_reason: failure_reason || 'Unknown'
      }),
      created_at: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Payment failure logged',
      reference
    };
  } catch (error) {
    console.error('Charge failed processing error:', error);
    throw error;
  }
}

// Handle subscription create
async function handleSubscriptionCreate(data: any): Promise<{ success: boolean; message: string }> {
  // Paystack subscription created
  console.log('Paystack subscription created:', data.id);
  return { success: true, message: 'Subscription creation logged' };
}

// Handle subscription disable
async function handleSubscriptionDisable(data: any): Promise<{ success: boolean; message: string }> {
  // Paystack subscription disabled
  console.log('Paystack subscription disabled:', data.id);
  return { success: true, message: 'Subscription disable logged' };
}

// Handle invoice create
async function handleInvoiceCreate(data: any): Promise<{ success: boolean; message: string }> {
  // New invoice created for recurring payment
  console.log('Paystack invoice created:', data.id);
  return { success: true, message: 'Invoice creation logged' };
}

// Handle invoice payment failed
async function handleInvoicePaymentFailed(data: any): Promise<{ success: boolean; message: string }> {
  const { subscription, amount } = data;

  try {
    // Find subscription by Paystack subscription ID
    const subs = await query(
      'SELECT * FROM subscriptions WHERE paystack_subscription_id = ?',
      [subscription]
    );

    if (subs.length > 0) {
      const sub = subs[0];
      const businessId = String(sub.business_id);

      // Update subscription status to past_due
      await update('subscriptions', {
        status: 'past_due'
      }, { id: sub.id });

      // Update business status
      await update('businesses', {
        subscription_status: 'past_due'
      }, { id: businessId });

      // Log payment failure
      await insert('audit_logs', {
        id: generateId(),
        event_type: 'recurring_payment_failed',
        event_source: 'paystack_webhook',
        event_data: JSON.stringify({
          business_id: businessId,
          subscription_id: sub.id,
          amount: amount / 100,
          paystack_subscription_id: subscription
        }),
        created_at: new Date().toISOString()
      });
    }

    return { success: true, message: 'Recurring payment failure processed' };
  } catch (error) {
    console.error('Invoice payment failed processing error:', error);
    throw error;
  }
}

// Compliance audit trail functions
export async function getAuditLogs(filters: {
  event_type?: string;
  event_source?: string;
  business_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}) {
  let sql = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: any[] = [];

  if (filters.event_type) {
    sql += ' AND event_type = ?';
    params.push(filters.event_type);
  }

  if (filters.event_source) {
    sql += ' AND event_source = ?';
    params.push(filters.event_source);
  }

  if (filters.business_id) {
    sql += ' AND event_data LIKE ?';
    params.push(`%${filters.business_id}%`);
  }

  if (filters.date_from) {
    sql += ' AND created_at >= ?';
    params.push(filters.date_from);
  }

  if (filters.date_to) {
    sql += ' AND created_at <= ?';
    params.push(filters.date_to);
  }

  sql += ' ORDER BY created_at DESC';

  if (filters.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  return query(sql, params);
}

export async function getComplianceReport(businessId: string, period: { from: string; to: string }) {
  const [transactions, subscriptions, auditLogs] = await Promise.all([
    query(
      'SELECT * FROM payment_transactions WHERE business_id = ? AND created_at BETWEEN ? AND ? ORDER BY created_at DESC',
      [businessId, period.from, period.to]
    ),
    query(
      'SELECT * FROM subscriptions WHERE business_id = ? AND created_at BETWEEN ? AND ? ORDER BY created_at DESC',
      [businessId, period.from, period.to]
    ),
    query(
      'SELECT * FROM audit_logs WHERE event_data LIKE ? AND created_at BETWEEN ? AND ? ORDER BY created_at DESC',
      [`%${businessId}%`, period.from, period.to]
    )
  ]);

  return {
    business_id: businessId,
    period,
    transactions,
    subscriptions,
    audit_logs: auditLogs,
    generated_at: new Date().toISOString()
  };
}