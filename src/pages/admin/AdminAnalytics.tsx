import React, { useState } from 'react';
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
  BarChart3, 
  Users, 
  MessageCircle, 
  Mail,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Calendar,
  Eye,
  Clock,
  Target,
  Zap,
  Globe,
  Shield,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Types pour les données analytiques
interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalConversations: number;
    totalEmails: number;
    userGrowth: number;
    engagementRate: number;
  };
  performance: {
    pageViews: number;
    bounceRate: number;
    sessionDuration: number;
    conversionRate: number;
    serverUptime: number;
    responseTime: number;
  };
  traffic: {
    sources: Array<{ name: string; value: number; percentage: number }>;
    devices: Array<{ name: string; value: number; percentage: number }>;
    locations: Array<{ country: string; sessions: number; percentage: number }>;
  };
  security: {
    threats: number;
    blockedIps: number;
    failedLogins: number;
    securityScore: number;
  };
}

export function AdminAnalytics() {
  const { user, isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Données simulées - dans un vrai projet, ces données viendraient de votre API
  const analyticsData: AnalyticsData = {
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      totalConversations: 0,
      totalEmails: 0,
      userGrowth: 0,
      engagementRate: 0
    },
    performance: {
      pageViews: 0,
      bounceRate: 0,
      sessionDuration: 0,
      conversionRate: 0,
      serverUptime: 0,
      responseTime: 0
    },
    traffic: {
      sources: [],
      devices: [],
      locations: []
    },
    security: {
      threats: 0,
      blockedIps: 0,
      failedLogins: 0,
      securityScore: 0
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Simulation de rechargement des données
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Données actualisées",
        description: "Les statistiques ont été mises à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de recharger les données.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const reportData = {
        timeRange,
        generatedAt: new Date().toISOString(),
        company: user?.company || 'Global',
        data: analyticsData,
        summary: {
          totalMetrics: Object.keys(analyticsData.overview).length,
          performanceScore: analyticsData.performance.serverUptime,
          securityStatus: analyticsData.security.securityScore > 90 ? 'Excellent' : 'Bon'
        }
      };
      
      const jsonData = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Rapport exporté",
        description: "Le rapport d'analyse a été téléchargé.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter le rapport.",
        variant: "destructive",
      });
    }
  };

  const getGrowthBadge = (value: number) => {
    return value >= 0 ? (
      <Badge variant="default" className="bg-success text-success-foreground">
        <TrendingUp className="h-3 w-3 mr-1" />
        +{value}%
      </Badge>
    ) : (
      <Badge variant="destructive">
        <TrendingDown className="h-3 w-3 mr-1" />
        {value}%
      </Badge>
    );
  };

  const getStatusBadge = (score: number) => {
    if (score >= 95) return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
    if (score >= 80) return <Badge variant="default">Bon</Badge>;
    if (score >= 60) return <Badge variant="secondary">Moyen</Badge>;
    return <Badge variant="destructive">Faible</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Statistiques & Analytics
            </h1>
            <p className="text-muted-foreground">
              {isSuperAdmin 
                ? 'Vue d\'ensemble de toutes les métriques de la plateforme'
                : `Statistiques pour ${user?.company}`
              }
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background border shadow-lg">
                <SelectItem value="24h">Dernières 24h</SelectItem>
                <SelectItem value="7d">7 derniers jours</SelectItem>
                <SelectItem value="30d">30 derniers jours</SelectItem>
                <SelectItem value="3m">3 derniers mois</SelectItem>
                <SelectItem value="1y">Dernière année</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            
            <Button onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {analyticsData.overview.activeUsers.toLocaleString()} actifs
                </p>
                {getGrowthBadge(analyticsData.overview.userGrowth)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations IA</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalConversations.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Taux d'engagement: {analyticsData.overview.engagementRate}%
              </p>
              <Progress value={analyticsData.overview.engagementRate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.overview.totalEmails.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Performance mailing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Score de sécurité</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyticsData.security.securityScore}%</div>
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(analyticsData.security.securityScore)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interface à onglets */}
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="traffic">Trafic</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="reports">Rapports</TabsTrigger>
          </TabsList>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Métriques de performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Pages vues</span>
                    </div>
                    <span className="font-semibold">{analyticsData.performance.pageViews.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Taux de rebond</span>
                    </div>
                    <span className="font-semibold">{analyticsData.performance.bounceRate}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Durée de session</span>
                    </div>
                    <span className="font-semibold">{analyticsData.performance.sessionDuration}min</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Taux de conversion</span>
                    </div>
                    <span className="font-semibold">{analyticsData.performance.conversionRate}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Performance technique
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Disponibilité serveur</span>
                      <span className="font-semibold">{analyticsData.performance.serverUptime}%</span>
                    </div>
                    <Progress value={analyticsData.performance.serverUptime} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Temps de réponse</span>
                      <span className="font-semibold">{analyticsData.performance.responseTime}ms</span>
                    </div>
                    <Progress value={analyticsData.performance.responseTime / 10} className="h-2" />
                  </div>

                  <Separator />
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-sm text-success">Système opérationnel</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trafic */}
          <TabsContent value="traffic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sources de trafic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.traffic.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-primary" style={{
                            backgroundColor: `hsl(${index * 90}, 70%, 50%)`
                          }}></div>
                          <span className="text-sm">{source.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{source.value.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{source.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Appareils</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.traffic.devices.map((device, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{device.name}</span>
                          <span className="font-semibold">{device.percentage}%</span>
                        </div>
                        <Progress value={device.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Localisation géographique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsData.traffic.locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{location.country}</span>
                        <div className="text-right">
                          <div className="font-semibold">{location.sessions.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{location.percentage}%</div>
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
                    État de la sécurité
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">Menaces détectées</span>
                    </div>
                    <Badge variant="destructive">{analyticsData.security.threats}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-warning" />
                      <span className="text-sm">IPs bloquées</span>
                    </div>
                    <Badge variant="secondary">{analyticsData.security.blockedIps}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-info/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-info" />
                      <span className="text-sm">Tentatives échouées</span>
                    </div>
                    <Badge variant="outline">{analyticsData.security.failedLogins}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Score de sécurité global</CardTitle>
                  <CardDescription>
                    Évaluation basée sur les mesures de protection actives
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{analyticsData.security.securityScore}%</div>
                    {getStatusBadge(analyticsData.security.securityScore)}
                    <Progress value={analyticsData.security.securityScore} className="mt-4 h-3" />
                  </div>
                  
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Pare-feu activé</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>SSL/TLS configuré</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span>Authentification 2FA</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rapports */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Génération de rapports</CardTitle>
                <CardDescription>
                  Exportez des rapports détaillés pour différentes périodes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold">Rapport d'activité</h4>
                    <p className="text-sm text-muted-foreground">
                      Statistiques d'utilisation et d'engagement
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold">Rapport de performance</h4>
                    <p className="text-sm text-muted-foreground">
                      Métriques techniques et temps de réponse
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg space-y-2">
                    <h4 className="font-semibold">Rapport de sécurité</h4>
                    <p className="text-sm text-muted-foreground">
                      Incidents et mesures de protection
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Rapport complet</h4>
                    <p className="text-sm text-muted-foreground">
                      Toutes les métriques pour la période sélectionnée
                    </p>
                  </div>
                  <Button onClick={handleExportReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter tout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}