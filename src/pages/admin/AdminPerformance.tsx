import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Settings, 
  BarChart3, 
  Cpu, 
  HardDrive, 
  Activity,
  TrendingUp,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  Clock,
  Server,
  Loader2,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { adminPerformanceService, type PerformanceMetrics, type PerformanceAlert } from '@/services/adminPerformanceService';

export const AdminPerformance: React.FC = () => {
  // États
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Charger les métriques
  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metricsData, alertsData] = await Promise.all([
        adminPerformanceService.getMetrics(),
        adminPerformanceService.getAlerts()
      ]);
      
      setMetrics(metricsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Erreur lors du chargement des métriques:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    loadMetrics();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Résoudre une alerte
  const handleResolveAlert = async (alertId: string) => {
    try {
      await adminPerformanceService.resolveAlert(alertId);
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));
    } catch (err) {
      console.error('Erreur lors de la résolution de l\'alerte:', err);
    }
  };

  // Obtenir la couleur du statut
  const getStatusColor = (value: number, thresholds: { warning: number; error: number }): string => {
    if (value >= thresholds.error) {
      return 'text-red-500';
    } else if (value >= thresholds.warning) {
      return 'text-yellow-500';
    } else {
      return 'text-green-500';
    }
  };

  // Obtenir la couleur de l'alerte
  const getAlertColor = (type: string): string => {
    switch (type) {
      case 'error':
        return 'text-red-500 bg-red-50 dark:bg-red-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
      case 'info':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
    }
  };

  // Obtenir l'icône de l'alerte
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (loading && !metrics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Chargement des métriques de performance...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !metrics) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error || 'Erreur inconnue'}</p>
          <Button onClick={loadMetrics} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const overallStatus = adminPerformanceService.getOverallStatus(metrics);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Performance</h1>
              <p className="text-muted-foreground">
                Surveillez les performances de votre application en temps réel
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                className={
                  overallStatus === 'healthy' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                  overallStatus === 'warning' ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' :
                  'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                }
              >
                {overallStatus === 'healthy' ? '✓ Système sain' :
                 overallStatus === 'warning' ? '⚠ Attention' : '✗ Problème détecté'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMetrics}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </div>
          </div>
        </div>

        {/* Alertes */}
        {alerts.filter(alert => !alert.resolved).length > 0 && (
          <div className="mb-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold mb-2">Alertes actives :</div>
                <div className="space-y-2">
                  {alerts.filter(alert => !alert.resolved).map((alert) => (
                    <div key={alert.id} className={`p-2 rounded ${getAlertColor(alert.type)}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.type)}
                          <span className="text-sm">{alert.message}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temps de Chargement</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.pageLoadTime, { warning: 500, error: 1000 })}`}>
                    {adminPerformanceService.formatTime(metrics.pageLoadTime)}
                  </p>
                  <Badge className={getStatusColor(metrics.pageLoadTime, { warning: 500, error: 1000 }) === 'text-green-500' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' : getStatusColor(metrics.pageLoadTime, { warning: 500, error: 1000 }) === 'text-yellow-500' ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'}>
                    {metrics.pageLoadTime < 500 ? 'Excellent' : metrics.pageLoadTime < 1000 ? 'Bon' : 'Lent'}
                  </Badge>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">API Response</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.apiResponseTime, { warning: 100, error: 200 })}`}>
                    {adminPerformanceService.formatTime(metrics.apiResponseTime)}
                  </p>
                  <Badge className={getStatusColor(metrics.apiResponseTime, { warning: 100, error: 200 }) === 'text-green-500' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' : getStatusColor(metrics.apiResponseTime, { warning: 100, error: 200 }) === 'text-yellow-500' ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'}>
                    {metrics.apiResponseTime < 100 ? 'Rapide' : metrics.apiResponseTime < 200 ? 'Moyen' : 'Lent'}
                  </Badge>
                </div>
                <Server className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mémoire</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.memoryUsage, { warning: 70, error: 85 })}`}>
                    {adminPerformanceService.formatPercentage(metrics.memoryUsage)}
                  </p>
                  <Progress value={metrics.memoryUsage} className="w-full h-2 mt-1" />
                </div>
                <HardDrive className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">CPU</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.cpuUsage, { warning: 70, error: 85 })}`}>
                    {adminPerformanceService.formatPercentage(metrics.cpuUsage)}
                  </p>
                  <Progress value={metrics.cpuUsage} className="w-full h-2 mt-1" />
                </div>
                <Cpu className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="system">Système</TabsTrigger>
            <TabsTrigger value="network">Réseau</TabsTrigger>
            <TabsTrigger value="alerts">Alertes</TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
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
                    <span className="text-sm">Temps de requête DB</span>
                    <span className="font-medium">{adminPerformanceService.formatTime(metrics.databaseQueryTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connexions actives</span>
                    <span className="font-medium">{metrics.activeConnections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Requêtes/seconde</span>
                    <span className="font-medium">{adminPerformanceService.formatRequestsPerSecond(metrics.requestsPerSecond)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taux d'erreur</span>
                    <Badge className={getStatusColor(metrics.errorRate, { warning: 2, error: 5 }) === 'text-green-500' ? 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' : getStatusColor(metrics.errorRate, { warning: 2, error: 5 }) === 'text-yellow-500' ? 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' : 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400'}>
                      {adminPerformanceService.formatPercentage(metrics.errorRate)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <Badge className="bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                      {adminPerformanceService.formatUptime(metrics.uptime)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Historique des Performances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Graphiques d'historique disponibles avec des données réelles
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dernière mise à jour : {new Date(metrics.lastUpdated).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Système */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cpu className="h-5 w-5" />
                    Utilisation des Ressources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">CPU</span>
                      <span className="text-sm font-medium">{adminPerformanceService.formatPercentage(metrics.cpuUsage)}</span>
                    </div>
                    <Progress value={metrics.cpuUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Mémoire</span>
                      <span className="text-sm font-medium">{adminPerformanceService.formatPercentage(metrics.memoryUsage)}</span>
                    </div>
                    <Progress value={metrics.memoryUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Disque</span>
                      <span className="text-sm font-medium">{adminPerformanceService.formatPercentage(metrics.diskUsage)}</span>
                    </div>
                    <Progress value={metrics.diskUsage} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activité Système
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uptime</span>
                    <span className="font-medium">{adminPerformanceService.formatUptime(metrics.uptime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connexions actives</span>
                    <span className="font-medium">{metrics.activeConnections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Requêtes totales</span>
                    <span className="font-medium">{metrics.totalRequests.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Trafic réseau</span>
                    <span className="font-medium">{metrics.networkTraffic} MB/s</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Réseau */}
          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Trafic Réseau
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Débit actuel</span>
                    <span className="font-medium">{metrics.networkTraffic} MB/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Connexions actives</span>
                    <span className="font-medium">{metrics.activeConnections}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Requêtes/seconde</span>
                    <span className="font-medium">{adminPerformanceService.formatRequestsPerSecond(metrics.requestsPerSecond)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Latence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Response</span>
                    <span className="font-medium">{adminPerformanceService.formatTime(metrics.apiResponseTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DB Query</span>
                    <span className="font-medium">{adminPerformanceService.formatTime(metrics.databaseQueryTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Page Load</span>
                    <span className="font-medium">{adminPerformanceService.formatTime(metrics.pageLoadTime)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alertes */}
          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertes de Performance
                </CardTitle>
                <CardDescription>
                  Surveillez les alertes et résolvez les problèmes de performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Aucune alerte active
                      </p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div key={alert.id} className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getAlertIcon(alert.type)}
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {alert.resolved ? (
                              <Badge className="bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                                Résolu
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolveAlert(alert.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Résoudre
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};