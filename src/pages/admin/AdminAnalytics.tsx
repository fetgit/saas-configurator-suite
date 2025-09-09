import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Clock, 
  Server, 
  Shield, 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet,
  Download,
  RefreshCw,
  Loader2,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { adminAnalyticsService, type AnalyticsData } from '@/services/adminAnalyticsService';

export const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // États
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // Charger les données analytiques
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminAnalyticsService.getAnalytics(selectedPeriod);
      setAnalytics(data);
    } catch (err) {
      console.error('Erreur lors du chargement des analytics:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast({
        title: "Erreur",
        description: "Impossible de charger les données analytiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage et lors du changement de période
  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  // Exporter les données
  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const blob = await adminAnalyticsService.exportAnalytics(selectedPeriod, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${selectedPeriod}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Succès",
        description: `Données exportées en ${format.toUpperCase()}`,
      });
    } catch (err) {
      console.error('Erreur lors de l\'export:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter les données",
        variant: "destructive",
      });
    }
  };

  // Formater les nombres
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toString();
    }
  };

  // Obtenir la couleur du badge
  const getBadgeColor = (value: number, thresholds: { good: number; warning: number }): string => {
    if (value >= thresholds.good) {
      return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400';
    } else if (value >= thresholds.warning) {
      return 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400';
    } else {
      return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400';
    }
  };

  if (loading && !analytics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des analytics...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error || 'Erreur inconnue'}</p>
          <Button onClick={loadAnalytics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Analytics</h1>
              <p className="text-muted-foreground">
                Analysez les performances et l'utilisation de votre application
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPeriod} onValueChange={(value: '7d' | '30d' | '90d') => setSelectedPeriod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={loadAnalytics}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('json')}
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs Totaux</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.overview.totalUsers)}</p>
                  <p className="text-xs text-green-500">+{analytics.overview.userGrowth}%</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs Actifs</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.overview.activeUsers)}</p>
                  <p className="text-xs text-muted-foreground">Cette période</p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pages Vues</p>
                  <p className="text-2xl font-bold">{formatNumber(analytics.performance.pageViews)}</p>
                  <Badge className={getBadgeColor(analytics.performance.bounceRate, { good: 30, warning: 50 })}>
                    {analytics.performance.bounceRate}% rebond
                  </Badge>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temps de Réponse</p>
                  <p className="text-2xl font-bold">{analytics.performance.responseTime}ms</p>
                  <Badge className={getBadgeColor(analytics.performance.responseTime, { good: 100, warning: 200 })}>
                    {analytics.performance.serverUptime}% uptime
                  </Badge>
                </div>
                <Server className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="traffic">Trafic</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Utilisateurs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Nouveaux utilisateurs</span>
                    <span className="font-medium">{formatNumber(analytics.overview.newUsers)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Croissance</span>
                    <Badge className="bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                      +{analytics.overview.userGrowth}%
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Répartition par rôle</span>
                    </div>
                    {analytics.charts.roleDistribution.map((role, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{role.role}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(role.count / analytics.overview.totalUsers) * 100} 
                            className="w-20 h-2" 
                          />
                          <span className="text-sm font-medium">{role.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Entreprises */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Entreprises
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.charts.companyDistribution.slice(0, 5).map((company, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{company.company}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(company.count / Math.max(...analytics.charts.companyDistribution.map(c => c.count))) * 100} 
                            className="w-20 h-2" 
                          />
                          <span className="text-sm font-medium">{company.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Métriques de Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Durée de session</span>
                    <span className="font-medium">{analytics.performance.sessionDuration}s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux de conversion</span>
                    <Badge className={getBadgeColor(analytics.performance.conversionRate, { good: 3, warning: 1 })}>
                      {analytics.performance.conversionRate}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Temps de réponse</span>
                    <Badge className={getBadgeColor(analytics.performance.responseTime, { good: 100, warning: 200 })}>
                      {analytics.performance.responseTime}ms
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime serveur</span>
                    <Badge className="bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                      {analytics.performance.serverUptime}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Graphiques de tendances disponibles avec des données réelles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trafic */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sources de trafic */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Sources de Trafic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.traffic.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{source.name}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={source.percentage} className="w-16 h-2" />
                          <span className="text-sm font-medium">{source.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Appareils */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Appareils
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.traffic.devices.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {device.name === 'Desktop' && <Monitor className="h-4 w-4" />}
                          {device.name === 'Mobile' && <Smartphone className="h-4 w-4" />}
                          {device.name === 'Tablet' && <Tablet className="h-4 w-4" />}
                          <span className="text-sm">{device.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={device.percentage} className="w-16 h-2" />
                          <span className="text-sm font-medium">{device.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Localisation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Localisation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.traffic.locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{location.country}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={location.percentage} className="w-16 h-2" />
                          <span className="text-sm font-medium">{location.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Métriques de Sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Score de sécurité</span>
                    <Badge className={getBadgeColor(analytics.security.securityScore, { good: 90, warning: 70 })}>
                      {analytics.security.securityScore}/100
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Menaces détectées</span>
                    <span className="font-medium text-red-500">{analytics.security.threats}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">IPs bloquées</span>
                    <span className="font-medium text-orange-500">{analytics.security.blockedIps}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connexions échouées</span>
                    <span className="font-medium text-yellow-500">{analytics.security.failedLogins}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Logs d'activité disponibles avec des données réelles
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};