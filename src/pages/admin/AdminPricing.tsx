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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Plans d'abonnement */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className="shadow-medium border-0">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {plan.name}
                            <Badge className={getTierColor(plan.tier)}>
                              {getTierLabel(plan.tier)}
                            </Badge>
                            {!plan.is_active && (
                              <Badge variant="secondary">Inactif</Badge>
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
                            {formatPrice(plan.price_monthly)}€
                          </div>
                          <div className="text-sm text-muted-foreground">
                            / mois
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingPlan(plan);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePlanStatus(plan.id, !plan.is_active)}
                          >
                            {plan.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Prix */}
                      <div>
                        <h4 className="font-semibold mb-3">Tarification</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Mensuel:</span>
                            <span className="font-medium">{formatPrice(plan.price_monthly)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Annuel:</span>
                            <span className="font-medium">{formatPrice(plan.price_yearly)}€</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Période d'essai:</span>
                            <span className="font-medium">{plan.trial_days} jours</span>
                          </div>
                        </div>
                      </div>

                      {/* Fonctionnalités */}
                      <div>
                        <h4 className="font-semibold mb-3">Fonctionnalités</h4>
                        <div className="space-y-1">
                          {plan.features.slice(0, 5).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <span>{feature.name}</span>
                            </div>
                          ))}
                          {plan.features.length > 5 && (
                            <div className="text-sm text-muted-foreground">
                              +{plan.features.length - 5} autres fonctionnalités
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Limites */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Limites</h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {plan.limits.users || 'Illimité'} utilisateurs
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {plan.limits.storage || 'Illimité'} GB stockage
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {plan.limits.api_calls || 'Illimité'} appels API
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {plans.length === 0 && (
                <Card className="shadow-medium border-0">
                  <CardContent className="p-12 text-center">
                    <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun plan configuré</h3>
                    <p className="text-muted-foreground mb-4">
                      Commencez par créer votre premier plan d'abonnement
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer un plan
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
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
            {settingsError ? (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {settingsError}
                  {settingsError.includes('Stripe n\'est pas configuré') && (
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
