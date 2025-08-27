// ===================================================================
// STRIPE HOOKS
// Frontend hooks for Stripe payment integration
// Compatible with any backend that implements the payment endpoints
// ===================================================================

import { useState, useCallback } from 'react';
import { useMutation } from './useApi';
import { BillingService } from '@/services';
import type { BillingApi } from '@/types/api';

// ===================================================================
// STRIPE CHECKOUT HOOK
// ===================================================================

export interface UseStripeCheckoutOptions {
  onSuccess?: (sessionId: string) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
}

export function useStripeCheckout(options: UseStripeCheckoutOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutMutation = useMutation(
    async (request: BillingApi.CreateCheckoutRequest) => {
      return { success: true, data: await BillingService.createCheckout(request) };
    },
    {
      onSuccess: (checkoutUrl) => {
        // Open Stripe checkout in new tab by default
        const newTab = window.open(checkoutUrl, '_blank');
        if (!newTab) {
          // Fallback: redirect in same tab if popup blocked
          window.location.href = checkoutUrl;
        }
        options.onSuccess?.(checkoutUrl);
      },
      onError: (error) => {
        options.onError?.(new Error(error.message));
      },
    }
  );

  const startCheckout = useCallback(async (
    planId: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    customUrls?: { successUrl?: string; cancelUrl?: string }
  ) => {
    setIsLoading(true);
    
    try {
      const baseUrl = window.location.origin;
      const request: BillingApi.CreateCheckoutRequest = {
        plan_id: planId,
        billing_cycle: billingCycle,
        success_url: customUrls?.successUrl || `${baseUrl}/billing/success`,
        cancel_url: customUrls?.cancelUrl || `${baseUrl}/billing/cancel`,
      };

      await createCheckoutMutation.mutateAsync(request);
    } finally {
      setIsLoading(false);
    }
  }, [createCheckoutMutation, options]);

  return {
    startCheckout,
    isLoading: isLoading || createCheckoutMutation.loading,
    error: createCheckoutMutation.error,
  };
}

// ===================================================================
// STRIPE CUSTOMER PORTAL HOOK
// ===================================================================

export interface UseStripePortalOptions {
  onSuccess?: (portalUrl: string) => void;
  onError?: (error: Error) => void;
}

export function useStripePortal(options: UseStripePortalOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const createPortalMutation = useMutation(
    async () => {
      return { success: true, data: await BillingService.createCustomerPortal() };
    },
    {
      onSuccess: (portalUrl) => {
        // Open portal in new tab
        const newTab = window.open(portalUrl, '_blank');
        if (!newTab) {
          // Fallback: redirect in same tab if popup blocked
          window.location.href = portalUrl;
        }
        options.onSuccess?.(portalUrl);
      },
      onError: (error) => {
        options.onError?.(new Error(error.message));
      },
    }
  );

  const openPortal = useCallback(async () => {
    setIsLoading(true);
    try {
      await createPortalMutation.mutateAsync({});
    } finally {
      setIsLoading(false);
    }
  }, [createPortalMutation]);

  return {
    openPortal,
    isLoading: isLoading || createPortalMutation.loading,
    error: createPortalMutation.error,
  };
}

// ===================================================================
// SUBSCRIPTION MANAGEMENT HOOK
// ===================================================================

export function useSubscriptionManagement() {
  const changeSubscriptionMutation = useMutation(
    async (params: { planId: string; billingCycle?: 'monthly' | 'yearly' }) => {
      await BillingService.changeSubscription(params.planId, params.billingCycle);
      return { success: true, data: null };
    }
  );

  const cancelSubscriptionMutation = useMutation(
    async (params: { reason?: string; immediately?: boolean }) => {
      await BillingService.cancelSubscription(params.reason, params.immediately);
      return { success: true, data: null };
    }
  );

  const changePlan = useCallback(async (
    planId: string, 
    billingCycle?: 'monthly' | 'yearly'
  ) => {
    return changeSubscriptionMutation.mutateAsync({ planId, billingCycle });
  }, [changeSubscriptionMutation]);

  const cancelSubscription = useCallback(async (
    reason?: string, 
    immediately = false
  ) => {
    return cancelSubscriptionMutation.mutateAsync({ reason, immediately });
  }, [cancelSubscriptionMutation]);

  return {
    changePlan,
    cancelSubscription,
    isChanging: changeSubscriptionMutation.loading,
    isCanceling: cancelSubscriptionMutation.loading,
    changeError: changeSubscriptionMutation.error,
    cancelError: cancelSubscriptionMutation.error,
  };
}

// ===================================================================
// ONE-TIME PAYMENT HOOK
// ===================================================================

export interface UseOneTimePaymentOptions {
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
}

