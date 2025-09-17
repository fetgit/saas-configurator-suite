// ===================================================================
// SERVICE STRIPE - GESTION DES PRODUITS ET PRIX
// ===================================================================

const { stripe } = require('../config/stripe');

class StripeService {
  // ===================================================================
  // GESTION DES PRODUITS
  // ===================================================================

  /**
   * Crée un nouveau produit dans Stripe
   */
  static async createProduct(productData) {
    try {
      const product = await stripe.products.create({
        name: productData.name,
        description: productData.description,
        metadata: {
          plan_id: productData.id,
          features: JSON.stringify(productData.features),
          limits: JSON.stringify(productData.limits)
        }
      });

      return product;
    } catch (error) {
      console.error('Erreur lors de la création du produit Stripe:', error);
      throw error;
    }
  }

  /**
   * Met à jour un produit existant dans Stripe
   */
  static async updateProduct(stripeProductId, productData) {
    try {
      const product = await stripe.products.update(stripeProductId, {
        name: productData.name,
        description: productData.description,
        metadata: {
          plan_id: productData.id,
          features: JSON.stringify(productData.features),
          limits: JSON.stringify(productData.limits)
        }
      });

      return product;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit Stripe:', error);
      throw error;
    }
  }

  /**
   * Supprime un produit de Stripe
   */
  static async deleteProduct(stripeProductId) {
    try {
      const product = await stripe.products.del(stripeProductId);
      return product;
    } catch (error) {
      console.error('Erreur lors de la suppression du produit Stripe:', error);
      throw error;
    }
  }

  // ===================================================================
  // GESTION DES PRIX
  // ===================================================================

  /**
   * Crée un prix pour un produit dans Stripe
   */
  static async createPrice(productId, priceData) {
    try {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: priceData.price, // Prix en centimes
        currency: priceData.currency.toLowerCase(),
        recurring: {
          interval: priceData.interval === 'month' ? 'month' : 'year'
        },
        metadata: {
          plan_id: priceData.plan_id,
          interval: priceData.interval
        }
      });

