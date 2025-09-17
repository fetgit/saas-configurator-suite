import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Users, 
  Settings, 
  Database, 
  Shield, 
  BarChart3, 
  Mail, 
  MessageSquare, 
  Palette, 
  FileText, 
  Bot,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Crown,
  Activity,
  Server,
  Globe,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  // Redirection si pas authentifié ou pas admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin' && user?.role !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Données simulées pour le dashboard
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalCompanies: 45,
    systemHealth: 98.5,
    storageUsed: 67.2,
    monthlyRevenue: 45680,
    supportTickets: 23,
    securityAlerts: 2
  };

  const recentActivities = [
    {
      id: 1,
      type: 'user_registration',
      message: 'Nouvel utilisateur enregistré: Marie Dubois',
      timestamp: 'Il y a 5 minutes',
      icon: <Users className="h-4 w-4" />,
      color: 'text-success'
    },
    {
      id: 2,
      type: 'system_alert',
      message: 'Alerte de sécurité: Tentative de connexion suspecte',
      timestamp: 'Il y a 15 minutes',
      icon: <Shield className="h-4 w-4" />,
      color: 'text-destructive'
    },
    {
      id: 3,
      type: 'backup_completed',
      message: 'Sauvegarde automatique terminée avec succès',
      timestamp: 'Il y a 1 heure',
      icon: <Database className="h-4 w-4" />,
      color: 'text-success'
    },
    {
      id: 4,
      type: 'user_action',
      message: 'Admin a modifié les paramètres de l\'entreprise TechCorp',
      timestamp: 'Il y a 2 heures',
      icon: <Settings className="h-4 w-4" />,
      color: 'text-primary'
    }
  ];

  const quickActions = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les comptes utilisateurs et permissions',
      icon: <Users className="h-6 w-6" />,
      link: '/admin/users',
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'Paramètres système',
      description: 'Configurer les paramètres globaux',
      icon: <Settings className="h-6 w-6" />,
      link: '/admin/settings',
      color: 'bg-success/10 text-success'
    },
    {
      title: 'Base de données',
      description: 'Gérer et monitorer la base de données',
      icon: <Database className="h-6 w-6" />,
      link: '/admin/database',
      color: 'bg-warning/10 text-warning'
    },
    {
      title: 'Sécurité',
      description: 'Surveiller et gérer la sécurité',
      icon: <Shield className="h-6 w-6" />,
      link: '/admin/security',
      color: 'bg-destructive/10 text-destructive'
    },
    {
      title: 'Gestion des tarifs',
      description: 'Gérer les plans d\'abonnement et la facturation',
      icon: <DollarSign className="h-6 w-6" />,
      link: '/admin/pricing',
      color: 'bg-success/10 text-success'
    },
    {
      title: 'Analytics',
      description: 'Consulter les statistiques et rapports',
      icon: <BarChart3 className="h-6 w-6" />,
      link: '/admin/analytics',
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'Apparence',
      description: 'Personnaliser l\'interface utilisateur',
      icon: <Palette className="h-6 w-6" />,
      link: '/admin/appearance',
      color: 'bg-success/10 text-success'
    }
  ];

  const adminSections = [
    {
      title: 'Gestion des utilisateurs',
      description: 'Gérer les comptes, rôles et permissions',
      icon: <Users className="h-5 w-5" />,
      link: '/admin/users',
      stats: `${stats.totalUsers} utilisateurs`
    },
    {
      title: 'Gestion des entreprises',
      description: 'Administrer les entreprises et leurs paramètres',
      icon: <Building2 className="h-5 w-5" />,
      link: '/admin/companies',
      stats: `${stats.totalCompanies} entreprises`
    },
    {
      title: 'Système et performance',
      description: 'Monitorer les performances et la santé du système',
      icon: <Activity className="h-5 w-5" />,
      link: '/admin/performance',
      stats: `${stats.systemHealth}% de santé`
    },
    {
      title: 'Sécurité intégrée',
      description: 'Gérer la sécurité et les alertes',
      icon: <Shield className="h-5 w-5" />,
      link: '/admin/security-integrated',
      stats: `${stats.securityAlerts} alertes actives`
    },
    {
      title: 'Base de données',
      description: 'Administrer et optimiser la base de données',
      icon: <Database className="h-5 w-5" />,
      link: '/admin/database',
      stats: `${stats.storageUsed}% utilisé`
    },
    {
      title: 'Analytics et rapports',
      description: 'Consulter les métriques et générer des rapports',
      icon: <BarChart3 className="h-5 w-5" />,
      link: '/admin/analytics',
      stats: `${stats.monthlyRevenue}€ ce mois`
    },
    {
      title: 'Mailing et communication',
      description: 'Gérer les campagnes email et notifications',
      icon: <Mail className="h-5 w-5" />,
      link: '/admin/mailing',
      stats: '12 campagnes actives'
    },
    {
      title: 'Communauté',
      description: 'Modérer et gérer la communauté',
      icon: <MessageSquare className="h-5 w-5" />,
      link: '/admin/community',
      stats: '156 posts modérés'
    },
    {
      title: 'Chatbot et IA',
      description: 'Configurer l\'assistant virtuel',
      icon: <Bot className="h-5 w-5" />,
      link: '/admin/chatbot',
      stats: '89% de satisfaction'
    },
    {
      title: 'Apparence et branding',
      description: 'Personnaliser l\'interface et l\'identité',
      icon: <Palette className="h-5 w-5" />,
      link: '/admin/appearance',
      stats: '3 thèmes actifs'
    },
    {
      title: 'Pages légales',
      description: 'Gérer les CGU, RGPD et mentions légales',
      icon: <FileText className="h-5 w-5" />,
      link: '/admin/legal',
      stats: '5 pages configurées'
    },
    {
      title: 'Paramètres système',
      description: 'Configuration globale de l\'application',
      icon: <Settings className="h-5 w-5" />,
      link: '/admin/settings',
      stats: '24 paramètres actifs'
    },
    {
      title: 'Gestion des tarifs',
      description: 'Gérer les plans d\'abonnement et la facturation',
      icon: <DollarSign className="h-5 w-5" />,
      link: '/admin/pricing',
      stats: '3 plans actifs'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Header avec informations utilisateur */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-primary" />
              Administration
              {user?.role === 'superadmin' && (
                <Badge className="bg-gradient-primary text-white ml-2">
                  <Crown className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
              )}
              {user?.role === 'admin' && user?.company && (
                <Badge variant="secondary" className="ml-2">
                  <Building2 className="h-3 w-3 mr-1" />
                  {user.company}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenue dans le panneau d'administration. Gérez tous les aspects de votre application.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                  <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  <p className="text-xs text-success">
                    +12% ce mois
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entreprises</p>
                  <p className="text-2xl font-bold">{stats.totalCompanies}</p>
                  <p className="text-xs text-success">
                    +3 nouvelles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Activity className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Santé système</p>
                  <p className="text-2xl font-bold">{stats.systemHealth}%</p>
                  <p className="text-xs text-success">
                    Excellent
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Alertes</p>
                  <p className="text-2xl font-bold">{stats.securityAlerts}</p>
                  <p className="text-xs text-destructive">
                    À traiter
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Actions rapides */}
          <div className="lg:col-span-2">
            <Card className="shadow-medium border-0 mb-8">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>
                  Accédez rapidement aux fonctions d'administration les plus utilisées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="h-auto p-4 justify-start" 
                      asChild
                    >
                      <Link to={action.link}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${action.color}`}>
                          {action.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sections d'administration */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Toutes les sections d'administration</CardTitle>
                <CardDescription>
                  Accédez à tous les modules d'administration disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {adminSections.map((section, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="h-auto p-4 justify-start" 
                      asChild
                    >
                      <Link to={section.link}>
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <div className="text-primary">
                            {section.icon}
                          </div>
                        </div>
                        <div className="text-left flex-1">
                          <div className="font-medium">{section.title}</div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {section.description}
                          </div>
                          <div className="text-xs text-primary font-medium">
                            {section.stats}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activités récentes */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Activités récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.color} bg-opacity-10`}>
                        <div className={activity.color}>
                          {activity.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link to="/admin/activity">
                    Voir toutes les activités
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Statut système */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Statut système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Serveur principal</span>
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      En ligne
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Base de données</span>
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      En ligne
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API</span>
                    <Badge className="bg-success text-success-foreground">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      En ligne
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">CDN</span>
                    <Badge className="bg-warning text-warning-foreground">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Lent
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions système */}
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Actions système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Sauvegarde manuelle
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Restaurer données
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Redémarrer services
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir les logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
