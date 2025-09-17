// ===================================================================
// CONFIGURATION STRIPE
// ===================================================================

const stripe = require('stripe');

// Configuration Stripe
const stripeConfig = {
  // Clés Stripe - à configurer dans les variables d'environnement
  secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_...',
  
  // Configuration par défaut
  defaultCurrency: 'eur',
  defaultTrialDays: 14,
  
  // URLs de redirection
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:8080/success',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:8080/cancel',
  
  // Configuration des webhooks
  webhookTolerance: 300, // 5 minutes
};

// Initialiser Stripe
const stripeInstance = stripe(stripeConfig.secretKey);

module.exports = {
  stripe: stripeInstance,
  config: stripeConfig
};
