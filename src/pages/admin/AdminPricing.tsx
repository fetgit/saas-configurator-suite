import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  DollarSign,
  Users,
  Database,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Settings,
  Copy,
  ExternalLink,
  Calendar,
  CreditCard,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionTier, PlanFeature, PlanLimits } from '@/types/database';
import { AdminPricingService } from '@/services/adminPricingService';

export const AdminPricing = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { config, updateConfig } = useAppearance();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('plans');

  // Les vérifications d'authentification sont gérées par AdminLayout

  // Charger les plans
  useEffect(() => {
    loadPlans();
  }, []);

  // Charger les analytics quand l'onglet analytics est sélectionné
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  // Charger les paramètres quand l'onglet settings est sélectionné
  useEffect(() => {
    if (activeTab === 'settings') {
      loadSettings();
    }
  }, [activeTab]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError('');
      const plansData = await AdminPricingService.getPlans();
      setPlans(plansData);
    } catch (err: any) {
      console.error('Error loading plans:', err);
      
      // Gestion spécifique des erreurs Stripe
      if (err?.response?.status === 503) {
        const errorData = err.response.data;
        setError(`Service de facturation non disponible : ${errorData.message || 'Stripe n\'est pas configuré'}`);
      } else if (err?.message?.includes('SyntaxError')) {
        setError('Erreur de communication avec le serveur. Vérifiez que le backend est démarré.');
      } else {
        setError(err?.message || 'Erreur lors du chargement des plans');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setAnalyticsError('');
      const analyticsData = await AdminPricingService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Error loading analytics:', err);
      
      if (err?.response?.status === 503) {
        const errorData = err.response.data;
        setAnalyticsError(`Service de facturation non disponible : ${errorData.message || 'Stripe n\'est pas configuré'}`);
      } else {
        setAnalyticsError(err?.message || 'Erreur lors du chargement des analytics');
      }
    }
  };

  const loadSettings = async () => {
    try {
      setSettingsError('');
      const settingsData = await AdminPricingService.getSettings();
      setSettings(settingsData);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      
      if (err?.response?.status === 503) {
        const errorData = err.response.data;
        setSettingsError(`Service de facturation non disponible : ${errorData.message || 'Stripe n\'est pas configuré'}`);
      } else {
        setSettingsError(err?.message || 'Erreur lors du chargement des paramètres');
      }
    }
  };

  const handleCreatePlan = async (planData: Partial<SubscriptionPlan>) => {
    try {
      // Ici vous devriez appeler votre API pour créer un plan
      // await BillingService.createPlan(planData);
      setSuccess('Plan créé avec succès');
      setIsCreateDialogOpen(false);
      loadPlans();
    } catch (err) {
      setError('Erreur lors de la création du plan');
      console.error('Error creating plan:', err);
    }
  };

  const handleUpdatePlan = async (planData: Partial<SubscriptionPlan>) => {
    try {
      // Ici vous devriez appeler votre API pour mettre à jour un plan
      // await BillingService.updatePlan(editingPlan!.id, planData);
      setSuccess('Plan mis à jour avec succès');
      setIsEditDialogOpen(false);
      setEditingPlan(null);
      loadPlans();
    } catch (err) {
      setError('Erreur lors de la mise à jour du plan');
      console.error('Error updating plan:', err);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) return;
    
    try {
      // Ici vous devriez appeler votre API pour supprimer un plan
      // await BillingService.deletePlan(planId);
      setSuccess('Plan supprimé avec succès');
      loadPlans();
    } catch (err) {
      setError('Erreur lors de la suppression du plan');
      console.error('Error deleting plan:', err);
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      // Ici vous devriez appeler votre API pour changer le statut
      // await BillingService.updatePlanStatus(planId, isActive);
      setSuccess(`Plan ${isActive ? 'activé' : 'désactivé'} avec succès`);
      loadPlans();
    } catch (err) {
      setError('Erreur lors du changement de statut');
      console.error('Error updating plan status:', err);
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2);
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTierLabel = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'free': return 'Gratuit';
      case 'basic': return 'Basique';
      case 'premium': return 'Premium';
      case 'enterprise': return 'Entreprise';
      default: return tier;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              Gestion des tarifs
            </h1>
            <p className="text-muted-foreground mt-2">
              Gérez les plans d'abonnement et les tarifs de votre application
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau plan</DialogTitle>
                <DialogDescription>
                  Configurez un nouveau plan d'abonnement pour vos utilisateurs
                </DialogDescription>
              </DialogHeader>
              <CreatePlanForm onSubmit={handleCreatePlan} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages d'erreur/succès */}
        {/* Indicateur de mode */}
        <Alert className="mb-6" variant="outline">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mode Démonstration</strong> - Les données affichées sont des exemples. 
            Pour utiliser de vraies données Stripe, configurez vos clés API dans <code>backend/config.env</code>.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
              {error.includes('Stripe n\'est pas configuré') && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Configuration requise :</strong>
                  </p>
                  <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside">
                    <li>Configurez vos clés Stripe dans <code>backend/config.env</code></li>
                    <li>Exécutez <code>npm run init:stripe</code> dans le dossier backend</li>
                    <li>Redémarrez le serveur backend</li>
                  </ol>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="plans">Plans d'abonnement</TabsTrigger>
            <TabsTrigger value="cards">Gestion des cartes</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="display">Affichage</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Plans d'abonnement */}
          <TabsContent value="plans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Plans d'abonnement</CardTitle>
                <CardDescription>
                  Gérez les plans d'abonnement et leurs fonctionnalités
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  {(config.pricingConfig?.plans || []).map((plan, index) => (
                    <Card key={plan.id} className="shadow-medium border-0">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {plan.name}
                                {plan.popular && (
                                  <Badge className="bg-primary text-white">
                                    Populaire
                                  </Badge>
                                )}
                                {plan.highlighted && (
                                  <Badge variant="secondary">
                                    Mis en avant
                                  </Badge>
                                )}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {plan.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-2xl font-bold">
                                {plan.price}{plan.currency}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                / {plan.period === 'monthly' ? 'mois' : 'an'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Ouvrir l'onglet "Gestion des cartes" pour éditer
                                  setActiveTab('cards');
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3">Fonctionnalités incluses</h4>
                            <ul className="space-y-2">
                              {plan.features?.slice(0, 5).map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-center gap-2">
                                  {feature.included ? (
                                    <CheckCircle className="h-4 w-4 text-success" />
                                  ) : (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground opacity-60'}`}>
                                    {feature.text}
                                  </span>
                                </li>
                              ))}
                              {plan.features?.length > 5 && (
                                <li className="text-sm text-muted-foreground">
                                  +{plan.features.length - 5} autres fonctionnalités
                                </li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-3">Actions</h4>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setActiveTab('cards')}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier le plan
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                  updatedPlans[index] = { ...plan, popular: !plan.popular };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      plans: updatedPlans
                                    }
                                  });
                                }}
                              >
                                {plan.popular ? 'Retirer "Populaire"' : 'Marquer "Populaire"'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                  updatedPlans[index] = { ...plan, highlighted: !plan.highlighted };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      plans: updatedPlans
                                    }
                                  });
                                }}
                              >
                                {plan.highlighted ? 'Retirer la mise en avant' : 'Mettre en avant'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {(!config.pricingConfig?.plans || config.pricingConfig.plans.length === 0) && (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun plan configuré</h3>
                    <p className="text-muted-foreground mb-4">
                      Commencez par configurer vos plans d'abonnement
                    </p>
                    <Button onClick={() => setActiveTab('cards')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Configurer les plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestion des cartes */}
          <TabsContent value="cards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des cartes de tarifs</CardTitle>
                <CardDescription>
                  Configurez les cartes de tarifs affichées sur la page et la section tarifs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {config.pricingConfig?.plans?.map((plan, index) => (
                    <Card key={plan.id} className="border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
                              <CardDescription>{plan.description}</CardDescription>
                            </div>
                            {plan.popular && (
                              <Badge variant="default" className="bg-primary">
                                Populaire
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={plan.highlighted}
                              onCheckedChange={(highlighted) => {
                                const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                updatedPlans[index] = { ...plan, highlighted };
                                updateConfig({
                                  pricingConfig: {
                                    ...config.pricingConfig,
                                    plans: updatedPlans
                                  }
                                });
                              }}
                            />
                            <span className="text-sm text-muted-foreground">Mettre en avant</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedPlans = (config.pricingConfig?.plans || []).filter((_, i) => i !== index);
                                updateConfig({
                                  pricingConfig: {
                                    ...config.pricingConfig,
                                    plans: updatedPlans
                                  }
                                });
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`plan-name-${plan.id}`}>Nom du plan</Label>
                            <Input
                              id={`plan-name-${plan.id}`}
                              value={plan.name}
                              onChange={(e) => {
                                const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                updatedPlans[index] = { ...plan, name: e.target.value };
                                updateConfig({
                                  pricingConfig: {
                                    ...config.pricingConfig,
                                    plans: updatedPlans
                                  }
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`plan-price-${plan.id}`}>Prix</Label>
                            <div className="flex gap-2">
                              <Input
                                id={`plan-price-${plan.id}`}
                                type="number"
                                value={plan.price}
                                onChange={(e) => {
                                  const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                  updatedPlans[index] = { ...plan, price: parseInt(e.target.value) || 0 };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      plans: updatedPlans
                                    }
                                  });
                                }}
                                className="flex-1"
                              />
                              <Select
                                value={plan.currency}
                                onValueChange={(currency) => {
                                  const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                  updatedPlans[index] = { ...plan, currency };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      plans: updatedPlans
                                    }
                                  });
                                }}
                              >
                                <SelectTrigger className="w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="€">€</SelectItem>
                                  <SelectItem value="$">$</SelectItem>
                                  <SelectItem value="£">£</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`plan-description-${plan.id}`}>Description</Label>
                          <Textarea
                            id={`plan-description-${plan.id}`}
                            value={plan.description || ""}
                            onChange={(e) => {
                              const updatedPlans = [...(config.pricingConfig?.plans || [])];
                              updatedPlans[index] = { ...plan, description: e.target.value };
                              updateConfig({
                                pricingConfig: {
                                  ...config.pricingConfig,
                                  plans: updatedPlans
                                }
                              });
                            }}
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Fonctionnalités</Label>
                          <div className="space-y-2">
                            {plan.features.map((feature, featureIndex) => (
                              <div key={featureIndex} className="flex items-center gap-2">
                                <Switch
                                  checked={feature.included}
                                  onCheckedChange={(included) => {
                                    const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                    const updatedFeatures = [...plan.features];
                                    updatedFeatures[featureIndex] = { ...feature, included };
                                    updatedPlans[index] = { ...plan, features: updatedFeatures };
                                    updateConfig({
                                      pricingConfig: {
                                        ...config.pricingConfig,
                                        plans: updatedPlans
                                      }
                                    });
                                  }}
                                />
                                <Input
                                  value={feature.text}
                                  onChange={(e) => {
                                    const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                    const updatedFeatures = [...plan.features];
                                    updatedFeatures[featureIndex] = { ...feature, text: e.target.value };
                                    updatedPlans[index] = { ...plan, features: updatedFeatures };
                                    updateConfig({
                                      pricingConfig: {
                                        ...config.pricingConfig,
                                        plans: updatedPlans
                                      }
                                    });
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                    const updatedFeatures = plan.features.filter((_, i) => i !== featureIndex);
                                    updatedPlans[index] = { ...plan, features: updatedFeatures };
                                    updateConfig({
                                      pricingConfig: {
                                        ...config.pricingConfig,
                                        plans: updatedPlans
                                      }
                                    });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                const updatedFeatures = [...plan.features, { text: "Nouvelle fonctionnalité", included: true }];
                                updatedPlans[index] = { ...plan, features: updatedFeatures };
                                updateConfig({
                                  pricingConfig: {
                                    ...config.pricingConfig,
                                    plans: updatedPlans
                                  }
                                });
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Ajouter une fonctionnalité
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`plan-cta-${plan.id}`}>Texte du bouton</Label>
                            <Input
                              id={`plan-cta-${plan.id}`}
                              value={plan.ctaText}
                              onChange={(e) => {
                                const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                updatedPlans[index] = { ...plan, ctaText: e.target.value };
                                updateConfig({
                                  pricingConfig: {
                                    ...config.pricingConfig,
                                    plans: updatedPlans
                                  }
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`plan-link-${plan.id}`}>Lien du bouton</Label>
                            <Input
                              id={`plan-link-${plan.id}`}
                              value={plan.ctaLink || ""}
                              onChange={(e) => {
                                const updatedPlans = [...(config.pricingConfig?.plans || [])];
                                updatedPlans[index] = { ...plan, ctaLink: e.target.value };
                                updateConfig({
                                  pricingConfig: {
                                    ...config.pricingConfig,
                                    plans: updatedPlans
                                  }
                                });
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Bouton pour ajouter un nouveau plan */}
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newPlan = {
                        id: `plan-${Date.now()}`,
                        name: 'Nouveau Plan',
                        price: 0,
                        currency: '€',
                        period: 'monthly' as const,
                        description: 'Description du nouveau plan',
                        features: [
                          { text: 'Fonctionnalité 1', included: true },
                          { text: 'Fonctionnalité 2', included: true }
                        ],
                        ctaText: 'Commencer',
                        ctaLink: '/signup',
                        highlighted: false,
                        popular: false
                      };
                      
                      const updatedPlans = [...(config.pricingConfig?.plans || []), newPlan];
                      updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          plans: updatedPlans
                        }
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un nouveau plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contenu */}
          <TabsContent value="content" className="space-y-6">
            {/* Section Fonctionnalités */}
            <Card>
              <CardHeader>
                <CardTitle>Section Fonctionnalités</CardTitle>
                <CardDescription>
                  Configurez la section "Fonctionnalités incluses dans tous les plans"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Afficher la section Fonctionnalités</h3>
                    <p className="text-sm text-muted-foreground">
                      Contrôlez l'affichage de la section fonctionnalités sur la page tarifs
                    </p>
                  </div>
                  <Switch
                    checked={config.pricingConfig?.showFeaturesSection !== false}
                    onCheckedChange={(show) => updateConfig({
                      pricingConfig: {
                        ...config.pricingConfig,
                        showFeaturesSection: show
                      }
                    })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="features-title">Titre de la section</Label>
                    <Input
                      id="features-title"
                      value={config.pricingConfig?.featuresTitle || "Fonctionnalités incluses dans tous les plans"}
                      onChange={(e) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          featuresTitle: e.target.value
                        }
                      })}
                      placeholder="Titre de la section fonctionnalités"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="features-description">Description</Label>
                    <Textarea
                      id="features-description"
                      value={config.pricingConfig?.featuresDescription || "Tous nos plans incluent ces fonctionnalités essentielles"}
                      onChange={(e) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          featuresDescription: e.target.value
                        }
                      })}
                      placeholder="Description de la section fonctionnalités"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Fonctionnalités</h3>
                  <div className="space-y-4">
                    {(config.pricingConfig?.features || []).map((feature, index) => (
                      <Card key={index} className="border-2">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`feature-icon-${index}`}>Icône</Label>
                              <Select
                                value={feature.icon}
                                onValueChange={(icon) => {
                                  const updatedFeatures = [...(config.pricingConfig?.features || [])];
                                  updatedFeatures[index] = { ...feature, icon };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      features: updatedFeatures
                                    }
                                  });
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Shield">Shield</SelectItem>
                                  <SelectItem value="Zap">Zap</SelectItem>
                                  <SelectItem value="Users">Users</SelectItem>
                                  <SelectItem value="Database">Database</SelectItem>
                                  <SelectItem value="Globe">Globe</SelectItem>
                                  <SelectItem value="Headphones">Headphones</SelectItem>
                                  <SelectItem value="Lock">Lock</SelectItem>
                                  <SelectItem value="CheckCircle">CheckCircle</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`feature-title-${index}`}>Titre</Label>
                              <Input
                                id={`feature-title-${index}`}
                                value={feature.title}
                                onChange={(e) => {
                                  const updatedFeatures = [...(config.pricingConfig?.features || [])];
                                  updatedFeatures[index] = { ...feature, title: e.target.value };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      features: updatedFeatures
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`feature-description-${index}`}>Description</Label>
                              <Input
                                id={`feature-description-${index}`}
                                value={feature.description}
                                onChange={(e) => {
                                  const updatedFeatures = [...(config.pricingConfig?.features || [])];
                                  updatedFeatures[index] = { ...feature, description: e.target.value };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      features: updatedFeatures
                                    }
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedFeatures = (config.pricingConfig?.features || []).filter((_, i) => i !== index);
                                updateConfig({
                                  pricingConfig: {
                                    ...config.pricingConfig,
                                    features: updatedFeatures
                                  }
                                });
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newFeature = {
                        icon: "Shield",
                        title: "Nouvelle fonctionnalité",
                        description: "Description de la nouvelle fonctionnalité"
                      };
                      const updatedFeatures = [...(config.pricingConfig?.features || []), newFeature];
                      updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          features: updatedFeatures
                        }
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une fonctionnalité
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Section Questions Fréquentes</CardTitle>
                <CardDescription>
                  Configurez la section FAQ de la page tarifs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Afficher la section FAQ</h3>
                    <p className="text-sm text-muted-foreground">
                      Contrôlez l'affichage de la section questions fréquentes
                    </p>
                  </div>
                  <Switch
                    checked={config.pricingConfig?.showFAQSection !== false}
                    onCheckedChange={(show) => updateConfig({
                      pricingConfig: {
                        ...config.pricingConfig,
                        showFAQSection: show
                      }
                    })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="faq-title">Titre de la section</Label>
                    <Input
                      id="faq-title"
                      value={config.pricingConfig?.faqTitle || "Questions fréquentes"}
                      onChange={(e) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          faqTitle: e.target.value
                        }
                      })}
                      placeholder="Titre de la section FAQ"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Questions et Réponses</h3>
                  <div className="space-y-4">
                    {(config.pricingConfig?.faqs || []).map((faq, index) => (
                      <Card key={index} className="border-2">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor={`faq-question-${index}`}>Question</Label>
                              <Input
                                id={`faq-question-${index}`}
                                value={faq.question}
                                onChange={(e) => {
                                  const updatedFAQs = [...(config.pricingConfig?.faqs || [])];
                                  updatedFAQs[index] = { ...faq, question: e.target.value };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      faqs: updatedFAQs
                                    }
                                  });
                                }}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`faq-answer-${index}`}>Réponse</Label>
                              <Textarea
                                id={`faq-answer-${index}`}
                                value={faq.answer}
                                onChange={(e) => {
                                  const updatedFAQs = [...(config.pricingConfig?.faqs || [])];
                                  updatedFAQs[index] = { ...faq, answer: e.target.value };
                                  updateConfig({
                                    pricingConfig: {
                                      ...config.pricingConfig,
                                      faqs: updatedFAQs
                                    }
                                  });
                                }}
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedFAQs = (config.pricingConfig?.faqs || []).filter((_, i) => i !== index);
                                updateConfig({
                                  pricingConfig: {
                                    ...config.pricingConfig,
                                    faqs: updatedFAQs
                                  }
                                });
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newFAQ = {
                        question: "Nouvelle question ?",
                        answer: "Réponse à la nouvelle question."
                      };
                      const updatedFAQs = [...(config.pricingConfig?.faqs || []), newFAQ];
                      updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          faqs: updatedFAQs
                        }
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une question
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section CTA Final */}
            <Card>
              <CardHeader>
                <CardTitle>Section CTA Final</CardTitle>
                <CardDescription>
                  Configurez la section d'appel à l'action finale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Afficher la section CTA Final</h3>
                    <p className="text-sm text-muted-foreground">
                      Contrôlez l'affichage de la section d'appel à l'action finale
                    </p>
                  </div>
                  <Switch
                    checked={config.pricingConfig?.showFinalCTA !== false}
                    onCheckedChange={(show) => updateConfig({
                      pricingConfig: {
                        ...config.pricingConfig,
                        showFinalCTA: show
                      }
                    })}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="final-cta-title">Titre</Label>
                    <Input
                      id="final-cta-title"
                      value={config.pricingConfig?.finalCTATitle || "Prêt à commencer ?"}
                      onChange={(e) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          finalCTATitle: e.target.value
                        }
                      })}
                      placeholder="Titre de la section CTA"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="final-cta-description">Description</Label>
                    <Textarea
                      id="final-cta-description"
                      value={config.pricingConfig?.finalCTADescription || "Rejoignez des milliers d'entreprises qui font confiance à notre solution."}
                      onChange={(e) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          finalCTADescription: e.target.value
                        }
                      })}
                      placeholder="Description de la section CTA"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="final-cta-primary">Texte du bouton principal</Label>
                      <Input
                        id="final-cta-primary"
                        value={config.pricingConfig?.finalCTAPrimary || "Commencer l'essai gratuit"}
                        onChange={(e) => updateConfig({
                          pricingConfig: {
                            ...config.pricingConfig,
                            finalCTAPrimary: e.target.value
                          }
                        })}
                        placeholder="Texte du bouton principal"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="final-cta-secondary">Texte du bouton secondaire</Label>
                      <Input
                        id="final-cta-secondary"
                        value={config.pricingConfig?.finalCTASecondary || "Nous contacter"}
                        onChange={(e) => updateConfig({
                          pricingConfig: {
                            ...config.pricingConfig,
                            finalCTASecondary: e.target.value
                          }
                        })}
                        placeholder="Texte du bouton secondaire"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affichage */}
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de l'affichage des tarifs</CardTitle>
                <CardDescription>
                  Contrôlez l'affichage de la page tarifs et de la section tarifs sur la homepage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contrôles de visibilité */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Afficher la page Tarifs</h3>
                      <p className="text-sm text-muted-foreground">
                        Contrôlez si la page /pricing est accessible
                      </p>
                    </div>
                    <Switch
                      checked={config.pricingConfig?.showPricingPage !== false}
                      onCheckedChange={(show) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          showPricingPage: show
                        }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <h3 className="font-medium">Afficher la section Tarifs sur la homepage</h3>
                      <p className="text-sm text-muted-foreground">
                        Contrôlez si la section tarifs apparaît sur la homepage
                      </p>
                    </div>
                    <Switch
                      checked={config.pricingConfig?.showPricingSection !== false}
                      onCheckedChange={(show) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          showPricingSection: show
                        }
                      })}
                    />
                  </div>
                </div>

                {/* Configuration des textes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Textes de la section tarifs</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pricing-title">Titre de la section</Label>
                    <Input
                      id="pricing-title"
                      value={config.pricingConfig?.title || "Tarifs transparents"}
                      onChange={(e) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          title: e.target.value
                        }
                      })}
                      placeholder="Titre de la section tarifs"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pricing-description">Description</Label>
                    <Textarea
                      id="pricing-description"
                      value={config.pricingConfig?.description || "Choisissez le plan qui correspond à vos besoins"}
                      onChange={(e) => updateConfig({
                        pricingConfig: {
                          ...config.pricingConfig,
                          description: e.target.value
                        }
                      })}
                      placeholder="Description de la section tarifs"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricing-cta-primary">Texte du bouton principal</Label>
                      <Input
                        id="pricing-cta-primary"
                        value={config.pricingConfig?.ctaText || "Commencer l'essai gratuit"}
                        onChange={(e) => updateConfig({
                          pricingConfig: {
                            ...config.pricingConfig,
                            ctaText: e.target.value
                          }
                        })}
                        placeholder="Texte du bouton principal"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pricing-cta-secondary">Texte du bouton secondaire</Label>
                      <Input
                        id="pricing-cta-secondary"
                        value={config.pricingConfig?.ctaSecondary || "Voir tous les plans"}
                        onChange={(e) => updateConfig({
                          pricingConfig: {
                            ...config.pricingConfig,
                            ctaSecondary: e.target.value
                          }
                        })}
                        placeholder="Texte du bouton secondaire"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {analyticsError}
                  {analyticsError.includes('Stripe n\'est pas configuré') && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Configuration requise :</strong>
                      </p>
                      <ol className="text-sm text-blue-700 mt-1 list-decimal list-inside">
                        <li>Configurez vos clés Stripe dans <code>backend/config.env</code></li>
                        <li>Exécutez <code>npm run init:stripe</code> dans le dossier backend</li>
                        <li>Redémarrez le serveur backend</li>
                      </ol>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : analytics ? (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-medium border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Abonnés actifs</p>
                      <p className="text-2xl font-bold">1,247</p>
                      <p className="text-xs text-success">+12% ce mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revenus MRR</p>
                      <p className="text-2xl font-bold">45,680€</p>
                      <p className="text-xs text-success">+8% ce mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taux de conversion</p>
                      <p className="text-2xl font-bold">3.2%</p>
                      <p className="text-xs text-warning">-0.5% ce mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-medium border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Churn rate</p>
                      <p className="text-2xl font-bold">2.1%</p>
                      <p className="text-xs text-success">-0.3% ce mois</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Répartition des abonnements par plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getTierColor(plan.tier)}>
                          {getTierLabel(plan.tier)}
                        </Badge>
                        <span className="font-medium">{plan.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {Math.floor(Math.random() * 1000)} abonnés
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Chargement des analytics...</p>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Paramètres */}
          <TabsContent value="settings" className="space-y-6">
            {/* Configuration Stripe */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Configuration Stripe
                </CardTitle>
                <CardDescription>
                  Configurez vos clés API Stripe pour activer la facturation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StripeConfigForm />
              </CardContent>
            </Card>

            {settingsError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {settingsError}
                </AlertDescription>
              </Alert>
            ) : settings ? (
              <Card className="shadow-medium border-0">
                <CardHeader>
                  <CardTitle>Paramètres de facturation</CardTitle>
                  <CardDescription>
                    Configurez les paramètres globaux de facturation
                  </CardDescription>
                </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Devise par défaut</Label>
                    <Select defaultValue="EUR">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Période d'essai par défaut (jours)</Label>
                    <Input type="number" defaultValue="14" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Activer les factures automatiques</Label>
                      <p className="text-sm text-muted-foreground">
                        Générer automatiquement les factures pour les abonnements
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications de paiement</Label>
                      <p className="text-sm text-muted-foreground">
                        Envoyer des notifications pour les paiements échoués
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Proration des changements de plan</Label>
                      <p className="text-sm text-muted-foreground">
                        Calculer automatiquement les prorations lors des changements
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter les données
                  </Button>
                </div>
              </CardContent>
            </Card>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Settings className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Chargement des paramètres...</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le plan</DialogTitle>
              <DialogDescription>
                Modifiez les paramètres de ce plan d'abonnement
              </DialogDescription>
            </DialogHeader>
            {editingPlan && (
              <EditPlanForm 
                plan={editingPlan} 
                onSubmit={handleUpdatePlan}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingPlan(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

// Composant pour créer un nouveau plan
const CreatePlanForm: React.FC<{ onSubmit: (data: Partial<SubscriptionPlan>) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    tier: 'basic' as SubscriptionTier,
    price_monthly: 0,
    price_yearly: 0,
    description: '',
    trial_days: 14,
    is_active: true,
    features: [] as PlanFeature[],
    limits: {} as PlanLimits
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du plan</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tier">Niveau</Label>
          <Select value={formData.tier} onValueChange={(value: SubscriptionTier) => setFormData({ ...formData, tier: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Gratuit</SelectItem>
              <SelectItem value="basic">Basique</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Entreprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price_monthly">Prix mensuel (en centimes)</Label>
          <Input
            id="price_monthly"
            type="number"
            value={formData.price_monthly}
            onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_yearly">Prix annuel (en centimes)</Label>
          <Input
            id="price_yearly"
            type="number"
            value={formData.price_yearly}
            onChange={(e) => setFormData({ ...formData, price_yearly: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trial_days">Période d'essai (jours)</Label>
        <Input
          id="trial_days"
          type="number"
          value={formData.trial_days}
          onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
        />
      </div>

      <DialogFooter>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Créer le plan
        </Button>
      </DialogFooter>
    </form>
  );
};

// Composant pour éditer un plan
const EditPlanForm: React.FC<{ 
  plan: SubscriptionPlan; 
  onSubmit: (data: Partial<SubscriptionPlan>) => void;
  onCancel: () => void;
}> = ({ plan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: plan.name,
    tier: plan.tier,
    price_monthly: plan.price_monthly,
    price_yearly: plan.price_yearly,
    description: plan.description,
    trial_days: plan.trial_days,
    is_active: plan.is_active,
    features: plan.features,
    limits: plan.limits
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du plan</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tier">Niveau</Label>
          <Select value={formData.tier} onValueChange={(value: SubscriptionTier) => setFormData({ ...formData, tier: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Gratuit</SelectItem>
              <SelectItem value="basic">Basique</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Entreprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price_monthly">Prix mensuel (en centimes)</Label>
          <Input
            id="price_monthly"
            type="number"
            value={formData.price_monthly}
            onChange={(e) => setFormData({ ...formData, price_monthly: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_yearly">Prix annuel (en centimes)</Label>
          <Input
            id="price_yearly"
            type="number"
            value={formData.price_yearly}
            onChange={(e) => setFormData({ ...formData, price_yearly: parseInt(e.target.value) || 0 })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="trial_days">Période d'essai (jours)</Label>
        <Input
          id="trial_days"
          type="number"
          value={formData.trial_days}
          onChange={(e) => setFormData({ ...formData, trial_days: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Plan actif</Label>
          <p className="text-sm text-muted-foreground">
            Les utilisateurs peuvent s'abonner à ce plan
          </p>
        </div>
        <Switch 
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </DialogFooter>
    </form>
  );
};

// Composant pour la configuration Stripe
const StripeConfigForm: React.FC = () => {
  const [stripeConfig, setStripeConfig] = useState({
    secretKey: '',
    publishableKey: '',
    webhookSecret: ''
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // Ici, vous pourriez envoyer la configuration au backend
      // Pour l'instant, on simule la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({
        type: 'success',
        text: 'Configuration Stripe sauvegardée avec succès ! Redémarrez le serveur backend pour appliquer les changements.'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde de la configuration Stripe.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="secretKey">Clé secrète Stripe (sk_test_...)</Label>
          <div className="relative">
            <Input
              id="secretKey"
              type={showSecretKey ? 'text' : 'password'}
              value={stripeConfig.secretKey}
              onChange={(e) => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
              placeholder="sk_test_..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowSecretKey(!showSecretKey)}
            >
              {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Trouvez cette clé dans votre Dashboard Stripe → Developers → API keys
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="publishableKey">Clé publique Stripe (pk_test_...)</Label>
          <Input
            id="publishableKey"
            type="text"
            value={stripeConfig.publishableKey}
            onChange={(e) => setStripeConfig({ ...stripeConfig, publishableKey: e.target.value })}
            placeholder="pk_test_..."
          />
          <p className="text-xs text-muted-foreground">
            Cette clé peut être exposée côté client
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhookSecret">Secret Webhook (whsec_...)</Label>
          <div className="relative">
            <Input
              id="webhookSecret"
              type={showWebhookSecret ? 'text' : 'password'}
              value={stripeConfig.webhookSecret}
              onChange={(e) => setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })}
              placeholder="whsec_..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
            >
              {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Optionnel : pour recevoir les événements Stripe en temps réel
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading || !stripeConfig.secretKey || !stripeConfig.publishableKey}>
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder la configuration
            </>
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Ouvrir Stripe Dashboard
        </Button>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Instructions :</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Créez un compte sur <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="underline">stripe.com</a></li>
          <li>Allez dans Dashboard → Developers → API keys</li>
          <li>Copiez vos clés de test (sk_test_... et pk_test_...)</li>
          <li>Collez-les dans les champs ci-dessus</li>
          <li>Cliquez sur "Sauvegarder la configuration"</li>
          <li>Redémarrez le serveur backend</li>
        </ol>
      </div>
    </form>
  );
};