      return price;
    } catch (error) {
      console.error('Erreur lors de la création du prix Stripe:', error);
      throw error;
    }
  }

  /**
   * Met à jour un prix existant dans Stripe
   */
  static async updatePrice(stripePriceId, priceData) {
    try {
      // Stripe ne permet pas de modifier un prix existant
      // Il faut créer un nouveau prix et archiver l'ancien
      const oldPrice = await stripe.prices.retrieve(stripePriceId);
      
      // Créer le nouveau prix
      const newPrice = await stripe.prices.create({
        product: oldPrice.product,
        unit_amount: priceData.price,
        currency: priceData.currency.toLowerCase(),
        recurring: {
          interval: priceData.interval === 'month' ? 'month' : 'year'
        },
        metadata: {
          plan_id: priceData.plan_id,
          interval: priceData.interval
        }
      });

      // Archiver l'ancien prix
      await stripe.prices.update(stripePriceId, {
        active: false
      });

      return newPrice;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prix Stripe:', error);
      throw error;
    }
  }

  // ===================================================================
  // GESTION DES ABONNEMENTS
  // ===================================================================

  /**
   * Crée un abonnement pour un client
   */
  static async createSubscription(customerId, priceId, options = {}) {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: options.trialDays || 0,
        metadata: {
          plan_id: options.planId,
          user_id: options.userId
        }
      });

      return subscription;
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement Stripe:', error);
      throw error;
    }
  }

  /**
   * Met à jour un abonnement existant
   */
  static async updateSubscription(subscriptionId, newPriceId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations'
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'abonnement Stripe:', error);
      throw error;
    }
  }

  /**
   * Annule un abonnement
   */
  static async cancelSubscription(subscriptionId, immediately = false) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately
      });

      if (immediately) {
        await stripe.subscriptions.del(subscriptionId);
      }

      return subscription;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement Stripe:', error);
      throw error;
    }
  }

  // ===================================================================
  // GESTION DES CLIENTS
  // ===================================================================

  /**
   * Crée un client Stripe
   */
  static async createCustomer(customerData) {
    try {
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        metadata: {
          user_id: customerData.userId,
          company: customerData.company
        }
      });

      return customer;
    } catch (error) {
      console.error('Erreur lors de la création du client Stripe:', error);
      throw error;
    }
  }

  /**
   * Met à jour un client Stripe
   */
  static async updateCustomer(customerId, customerData) {
    try {
      const customer = await stripe.customers.update(customerId, {
        email: customerData.email,
        name: customerData.name,
        metadata: {
          user_id: customerData.userId,
          company: customerData.company
        }
      });

      return customer;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client Stripe:', error);
      throw error;
    }
  }

  // ===================================================================
  // RÉCUPÉRATION DES DONNÉES
  // ===================================================================

  /**
   * Récupère tous les produits Stripe
   */
  static async getAllProducts() {
    try {
      const products = await stripe.products.list({
        active: true,
        limit: 100
      });

      return products.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits Stripe:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les prix Stripe
   */
  static async getAllPrices() {
    try {
      const prices = await stripe.prices.list({
        active: true,
        limit: 100
      });

      return prices.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des prix Stripe:', error);
      throw error;
    }
  }

  /**
   * Récupère un produit avec ses prix
   */
  static async getProductWithPrices(productId) {
    try {
      const product = await stripe.products.retrieve(productId);
      const prices = await stripe.prices.list({
        product: productId,
        active: true
      });

      return {
        product,
        prices: prices.data
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du produit avec prix:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les abonnements
   */
  static async getAllSubscriptions(options = {}) {
    try {
      const subscriptions = await stripe.subscriptions.list({
        limit: options.limit || 100,
        status: options.status || 'all'
      });

      return subscriptions.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des abonnements Stripe:', error);
      throw error;
    }
  }

  // ===================================================================
  // ANALYTICS ET STATISTIQUES
  // ===================================================================

  /**
   * Récupère les statistiques de revenus
   */
  static async getRevenueStats(startDate, endDate) {
    try {
      const invoices = await stripe.invoices.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000)
        },
        status: 'paid',
        limit: 100
      });

      let totalRevenue = 0;
      const revenueByPlan = {};

      for (const invoice of invoices.data) {
        totalRevenue += invoice.amount_paid;
        
        // Extraire le plan_id des métadonnées
        const planId = invoice.subscription_details?.metadata?.plan_id;
        if (planId) {
          revenueByPlan[planId] = (revenueByPlan[planId] || 0) + invoice.amount_paid;
        }
      }

      return {
        totalRevenue,
        revenueByPlan,
        invoiceCount: invoices.data.length
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de revenus:', error);
      throw error;
    }
  }

  // ===================================================================
  // WEBHOOKS
  // ===================================================================

  /**
   * Construit l'événement webhook Stripe
   */
  static constructWebhookEvent(payload, signature, secret) {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error) {
      console.error('Erreur lors de la construction de l\'événement webhook:', error);
      throw error;
    }
  }

  // ===================================================================
  // UTILITAIRES
  // ===================================================================

  /**
   * Teste la connexion à Stripe
   */
  static async testConnection() {
    try {
      // Vérifier si la clé Stripe est configurée
      if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe_secret_key')) {
        return {
          connected: false,
          error: 'Clé Stripe non configurée'
        };
      }
      
      const account = await stripe.accounts.retrieve();
      return {
        connected: true,
        accountId: account.id,
        country: account.country,
        currency: account.default_currency
      };
    } catch (error) {
      console.error('Erreur lors du test de connexion Stripe:', error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Formate un prix pour l'affichage
   */
  static formatPrice(amount, currency = 'eur') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  }
}

module.exports = StripeService;
