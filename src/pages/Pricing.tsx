import React, { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Star, 
  ArrowRight,
  Zap,
  Shield,
  Users,
  Database,
  Headphones,
  Globe,
  Lock
} from 'lucide-react';

// Fonction pour obtenir l'icône par nom
const getIcon = (iconName: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    Shield: <Shield className="h-6 w-6" />,
    Zap: <Zap className="h-6 w-6" />,
    Users: <Users className="h-6 w-6" />,
    Database: <Database className="h-6 w-6" />,
    Globe: <Globe className="h-6 w-6" />,
    Headphones: <Headphones className="h-6 w-6" />,
    Lock: <Lock className="h-6 w-6" />,
    CheckCircle: <CheckCircle className="h-6 w-6" />
  };
  return icons[iconName] || <Shield className="h-6 w-6" />;
};

export const Pricing = () => {
  const { t } = useLanguage();
  const { config } = useAppearance();
  const navigate = useNavigate();

  // Rediriger si la page tarifs n'est pas activée
  useEffect(() => {
    if (config.pricingConfig?.showPricingPage === false) {
      navigate('/');
    }
  }, [config.pricingConfig?.showPricingPage, navigate]);

  // Utiliser les plans de la configuration ou des plans par défaut
  const plans = config.pricingConfig?.plans || [
    {
      id: 'starter',
      name: 'Starter',
      price: 29,
      currency: '€',
      period: 'monthly' as const,
      description: 'Parfait pour les petites équipes qui commencent',
      features: [
        { text: 'Jusqu\'à 10 utilisateurs', included: true },
        { text: '1 base de données', included: true },
        { text: 'Support email', included: true },
        { text: 'Stockage 10GB', included: true }
      ],
      ctaText: 'Commencer',
      ctaLink: '/signup?plan=starter',
      highlighted: false,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 79,
      currency: '€',
      period: 'monthly' as const,
      description: 'Idéal pour les entreprises en croissance',
      features: [
        { text: 'Jusqu\'à 100 utilisateurs', included: true },
        { text: 'Bases de données illimitées', included: true },
        { text: 'Support prioritaire', included: true },
        { text: 'API complète', included: true },
        { text: 'Stockage 100GB', included: true }
      ],
      ctaText: 'Commencer',
      ctaLink: '/signup?plan=pro',
      highlighted: true,
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      currency: '€',
      period: 'monthly' as const,
      description: 'Solution complète pour les grandes organisations',
      features: [
        { text: 'Utilisateurs illimités', included: true },
        { text: 'Infrastructure dédiée', included: true },
        { text: 'Support 24/7', included: true },
        { text: 'Personnalisation complète', included: true },
        { text: 'Stockage illimité', included: true }
      ],
      ctaText: 'Nous contacter',
      ctaLink: '/contact?plan=enterprise',
      highlighted: false,
      popular: false
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Sécurité de niveau entreprise',
      description: 'Chiffrement end-to-end, authentification 2FA, conformité RGPD'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Performance optimisée',
      description: 'Infrastructure cloud haute disponibilité avec CDN global'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Gestion d\'équipe avancée',
      description: 'Rôles et permissions granulaires, collaboration en temps réel'
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: 'Intégration base de données',
      description: 'Connexion sécurisée à vos bases MySQL existantes'
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Multi-langue',
      description: 'Support natif pour 4 langues avec traductions complètes'
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      title: 'Support expert',
      description: 'Équipe de support technique disponible selon votre plan'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Tarifs transparents pour tous
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choisissez le plan qui correspond parfaitement à vos besoins. 
              Pas de frais cachés, pas de surprises.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Essai gratuit 14 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Annulation à tout moment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Support inclus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans de tarification */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={plan.id || plan.name}
                className={`relative ${
                  plan.popular || plan.highlighted
                    ? 'shadow-large border-2' 
                    : 'shadow-medium border-0'
                }`}
                style={{ 
                  borderRadius: config.layout.borderRadius,
                  borderColor: (plan.popular || plan.highlighted) ? config.colors.primary : undefined
                }}
              >
                {(plan.popular || plan.highlighted) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge 
                      className="px-4 py-1 text-sm font-medium flex items-center gap-1 text-white"
                      style={{ 
                        backgroundColor: config.colors.primary,
                        borderRadius: config.layout.borderRadius 
                      }}
                    >
                      <Star className="h-3 w-3" />
                      Populaire
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}{plan.currency}</span>
                      <span className="text-muted-foreground">/{plan.period === 'monthly' ? 'mois' : 'an'}</span>
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle 
                            className="h-5 w-5 text-success flex-shrink-0 mt-0.5" 
                            style={{ color: config.colors.success }}
                          />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? '' : 'text-muted-foreground opacity-60'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      (plan.popular || plan.highlighted)
                        ? 'text-white' 
                        : 'variant-outline'
                    }`}
                    style={{ 
                      backgroundColor: (plan.popular || plan.highlighted) ? config.colors.primary : undefined,
                      borderRadius: config.layout.borderRadius 
                    }}
                    asChild={!!plan.ctaLink}
                  >
                    {plan.ctaLink ? (
                      <Link to={plan.ctaLink}>
                        {plan.ctaText}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    ) : (
                      <>
                        {plan.ctaText}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités incluses */}
      {config.pricingConfig?.showFeaturesSection !== false && (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {config.pricingConfig?.featuresTitle || "Fonctionnalités incluses dans tous les plans"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {config.pricingConfig?.featuresDescription || "Tous nos plans incluent ces fonctionnalités essentielles"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {(config.pricingConfig?.features || []).map((feature, index) => (
              <Card 
                key={index}
                className="border-0 shadow-medium hover:shadow-large transition-all duration-300"
                style={{ borderRadius: config.layout.borderRadius }}
              >
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
                    style={{ 
                      backgroundColor: config.colors.primary + '1A',
                      borderRadius: config.layout.borderRadius 
                    }}
                  >
                    <div style={{ color: config.colors.primary }}>
                      {getIcon(feature.icon)}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* FAQ */}
      {config.pricingConfig?.showFAQSection !== false && (
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {config.pricingConfig?.faqTitle || "Questions fréquentes"}
            </h2>
            
            <div className="space-y-6">
              {(config.pricingConfig?.faqs || []).map((faq, index) => (
                <Card key={index} className="border-0 shadow-medium" style={{ borderRadius: config.layout.borderRadius }}>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      {config.pricingConfig?.showFinalCTA !== false && (
      <section 
        className="py-16"
        style={{ 
          background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.primaryDark})`
        }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {config.pricingConfig?.finalCTATitle || "Prêt à commencer ?"}
            </h2>
            <p className="text-xl text-white/90 mb-8">
              {config.pricingConfig?.finalCTADescription || "Rejoignez des milliers d'entreprises qui font confiance à notre solution."}
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
                  {config.pricingConfig?.finalCTAPrimary || "Commencer l'essai gratuit"}
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
                  {config.pricingConfig?.finalCTASecondary || "Nous contacter"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      )}
    </div>
  );
};
