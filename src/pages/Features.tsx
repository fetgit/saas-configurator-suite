import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Palette, 
  Globe, 
  Settings, 
  Zap, 
  Users, 
  BarChart3, 
  Lock,
  CheckCircle,
  ArrowRight,
  Database,
  MessageSquare,
  Mail,
  Bot,
  FileText,
  Camera,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Star,
  Heart,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail as MailIcon,
  ExternalLink
} from 'lucide-react';

export const Features = () => {
  const { t } = useLanguage();
  const { config } = useAppearance();

  const mainFeatures = [
    {
      icon: <Palette className="h-8 w-8" />,
      title: 'Personnalisation complète',
      description: 'Personnalisez chaque aspect de votre application : couleurs, logos, menus, et bien plus.',
      details: [
        'Thèmes personnalisables',
        'Couleurs et typographies',
        'Logos et branding',
        'Layouts adaptatifs',
        'Menus personnalisés'
      ],
      color: 'primary'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Sécurité avancée',
      description: 'Système de sécurité de niveau entreprise avec authentification multi-facteurs.',
      details: [
        'Authentification 2FA',
        'Gestion des rôles',
        'Chiffrement des données',
        'Audit des connexions',
        'Conformité RGPD'
      ],
      color: 'success'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Multi-langue',
      description: 'Support natif pour 4 langues avec système de traduction complet.',
      details: [
        'Français, Anglais, Espagnol, Italien',
        'Traductions complètes',
        'Changement en temps réel',
        'Traductions personnalisables',
        'Support RTL'
      ],
      color: 'warning'
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: 'Base de données flexible',
      description: 'Connectez-vous à vos bases de données MySQL existantes facilement.',
      details: [
        'Connexion MySQL sécurisée',
        'Migration automatique',
        'Sauvegardes automatiques',
        'Monitoring en temps réel',
        'Optimisation des requêtes'
      ],
      color: 'primary'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Gestion des utilisateurs',
      description: 'Système complet de gestion des utilisateurs avec 3 niveaux d\'accès.',
      details: [
        'Utilisateurs, Admins, Super-admins',
        'Gestion des permissions',
        'Profils personnalisables',
        'Historique des actions',
        'Notifications personnalisées'
      ],
      color: 'success'
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Analytics avancées',
      description: 'Tableaux de bord complets avec métriques en temps réel.',
      details: [
        'Métriques de performance',
        'Rapports personnalisés',
        'Export des données',
        'Alertes automatiques',
        'Visualisations interactives'
      ],
      color: 'warning'
    }
  ];

  const additionalFeatures = [
    {
      category: 'Communication',
      icon: <MessageSquare className="h-6 w-6" />,
      features: [
        { name: 'Chatbot intelligent', description: 'Assistant IA personnalisable' },
        { name: 'Système de mailing', description: 'Campagnes email automatisées' },
        { name: 'Notifications push', description: 'Alertes en temps réel' },
        { name: 'Forum communautaire', description: 'Espace d\'échange entre utilisateurs' }
      ]
    },
    {
      category: 'Contenu',
      icon: <FileText className="h-6 w-6" />,
      features: [
        { name: 'Gestion des médias', description: 'Bibliothèque de fichiers complète' },
        { name: 'Pages légales', description: 'Générateur de CGU, RGPD, etc.' },
        { name: 'Blog intégré', description: 'Système de publication d\'articles' },
        { name: 'Documentation', description: 'Centre d\'aide interactif' }
      ]
    },
    {
      category: 'Administration',
      icon: <Settings className="h-6 w-6" />,
      features: [
        { name: 'Panel d\'administration', description: 'Interface de gestion complète' },
        { name: 'Monitoring système', description: 'Surveillance des performances' },
        { name: 'Sauvegardes automatiques', description: 'Protection des données' },
        { name: 'Logs d\'audit', description: 'Traçabilité des actions' }
      ]
    },
    {
      category: 'Intégrations',
      icon: <ExternalLink className="h-6 w-6" />,
      features: [
        { name: 'API REST complète', description: 'Intégration avec vos outils' },
        { name: 'Webhooks', description: 'Notifications automatiques' },
        { name: 'SSO', description: 'Authentification unique' },
        { name: 'Import/Export', description: 'Migration de données facile' }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          border: 'border-primary/20'
        };
      case 'success':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          border: 'border-success/20'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          text: 'text-warning',
          border: 'border-warning/20'
        };
      default:
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          border: 'border-primary/20'
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fonctionnalités puissantes pour votre entreprise
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités qui font de notre SaaS la solution 
              complète pour moderniser votre entreprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild
                style={{ 
                  backgroundColor: config.colors.primary,
                  borderRadius: config.layout.borderRadius 
                }}
              >
                <Link to="/register">
                  Essayer gratuitement
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                style={{ borderRadius: config.layout.borderRadius }}
                asChild
              >
                <Link to="/pricing">
                  Voir les tarifs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités principales */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Fonctionnalités principales
            </h2>
            <p className="text-lg text-muted-foreground">
              Toutes les fonctionnalités essentielles pour faire fonctionner votre entreprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => {
              const colors = getColorClasses(feature.color);
              return (
                <Card 
                  key={index}
                  className={`border-0 shadow-medium hover:shadow-large transition-all duration-300 ${colors.border}`}
                  style={{ borderRadius: config.layout.borderRadius }}
                >
                  <CardContent className="p-8">
                    <div 
                      className={`w-16 h-16 rounded-lg flex items-center justify-center mb-6 ${colors.bg}`}
                      style={{ borderRadius: config.layout.borderRadius }}
                    >
                      <div className={colors.text}>
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground mb-6">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fonctionnalités par catégorie */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Fonctionnalités par catégorie
            </h2>
            <p className="text-lg text-muted-foreground">
              Explorez toutes nos fonctionnalités organisées par domaine
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {additionalFeatures.map((category, index) => (
              <Card 
                key={index}
                className="border-0 shadow-medium"
                style={{ borderRadius: config.layout.borderRadius }}
              >
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: config.colors.primary + '1A',
                        borderRadius: config.layout.borderRadius 
                      }}
                    >
                      <div style={{ color: config.colors.primary }}>
                        {category.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{category.category}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {category.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium">{feature.name}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparaison des plans */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Fonctionnalités par plan
            </h2>
            <p className="text-lg text-muted-foreground">
              Comparez les fonctionnalités disponibles selon votre plan
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-large" style={{ borderRadius: config.layout.borderRadius }}>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-6 font-semibold">Fonctionnalités</th>
                        <th className="text-center p-6 font-semibold">Starter</th>
                        <th className="text-center p-6 font-semibold">Pro</th>
                        <th className="text-center p-6 font-semibold">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-6 font-medium">Utilisateurs</td>
                        <td className="text-center p-6">Jusqu'à 10</td>
                        <td className="text-center p-6">Jusqu'à 100</td>
                        <td className="text-center p-6">Illimités</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-6 font-medium">Bases de données</td>
                        <td className="text-center p-6">1</td>
                        <td className="text-center p-6">Illimitées</td>
                        <td className="text-center p-6">Illimitées</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-6 font-medium">Support</td>
                        <td className="text-center p-6">Email</td>
                        <td className="text-center p-6">Prioritaire</td>
                        <td className="text-center p-6">24/7</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-6 font-medium">Personnalisation</td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-6 font-medium">API complète</td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-6 font-medium">Analytics avancées</td>
                        <td className="text-center p-6">-</td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                      </tr>
                      <tr>
                        <td className="p-6 font-medium">Infrastructure dédiée</td>
                        <td className="text-center p-6">-</td>
                        <td className="text-center p-6">-</td>
                        <td className="text-center p-6">
                          <CheckCircle className="h-5 w-5 text-success mx-auto" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16"
        style={{ 
          background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.primaryDark})`
        }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à découvrir toutes ces fonctionnalités ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Commencez votre essai gratuit dès aujourd'hui et explorez toutes les possibilités.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                asChild 
                className="bg-white hover:bg-white/90"
                style={{ 
                  color: config.colors.primary,
                  borderRadius: config.layout.borderRadius 
                }}
              >
                <Link to="/register">
                  Commencer l'essai gratuit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white"
                style={{ 
                  '--hover-color': config.colors.primary 
                } as React.CSSProperties}
                asChild
              >
                <Link to="/contact">
                  Demander une démo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