export function useOneTimePayment(options: UseOneTimePaymentOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const createPaymentMutation = useMutation(
    (request: { amount: number; currency?: string; description?: string }) => 
      // This would call a one-time payment endpoint
      // Implementation depends on your backend setup
      fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }).then(res => res.json()),
    {
      onSuccess: (data) => {
        // Handle successful payment intent creation
        // You might redirect to a payment page or show payment form
        options.onSuccess?.(data.payment_intent_id);
      },
      onError: (error) => {
        options.onError?.(new Error(error.message));
      },
    }
  );

  const createPayment = useCallback(async (
    amount: number,
    currency = 'usd',
    description?: string
  ) => {
    setIsLoading(true);
    
    try {
      await createPaymentMutation.mutateAsync({
        amount,
        currency,
        description,
      });
    } finally {
      setIsLoading(false);
    }
  }, [createPaymentMutation]);

  return {
    createPayment,
    isLoading: isLoading || createPaymentMutation.loading,
    error: createPaymentMutation.error,
  };
}

// ===================================================================
// PAYMENT METHODS HOOK
// ===================================================================

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPaymentMethods = useCallback(async () => {
    setIsLoading(true);
    try {
      // This would call your backend to get payment methods
      const response = await fetch('/api/billing/payment-methods');
      const data = await response.json();
      setPaymentMethods(data.payment_methods || []);
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method_id: paymentMethodId }),
      });
      
      // Refresh payment methods
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to add payment method:', error);
      throw error;
    }
  }, [fetchPaymentMethods]);

  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      await fetch(`/api/billing/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });
      
      // Refresh payment methods
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to remove payment method:', error);
      throw error;
    }
  }, [fetchPaymentMethods]);

  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      await fetch(`/api/billing/payment-methods/${paymentMethodId}/default`, {
        method: 'POST',
      });
      
      // Refresh payment methods
      await fetchPaymentMethods();
    } catch (error) {
      console.error('Failed to set default payment method:', error);
      throw error;
    }
  }, [fetchPaymentMethods]);

  return {
    paymentMethods,
    isLoading,
    fetchPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
  };
}

// ===================================================================
// STRIPE WEBHOOK VERIFICATION (for backend reference)
// ===================================================================

/**
 * Server-side webhook handler example (for reference)
 * This would be implemented in your backend
 */
export const stripeWebhookHandler = `
// backend/webhooks/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/webhooks/stripe', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('Webhook signature verification failed.', err.message);
    return res.status(400).send('Webhook Error: ' + err.message);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
      const subscription = event.data.object;
      // Update user subscription in database
      await updateUserSubscription(subscription);
      break;
    case 'customer.subscription.updated':
      // Handle subscription updates
      break;
    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      break;
    case 'invoice.payment_succeeded':
      // Handle successful payment
      break;
    case 'invoice.payment_failed':
      // Handle failed payment
      break;
    default:
      console.log('Unhandled event type: ' + event.type);
  }

  res.json({received: true});
});
`;

// ===================================================================
// PRICING DISPLAY HELPERS
// ===================================================================

export function formatPrice(
  amount: number, 
  currency = 'USD', 
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}

export function calculateYearlySavings(
  monthlyPrice: number, 
  yearlyPrice: number
): { savings: number; percentage: number } {
  const monthlyCost = monthlyPrice * 12;
  const savings = monthlyCost - yearlyPrice;
  const percentage = Math.round((savings / monthlyCost) * 100);
  
  return { savings, percentage };
}

// ===================================================================
// STRIPE ELEMENTS INTEGRATION (for custom payment forms)
// ===================================================================

export interface UseStripeElementsOptions {
  clientSecret?: string;
  appearance?: any;
  locale?: string;
}

export function useStripeElements(options: UseStripeElementsOptions = {}) {
  const [elements, setElements] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);

  // This would integrate with @stripe/stripe-js if you want custom payment forms
  // const initializeStripe = useCallback(async () => {
  //   const stripeInstance = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  //   setStripe(stripeInstance);
  //   
  //   if (options.clientSecret && stripeInstance) {
  //     const elementsInstance = stripeInstance.elements({
  //       clientSecret: options.clientSecret,
  //       appearance: options.appearance,
  //       locale: options.locale,
  //     });
  //     setElements(elementsInstance);
  //   }
  // }, [options]);

  return {
    stripe,
    elements,
    // initializeStripe,
  };
}

// ===================================================================
// EXPORT ALL HOOKS
// ===================================================================

export default {
  useStripeCheckout,
  useStripePortal,
  useSubscriptionManagement,
  useOneTimePayment,
  usePaymentMethods,
  useStripeElements,
  formatPrice,
  calculateYearlySavings,
};