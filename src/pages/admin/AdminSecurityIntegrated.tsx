import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AnimatedCard, AnimatedIconCard, AnimatedStatCard } from '@/components/AnimatedCard';
import { ModernButton } from '@/components/ModernButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Lock, 
  Eye, 
  Key, 
  AlertTriangle, 
  CheckCircle, 
  Settings,
  BarChart3,
  Users,
  Database,
  Globe,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export const AdminSecurityIntegrated: React.FC = () => {
  const { user, isAuthenticated, isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [securityStatus, setSecurityStatus] = useState({
    twoFactor: true,
    xssProtection: true,
    csrfProtection: true,
    securityHeaders: true,
    inputValidation: true,
    bruteForceProtection: true,
    encryption: true,
    rateLimiting: true
  });

  // Vérification des permissions - Seuls les super admins peuvent accéder
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const [securityMetrics, setSecurityMetrics] = useState({
    totalUsers: 1250,
    activeSessions: 89,
    blockedAttempts: 12,
    securityScore: 95,
    lastScan: new Date().toISOString(),
    vulnerabilities: 0,
    threatsBlocked: 156,
    uptime: '99.9%'
  });

  const securityFeatures = [
    {
      id: '2fa',
      title: 'Authentification à deux facteurs',
      description: 'Protection renforcée des comptes utilisateurs',
      status: securityStatus.twoFactor,
      icon: <Key className="w-6 h-6" />,
      color: 'primary'
    },
    {
      id: 'xss',
      title: 'Protection XSS',
      description: 'Sanitisation des entrées utilisateur',
      status: securityStatus.xssProtection,
      icon: <Eye className="w-6 h-6" />,
      color: 'success'
    },
    {
      id: 'csrf',
      title: 'Protection CSRF',
      description: 'Protection contre les attaques cross-site',
      status: securityStatus.csrfProtection,
      icon: <Globe className="w-6 h-6" />,
      color: 'warning'
    },
    {
      id: 'headers',
      title: 'Headers de sécurité',
      description: 'Configuration des en-têtes HTTP sécurisés',
      status: securityStatus.securityHeaders,
      icon: <Shield className="w-6 h-6" />,
      color: 'primary'
    },
    {
      id: 'validation',
      title: 'Validation des entrées',
      description: 'Validation et sanitisation des données',
      status: securityStatus.inputValidation,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'success'
    },
    {
      id: 'bruteforce',
      title: 'Protection force brute',
      description: 'Limitation des tentatives de connexion',
      status: securityStatus.bruteForceProtection,
      icon: <Lock className="w-6 h-6" />,
      color: 'error'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'success',
      message: 'Connexion sécurisée depuis 192.168.1.100',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      user: 'admin@heleam.com'
    },
    {
      id: 2,
      type: 'warning',
      message: 'Tentative de connexion suspecte bloquée',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      user: 'unknown@example.com'
    },
    {
      id: 3,
      type: 'info',
      message: 'Scan de sécurité automatique terminé',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      user: 'system'
    },
    {
      id: 4,
      type: 'success',
      message: 'Mise à jour des règles de sécurité',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      user: 'admin@heleam.com'
    }
  ];

  const toggleSecurityFeature = (featureId: string) => {
    setSecurityStatus(prev => ({
      ...prev,
      [featureId]: !prev[featureId as keyof typeof prev]
    }));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/10 dark:border-green-400/30 dark:bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/10 dark:border-yellow-400/30 dark:bg-yellow-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/10 dark:border-red-400/30 dark:bg-red-500/5';
      default:
        return 'border-blue-500/20 bg-blue-500/10 dark:border-blue-400/30 dark:bg-blue-500/5';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sécurité Intégrée</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble complète de la sécurité de l'application
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModernButton
              variant="outline"
              icon={<Settings className="w-4 h-4" />}
            >
              Configuration
            </ModernButton>
            <ModernButton
              variant="primary"
              icon={<Shield className="w-4 h-4" />}
            >
              Scan de sécurité
            </ModernButton>
          </div>
        </div>

        {/* Métriques de sécurité */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedStatCard
            value={securityMetrics.securityScore}
            label="Score de sécurité"
            change={{ value: 5, type: 'increase' }}
            icon={<Shield className="w-6 h-6" />}
            color="primary"
            direction="up"
          />
          <AnimatedStatCard
            value={securityMetrics.blockedAttempts}
            label="Tentatives bloquées"
            change={{ value: 2, type: 'decrease' }}
            icon={<Lock className="w-6 h-6" />}
            color="error"
            direction="up"
          />
          <AnimatedStatCard
            value={securityMetrics.threatsBlocked}
            label="Menaces bloquées"
            change={{ value: 8, type: 'increase' }}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="warning"
            direction="up"
          />
          <AnimatedStatCard
            value={securityMetrics.uptime}
            label="Disponibilité"
            change={{ value: 0.1, type: 'increase' }}
            icon={<Activity className="w-6 h-6" />}
            color="success"
            direction="up"
          />
        </div>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="features">Fonctionnalités</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* État de sécurité */}
              <AnimatedCard className="p-6" direction="up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    État de sécurité global
                  </CardTitle>
                  <CardDescription>
                    Vue d'ensemble de la sécurité de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sécurité globale</span>
                      <Badge variant="default" className="bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                        Excellent
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Utilisateurs actifs:</span>
                        <span className="ml-2 font-medium">{securityMetrics.activeSessions}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Dernier scan:</span>
                        <span className="ml-2 font-medium">
                          {new Date(securityMetrics.lastScan).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              {/* Activité récente */}
              <AnimatedCard className="p-6" direction="up" delay={0.1}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Activité récente
                  </CardTitle>
                  <CardDescription>
                    Dernières activités de sécurité
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {activity.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {activity.user}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityFeatures.map((feature, index) => (
                <AnimatedIconCard
                  key={feature.id}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  className="p-4"
                  direction="up"
                  delay={index * 0.1}
                  onClick={() => toggleSecurityFeature(feature.id)}
                >
                  <div className="flex items-center justify-between mt-4">
                    <Badge 
                      variant={feature.status ? "default" : "outline"}
                      className={feature.status ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400" : "bg-muted text-muted-foreground"}
                    >
                      {feature.status ? 'Actif' : 'Inactif'}
                    </Badge>
                    <ModernButton
                      size="sm"
                      variant={feature.status ? "outline" : "primary"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSecurityFeature(feature.id);
                      }}
                    >
                      {feature.status ? 'Désactiver' : 'Activer'}
                    </ModernButton>
                  </div>
                </AnimatedIconCard>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatedCard className="p-6" direction="up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistiques de sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tentatives de connexion</span>
                      <span className="font-medium text-foreground">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Connexions réussies</span>
                      <span className="font-medium text-green-500 dark:text-green-400">1,235</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tentatives échouées</span>
                      <span className="font-medium text-red-500 dark:text-red-400">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Taux de réussite</span>
                      <span className="font-medium text-green-500 dark:text-green-400">99.0%</span>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>

              <AnimatedCard className="p-6" direction="up" delay={0.1}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Menaces détectées (24h)</span>
                      <span className="font-medium text-yellow-500 dark:text-yellow-400">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Menaces bloquées (24h)</span>
                      <span className="font-medium text-green-500 dark:text-green-400">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Temps de réponse moyen</span>
                      <span className="font-medium text-foreground">45ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Uptime (30 jours)</span>
                      <span className="font-medium text-green-500 dark:text-green-400">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <AnimatedCard className="p-6" direction="up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration de sécurité
                </CardTitle>
                <CardDescription>
                  Paramètres avancés de sécurité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Timeout de session (minutes)
                      </label>
                      <input
                        type="number"
                        defaultValue="30"
                        className="input-modern w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Limite de tentatives de connexion
                      </label>
                      <input
                        type="number"
                        defaultValue="5"
                        className="input-modern w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Notifications de sécurité</h3>
                      <p className="text-sm text-muted-foreground">Recevoir des alertes par email</p>
                    </div>
                    <ModernButton variant="outline" size="sm">
                      Configurer
                    </ModernButton>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Sauvegarde automatique</h3>
                      <p className="text-sm text-muted-foreground">Sauvegarder les configurations</p>
                    </div>
                    <ModernButton variant="outline" size="sm">
                      Activer
                    </ModernButton>
                  </div>
                </div>
              </CardContent>
            </AnimatedCard>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};
