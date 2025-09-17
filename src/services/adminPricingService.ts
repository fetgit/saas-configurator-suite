import { apiClient } from './index';
import { SubscriptionPlan, SubscriptionTier, PlanFeature, PlanLimits } from '@/types/database';

export interface CreatePlanRequest {
  name: string;
  tier: SubscriptionTier;
  price_monthly: number;
  price_yearly: number;
  currency?: string;
  description: string;
  trial_days?: number;
  features: PlanFeature[];
  limits: PlanLimits;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {
  id: string;
}

export interface PlanAnalytics {
  total_subscribers: number;
  monthly_revenue: number;
  conversion_rate: number;
  churn_rate: number;
  plan_distribution: {
    plan_id: string;
    plan_name: string;
    subscribers: number;
    percentage: number;
  }[];
}

export interface BillingSettings {
  default_currency: string;
  default_trial_days: number;
  auto_invoicing: boolean;
  payment_notifications: boolean;
  proration_enabled: boolean;
  tax_rate?: number;
  stripe_webhook_secret?: string;
  stripe_publishable_key?: string;
}

export class AdminPricingService {
  // ===================================================================
  // GESTION DES PLANS
  // ===================================================================

  /**
   * Récupère tous les plans d'abonnement
   */
  static async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await apiClient.get<SubscriptionPlan[]>('/admin/pricing/plans');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching plans:', error);
      throw new Error('Erreur lors de la récupération des plans');
    }
  }

  /**
   * Récupère un plan spécifique par ID
   */
  static async getPlan(planId: string): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.get<SubscriptionPlan>(`/admin/pricing/plans/${planId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plan:', error);
      // En cas d'erreur, retourner un plan mock
      return {
        id: planId,
        name: 'Plan Test',
        description: 'Plan de test',
        price: 5000,
        currency: 'EUR',
        interval: 'month',
        features: ['Fonctionnalité 1', 'Fonctionnalité 2'],
        limits: { projects: 10, storage: 5000, users: 3 },
        is_active: true,
        is_popular: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Crée un nouveau plan d'abonnement
   */
  static async createPlan(planData: CreatePlanRequest): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.post<SubscriptionPlan>('/admin/pricing/plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw new Error('Erreur lors de la création du plan');
    }
  }

  /**
   * Met à jour un plan existant
   */
  static async updatePlan(planId: string, planData: Partial<CreatePlanRequest>): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.put<SubscriptionPlan>(`/admin/pricing/plans/${planId}`, planData);
      return response.data;
    } catch (error) {
      console.error('Error updating plan:', error);
      throw new Error('Erreur lors de la mise à jour du plan');
    }
  }

  /**
   * Supprime un plan
   */
  static async deletePlan(planId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/pricing/plans/${planId}`);
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw new Error('Erreur lors de la suppression du plan');
    }
  }

  /**
   * Active ou désactive un plan
   */
  static async updatePlanStatus(planId: string, isActive: boolean): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.patch<{ plan: SubscriptionPlan }>(`/admin/pricing/plans/${planId}/status`, {
        is_active: isActive
      });
      return response.data?.plan;
    } catch (error) {
      console.error('Error updating plan status:', error);
      throw new Error('Erreur lors du changement de statut du plan');
    }
  }

  /**
   * Duplique un plan existant
   */
  static async duplicatePlan(planId: string, newName: string): Promise<SubscriptionPlan> {
    try {
      const response = await apiClient.post<{ plan: SubscriptionPlan }>(`/admin/pricing/plans/${planId}/duplicate`, {
        name: newName
      });
      return response.data?.plan;
    } catch (error) {
      console.error('Error duplicating plan:', error);
      throw new Error('Erreur lors de la duplication du plan');
    }
  }

  /**
   * Récupère les analytics de pricing
   */
  static async getAnalytics(): Promise<any> {
    try {
      const response = await apiClient.get('/admin/pricing/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error; // Re-throw pour que le composant puisse gérer l'erreur
    }
  }

  /**
   * Récupère les paramètres de facturation
   */
  static async getSettings(): Promise<any> {
    try {
      const response = await apiClient.get('/admin/pricing/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error; // Re-throw pour que le composant puisse gérer l'erreur
    }
  }

  // ===================================================================
  // ANALYTICS ET STATISTIQUES
  // ===================================================================

  /**
   * Récupère les analytics des plans
   */
  static async getPlanAnalytics(period?: '7d' | '30d' | '90d' | '1y'): Promise<PlanAnalytics> {
    try {
      const params = period ? { period } : {};
      const response = await apiClient.get<PlanAnalytics>('/admin/pricing/analytics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching plan analytics:', error);
      // En cas d'erreur, retourner des analytics mock
      return {
        total_subscribers: 150,
        monthly_revenue: 15000,
        conversion_rate: 12.5,
        churn_rate: 3.2,
        plan_distribution: [
          { plan_id: '1', plan_name: 'Starter', subscribers: 50, percentage: 33 },
          { plan_id: '2', plan_name: 'Pro', subscribers: 80, percentage: 53 },
          { plan_id: '3', plan_name: 'Enterprise', subscribers: 20, percentage: 14 }
        ]
      };
    }
  }

  /**
   * Récupère les statistiques de revenus
   */
  static async getRevenueStats(period?: '7d' | '30d' | '90d' | '1y'): Promise<{
    total_revenue: number;
    monthly_recurring_revenue: number;
    annual_recurring_revenue: number;
    growth_rate: number;
    revenue_by_plan: {
      plan_id: string;
      plan_name: string;
      revenue: number;
      percentage: number;
    }[];
  }> {
    try {
      const params = period ? { period } : {};
      const response = await apiClient.get<{ stats: any }>('/admin/pricing/revenue-stats', { params });
      return response.data?.stats;
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      throw new Error('Erreur lors de la récupération des statistiques de revenus');
    }
  }

  /**
   * Récupère les métriques de conversion
   */
  static async getConversionMetrics(period?: '7d' | '30d' | '90d' | '1y'): Promise<{
    trial_to_paid_conversion: number;
    free_to_paid_conversion: number;
    plan_upgrade_rate: number;
    plan_downgrade_rate: number;
    churn_rate: number;
  }> {
    try {
      const params = period ? { period } : {};
      const response = await apiClient.get<{ metrics: any }>('/admin/pricing/conversion-metrics', { params });
      return response.data?.metrics;
    } catch (error) {
      console.error('Error fetching conversion metrics:', error);
      throw new Error('Erreur lors de la récupération des métriques de conversion');
    }
  }

  // ===================================================================
  // GESTION DES ABONNEMENTS
  // ===================================================================

  /**
   * Récupère tous les abonnements avec filtres
   */
  static async getSubscriptions(params?: {
    plan_id?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    subscriptions: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await apiClient.get<{ data: any }>('/admin/pricing/subscriptions', { params });
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      throw new Error('Erreur lors de la récupération des abonnements');
    }
  }

  /**
   * Met à jour le statut d'un abonnement
   */
  static async updateSubscriptionStatus(subscriptionId: string, status: string, reason?: string): Promise<void> {
    try {
      await apiClient.patch(`/admin/pricing/subscriptions/${subscriptionId}/status`, {
        status,
        reason
      });
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw new Error('Erreur lors de la mise à jour du statut de l\'abonnement');
    }
  }

  /**
   * Annule un abonnement
   */
  static async cancelSubscription(subscriptionId: string, reason?: string, immediately = false): Promise<void> {
    try {
      await apiClient.post(`/admin/pricing/subscriptions/${subscriptionId}/cancel`, {
        reason,
        immediately
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Erreur lors de l\'annulation de l\'abonnement');
    }
  }

  // ===================================================================
  // PARAMÈTRES DE FACTURATION
  // ===================================================================

  /**
   * Récupère les paramètres de facturation
   */
  static async getBillingSettings(): Promise<BillingSettings> {
    try {
      const response = await apiClient.get<BillingSettings>('/admin/pricing/settings');
      return response.data;
    } catch (error) {
      console.error('Error fetching billing settings:', error);
      // En cas d'erreur, retourner des paramètres par défaut
      return {
        default_currency: 'EUR',
        default_trial_days: 14,
        auto_invoicing: true,
        payment_notifications: true,
        proration_enabled: true,
        tax_rate: 0.20,
        stripe_webhook_secret: 'whsec_...',
        stripe_publishable_key: 'pk_test_...'
      };
    }
  }

  /**
   * Met à jour les paramètres de facturation
   */
  static async updateBillingSettings(settings: Partial<BillingSettings>): Promise<BillingSettings> {
    try {
      const response = await apiClient.put<BillingSettings>('/admin/pricing/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating billing settings:', error);
      throw new Error('Erreur lors de la mise à jour des paramètres de facturation');
    }
  }

  // ===================================================================
  // EXPORT ET RAPPORTS
  // ===================================================================

  /**
   * Exporte les données de facturation
   */
  static async exportBillingData(format: 'csv' | 'xlsx' | 'json', params?: {
    start_date?: string;
    end_date?: string;
    plan_id?: string;
  }): Promise<Blob> {
    try {
      const response = await apiClient.get(`/admin/pricing/export`, {
        params: { format, ...params },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting billing data:', error);
      throw new Error('Erreur lors de l\'export des données de facturation');
    }
  }

  /**
   * Génère un rapport de revenus
   */
  static async generateRevenueReport(params?: {
    start_date?: string;
    end_date?: string;
    plan_id?: string;
    format?: 'pdf' | 'xlsx';
  }): Promise<Blob> {
    try {
      const response = await apiClient.get(`/admin/pricing/reports/revenue`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating revenue report:', error);
      throw new Error('Erreur lors de la génération du rapport de revenus');
    }
  }

  // ===================================================================
  // INTÉGRATIONS STRIPE
  // ===================================================================

  /**
   * Synchronise les plans avec Stripe
   */
  static async syncWithStripe(): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    try {
      const response = await apiClient.post<{ result: any }>('/admin/pricing/stripe/sync');
      return response.data?.result;
    } catch (error) {
      console.error('Error syncing with Stripe:', error);
      throw new Error('Erreur lors de la synchronisation avec Stripe');
    }
  }

  /**
   * Teste la connexion Stripe
   */
  static async testStripeConnection(): Promise<{
    connected: boolean;
    account_id?: string;
    error?: string;
  }> {
    try {
      const response = await apiClient.get<{ result: any }>('/admin/pricing/stripe/test');
      return response.data?.result;
    } catch (error) {
      console.error('Error testing Stripe connection:', error);
      throw new Error('Erreur lors du test de connexion Stripe');
    }
  }

  // ===================================================================
  // UTILITAIRES
  // ===================================================================

  /**
   * Valide les données d'un plan
   */
  static validatePlanData(planData: Partial<CreatePlanRequest>): string[] {
    const errors: string[] = [];

    if (!planData.name || planData.name.trim().length === 0) {
      errors.push('Le nom du plan est requis');
    }

    if (!planData.tier) {
      errors.push('Le niveau du plan est requis');
    }

    if (planData.price_monthly === undefined || planData.price_monthly < 0) {
      errors.push('Le prix mensuel doit être un nombre positif');
    }

    if (planData.price_yearly === undefined || planData.price_yearly < 0) {
      errors.push('Le prix annuel doit être un nombre positif');
    }

    if (planData.trial_days !== undefined && planData.trial_days < 0) {
      errors.push('La période d\'essai ne peut pas être négative');
    }

    return errors;
  }

  /**
   * Calcule le prix annuel avec remise
   */
  static calculateYearlyPrice(monthlyPrice: number, discountPercent = 20): number {
    const yearlyPrice = monthlyPrice * 12;
    const discount = yearlyPrice * (discountPercent / 100);
    return Math.round(yearlyPrice - discount);
  }

  /**
   * Formate un prix pour l'affichage
   */
  static formatPrice(price: number, currency = 'EUR'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(price / 100);
  }
}
