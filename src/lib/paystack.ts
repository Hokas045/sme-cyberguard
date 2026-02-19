import { generateId } from './utils';

// Paystack configuration
export const PAYSTACK_CONFIG = {
  publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
  secretKey: import.meta.env.VITE_PAYSTACK_SECRET_KEY || '',
  baseUrl: 'https://api.paystack.co'
};

// Payment method configurations by country
export const PAYMENT_METHODS = {
  KE: {
    name: 'Kenya',
    currency: 'KES',
    methods: [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
      { id: 'mpesa', name: 'M-Pesa', icon: '📱' },
      { id: 'bank', name: 'Bank Transfer', icon: '🏦' }
    ],
    default: 'mpesa'
  },
  NG: {
    name: 'Nigeria',
    currency: 'NGN',
    methods: [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
      { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
      { id: 'ussd', name: 'USSD', icon: '📞' }
    ],
    default: 'card'
  },
  GH: {
    name: 'Ghana',
    currency: 'GHS',
    methods: [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
      { id: 'mobile_money', name: 'Mobile Money', icon: '📱' }
    ],
    default: 'card'
  },
  ZA: {
    name: 'South Africa',
    currency: 'ZAR',
    methods: [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳' }
    ],
    default: 'card'
  },
  DEFAULT: {
    name: 'International',
    currency: 'USD',
    methods: [
      { id: 'card', name: 'Credit/Debit Card', icon: '💳' }
    ],
    default: 'card'
  }
};

// Get payment methods for a country
export const getPaymentMethods = (countryCode: string) => {
  return PAYMENT_METHODS[countryCode as keyof typeof PAYMENT_METHODS] || PAYMENT_METHODS.DEFAULT;
};

// Paystack API utilities
export class PaystackAPI {
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${PAYSTACK_CONFIG.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Paystack API error');
    }

    return response.json();
  }

  // Initialize transaction
  async initializeTransaction(params: {
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    callback_url?: string;
    metadata?: any;
    channels?: string[];
  }) {
    return this.request('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        reference: params.reference || generateId(),
        amount: Math.round(params.amount * 100), // Convert to kobo/cents
        channels: params.channels || ['card']
      })
    });
  }

  // Verify transaction
  async verifyTransaction(reference: string) {
    return this.request(`/transaction/verify/${reference}`);
  }

  // Create subscription
  async createSubscription(params: {
    customer: string;
    plan: string;
    authorization?: string;
    start_date?: string;
  }) {
    return this.request('/subscription', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  // Create plan
  async createPlan(params: {
    name: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    currency?: string;
    description?: string;
  }) {
    return this.request('/plan', {
      method: 'POST',
      body: JSON.stringify({
        ...params,
        amount: Math.round(params.amount * 100)
      })
    });
  }

  // List transactions
  async listTransactions(params: {
    reference?: string;
    customer?: string;
    status?: string;
    page?: number;
    perPage?: number;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return this.request(`/transaction?${queryParams}`);
  }
}

// Initialize Paystack API instance
export const paystackAPI = new PaystackAPI(PAYSTACK_CONFIG.secretKey);

// Webhook signature verification
export const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha512', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
};

// Payment status types
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'reversed';

// Subscription status types
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';

// Trial status
export interface TrialStatus {
  isOnTrial: boolean;
  daysRemaining: number;
  trialEndsAt: Date | null;
  canExtend: boolean;
}

// Subscription info
export interface SubscriptionInfo {
  id: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialStatus: TrialStatus;
  planName: string;
  amount: number;
  currency: string;
  nextBillingDate: Date | null;
}