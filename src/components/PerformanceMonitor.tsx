import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePerformance } from '@/hooks/usePerformance';
import { PerformanceService } from '@/services/performanceService';
import { 
  Activity, 
  Zap, 
  HardDrive, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Settings,
  BarChart3,
  Cpu
} from 'lucide-react';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const { metrics, analysis, clearCache, updateMetrics } = usePerformance({
    measureRender: true,
    measureMemory: true,
    measureApi: true,
    autoCleanup: true,
    reportInterval: refreshInterval
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [optimizationConfig, setOptimizationConfig] = useState(PerformanceService.getOptimizationConfig());
  const [cacheConfig, setCacheConfig] = useState(PerformanceService.getCacheConfig());

  // Actualiser les métriques
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateMetrics();
    setIsRefreshing(false);
  };

  // Obtenir la couleur du score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  // Obtenir l'icône du score
  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 70) return <TrendingUp className="h-5 w-5 text-yellow-500" />;
    if (score >= 50) return <TrendingDown className="h-5 w-5 text-orange-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  // Obtenir la couleur du badge
  const getBadgeColor = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    if (score >= 50) return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec score de performance */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoring des Performances</h2>
          <p className="text-muted-foreground">
            Surveillance et optimisation des performances de l'application
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
              {analysis.score}
            </div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Score de performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getScoreIcon(analysis.score)}
            Score de Performance
          </CardTitle>
          <CardDescription>
            Évaluation globale des performances de l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}>
                {analysis.score}/100
              </div>
              <div>
                <Badge variant={getBadgeColor(analysis.score)} className="text-lg px-3 py-1">
                  {analysis.score >= 90 ? 'Excellent' : 
                   analysis.score >= 70 ? 'Bon' : 
                   analysis.score >= 50 ? 'Moyen' : 'Faible'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {analysis.issues.length} problème(s), {analysis.recommendations.length} recommandation(s)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps de Chargement</p>
                <p className="text-2xl font-bold">{metrics.loadTime.toFixed(0)}ms</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps de Rendu</p>
                <p className="text-2xl font-bold">{metrics.renderTime.toFixed(0)}ms</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mémoire</p>
                <p className="text-2xl font-bold">{metrics.memoryUsage.toFixed(1)}MB</p>
              </div>
              <HardDrive className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cache Hit Rate</p>
                <p className="text-2xl font-bold">{metrics.cacheHitRate.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les détails */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">Métriques</TabsTrigger>
          <TabsTrigger value="analysis">Analyse</TabsTrigger>
          <TabsTrigger value="optimization">Optimisation</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Métriques Détaillées
              </CardTitle>
              <CardDescription>
                Détails des métriques de performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Performance Générale</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Temps de chargement:</span>
                      <span className="font-medium">{metrics.loadTime.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temps de rendu:</span>
                      <span className="font-medium">{metrics.renderTime.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temps de réponse API:</span>
                      <span className="font-medium">{metrics.apiResponseTime.toFixed(2)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temps d'interaction:</span>
                      <span className="font-medium">{metrics.userInteractionTime.toFixed(2)}ms</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold">Ressources</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Utilisation mémoire:</span>
                      <span className="font-medium">{metrics.memoryUsage.toFixed(2)}MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taille du bundle:</span>
                      <span className="font-medium">{metrics.bundleSize.toFixed(2)}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de cache:</span>
                      <span className="font-medium">{metrics.cacheHitRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                Analyse de Performance
              </CardTitle>
              <CardDescription>
                Analyse des performances et recommandations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Problèmes identifiés */}
                {analysis.issues.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-red-600">Problèmes Identifiés</h3>
                    <div className="space-y-2">
                      {analysis.issues.map((issue, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{issue}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommandations */}
                {analysis.recommendations.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-blue-600">Recommandations</h3>
                    <div className="space-y-2">
                      {analysis.recommendations.map((recommendation, index) => (
                        <Alert key={index}>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>{recommendation}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aucun problème */}
                {analysis.issues.length === 0 && analysis.recommendations.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-600">Excellent !</h3>
                    <p className="text-muted-foreground">Aucun problème de performance détecté.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration d'Optimisation
              </CardTitle>
              <CardDescription>
                Paramètres d'optimisation des performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3">Optimisations Actives</h3>
                    <div className="space-y-2">
                      {Object.entries(optimizationConfig).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <Badge variant={value ? 'default' : 'outline'}>
                            {value ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Actions</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => PerformanceService.clearCache()}
                      >
                        Vider le Cache
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => PerformanceService.resetMetrics()}
                      >
                        Réinitialiser les Métriques
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Gestion du Cache
              </CardTitle>
              <CardDescription>
                Configuration et gestion du cache
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3">Configuration du Cache</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taille maximale:</span>
                        <span className="font-medium">{cacheConfig.maxSize} entrées</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durée de vie:</span>
                        <span className="font-medium">{cacheConfig.ttl / 1000}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stratégie:</span>
                        <span className="font-medium uppercase">{cacheConfig.strategy}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Persistance:</span>
                        <Badge variant={cacheConfig.persist ? 'default' : 'outline'}>
                          {cacheConfig.persist ? 'Activée' : 'Désactivée'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Statistiques</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taux de réussite:</span>
                        <span className="font-medium">{metrics.cacheHitRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entrées en cache:</span>
                        <span className="font-medium">N/A</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
