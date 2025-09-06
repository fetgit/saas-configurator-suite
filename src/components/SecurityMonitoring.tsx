import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BruteForceProtectionService, SecurityStats, SecurityAlert, BruteForceRule } from '@/services/bruteForceProtectionService';
import { Shield, AlertTriangle, Eye, EyeOff, RefreshCw, Lock, Unlock, Clock, Users, Activity, AlertCircle } from 'lucide-react';

interface SecurityMonitoringProps {
  refreshInterval?: number;
  showDetails?: boolean;
}

export const SecurityMonitoring: React.FC<SecurityMonitoringProps> = ({
  refreshInterval = 30000, // 30 secondes
  showDetails = true
}) => {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [rules, setRules] = useState<BruteForceRule[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);

  // Charger les données
  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [statsData, alertsData, rulesData] = await Promise.all([
        Promise.resolve(BruteForceProtectionService.getSecurityStats()),
        Promise.resolve(BruteForceProtectionService.getSecurityAlerts(50)),
        Promise.resolve(BruteForceProtectionService.getProtectionRules())
      ]);
      
      setStats(statsData);
      setAlerts(alertsData);
      setRules(rulesData);
    } catch (error) {
      console.error('Erreur lors du chargement des données de sécurité:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Charger les données au montage et périodiquement
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Résoudre une alerte
  const resolveAlert = async (alertId: string) => {
    try {
      const success = BruteForceProtectionService.resolveAlert(alertId);
      if (success) {
        await loadData();
      }
    } catch (error) {
      console.error('Erreur lors de la résolution de l\'alerte:', error);
    }
  };

  // Obtenir la couleur du badge selon la sévérité
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  // Obtenir l'icône selon la sévérité
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <AlertTriangle className="h-4 w-4" />;
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Obtenir la couleur du badge selon le type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'brute_force': return 'destructive';
      case 'suspicious_activity': return 'secondary';
      case 'multiple_failures': return 'secondary';
      case 'ip_blocked': return 'destructive';
      case 'email_blocked': return 'destructive';
      default: return 'outline';
    }
  };

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Chargement des données de sécurité...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitoring de Sécurité</h2>
          <p className="text-muted-foreground">
            Surveillance des tentatives de connexion et des menaces
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tentatives Total</p>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Échecs</p>
                <p className="text-2xl font-bold text-red-500">{stats.failedAttempts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">IPs Bloquées</p>
                <p className="text-2xl font-bold text-orange-500">{stats.blockedIPs}</p>
              </div>
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails Bloqués</p>
                <p className="text-2xl font-bold text-purple-500">{stats.blockedEmails}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques 24h */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activité des 24 dernières heures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.last24Hours.attempts}</div>
              <div className="text-sm text-muted-foreground">Tentatives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.last24Hours.failures}</div>
              <div className="text-sm text-muted-foreground">Échecs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.last24Hours.blocks}</div>
              <div className="text-sm text-muted-foreground">Blocages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets pour les détails */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="rules">Règles</TabsTrigger>
          <TabsTrigger value="details">Détails</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertes de Sécurité</CardTitle>
              <CardDescription>
                Dernières alertes de sécurité détectées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune alerte de sécurité
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 border rounded-lg ${
                        alert.resolved ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getSeverityIcon(alert.severity)}
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                            <Badge variant={getTypeColor(alert.type)}>
                              {alert.type}
                            </Badge>
                            {alert.resolved && (
                              <Badge variant="outline">Résolu</Badge>
                            )}
                          </div>
                          <p className="font-medium">{alert.message}</p>
                          <p className="text-sm text-muted-foreground">
                            {alert.timestamp.toLocaleString()}
                          </p>
                          {alert.ip && (
                            <p className="text-sm text-muted-foreground">
                              IP: {alert.ip}
                            </p>
                          )}
                          {alert.email && (
                            <p className="text-sm text-muted-foreground">
                              Email: {alert.email}
                            </p>
                          )}
                        </div>
                        {!alert.resolved && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Résoudre
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Règles de Protection</CardTitle>
              <CardDescription>
                Configuration des règles de protection contre les attaques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rules.map((rule) => (
                  <div key={rule.name} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{rule.name}</h3>
                          <Badge variant={rule.enabled ? 'default' : 'outline'}>
                            {rule.enabled ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rule.description}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Max tentatives:</span>
                            <br />
                            {rule.maxAttempts}
                          </div>
                          <div>
                            <span className="font-medium">Fenêtre:</span>
                            <br />
                            {rule.windowMs / 1000 / 60} min
                          </div>
                          <div>
                            <span className="font-medium">Blocage:</span>
                            <br />
                            {rule.blockDurationMs / 1000 / 60} min
                          </div>
                          <div>
                            <span className="font-medium">Pénalité:</span>
                            <br />
                            {rule.penaltyMs} ms
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Détails de Sécurité</CardTitle>
              <CardDescription>
                Informations détaillées sur la sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Statistiques Globales</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Tentatives totales:</span>
                        <span className="font-medium">{stats.totalAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Succès:</span>
                        <span className="font-medium text-green-500">{stats.successfulAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Échecs:</span>
                        <span className="font-medium text-red-500">{stats.failedAttempts}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Blocages:</span>
                        <span className="font-medium text-orange-500">{stats.blockedAttempts}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Blocages Actifs</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>IPs bloquées:</span>
                        <span className="font-medium text-orange-500">{stats.blockedIPs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emails bloqués:</span>
                        <span className="font-medium text-purple-500">{stats.blockedEmails}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activité suspecte:</span>
                        <span className="font-medium text-yellow-500">{stats.suspiciousActivity}</span>
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
