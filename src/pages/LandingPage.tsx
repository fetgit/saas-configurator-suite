import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { MediaSection, MediaGallery } from '@/components/MediaSection';
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
  Star
} from 'lucide-react';

export const LandingPage = () => {
  const { t } = useLanguage();
  const { config } = useAppearance();

  // Debug de la configuration hero
  React.useEffect(() => {
    console.log('🔍 LandingPage - Configuration hero:', {
      showHero: config.heroConfig.showHero,
      backgroundType: config.heroConfig.backgroundType,
      backgroundColor: config.heroConfig.backgroundColor,
      backgroundImage: config.heroConfig.backgroundImage,
      backgroundImageId: config.heroConfig.backgroundImageId
    });
    
    if (config.heroConfig.backgroundType === 'color' && config.heroConfig.backgroundColor) {
      console.log('🎨 Couleur hero appliquée:', config.heroConfig.backgroundColor);
    }
  }, [config.heroConfig]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header avec navigation */}
      <Header transparent />

      {/* Hero Section */}
      {config.heroConfig.showHero && (
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            {config.heroConfig.backgroundType === 'color' && (
              <div 
                className="absolute inset-0"
                style={{ 
                  backgroundColor: config.heroConfig.backgroundColor,
                  background: `linear-gradient(135deg, ${config.heroConfig.backgroundColor} 0%, ${config.heroConfig.backgroundColor}dd 100%)`
                }}
              ></div>
            )}
            {config.heroConfig.backgroundType === 'image' && config.heroConfig.backgroundImage && (
              <>
                <img 
                  src={config.heroConfig.backgroundImage}
                  alt="Hero background"
                  className="absolute inset-0 w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onLoad={() => console.log('✅ Image hero chargée:', config.heroConfig.backgroundImage)}
                  onError={(e) => console.error('❌ Erreur chargement image hero:', e, config.heroConfig.backgroundImage)}
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </>
            )}
            {config.heroConfig.backgroundType === 'image' && !config.heroConfig.backgroundImage && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <p className="text-white text-lg">Aucune image hero configurée</p>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
          
          <div className="relative container mx-auto px-4 lg:px-8">
            <div 
              className={`max-w-4xl mx-auto ${
                config.heroConfig.layout === 'centered' ? 'text-center' : 
                config.heroConfig.layout === 'left' ? 'text-left' : 'text-right'
              }`}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {config.branding.heroTitle || t('hero.title')}
              </h1>
              <p className={`text-xl text-white/90 mb-8 leading-relaxed ${
                config.heroConfig.layout === 'centered' ? 'max-w-2xl mx-auto' : 
                config.heroConfig.layout === 'left' ? 'max-w-2xl' : 'max-w-2xl ml-auto'
              }`}>
                {config.branding.heroSubtitle || t('hero.subtitle')}
              </p>
              
              <div className={`flex flex-col sm:flex-row gap-4 ${config.heroConfig.layout === 'centered' ? 'justify-center' : config.heroConfig.layout === 'left' ? 'justify-start' : 'justify-end'}`}>
                <Button 
                  size="lg" 
                  asChild 
                  className="bg-white hover:bg-white/90 shadow-large"
                  style={{ color: config.colors.primary }}
                >
                  <Link to="/register">
                    {t('hero.cta.primary')}
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
                >
                  {t('hero.cta.secondary')}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('features.title')}</h2>
            <p className="text-lg text-muted-foreground">
              Découvrez toutes les fonctionnalités qui font de notre SaaS la solution parfaite pour votre entreprise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Personnalisation */}
            <Card 
              className="border-0 shadow-medium hover:shadow-large transition-all duration-300"
              style={{ borderRadius: config.layout.borderRadius }}
            >
              <CardContent className="p-8">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ 
                    backgroundColor: config.colors.primary + '1A',
                    borderRadius: config.layout.borderRadius 
                  }}
                >
                  <Palette className="h-6 w-6" style={{ color: config.colors.primary }} />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('features.customizable')}</h3>
                <p className="text-muted-foreground">
                  Personnalisez complètement l'apparence, les couleurs, les menus et tous les éléments de votre application.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: Sécurité */}
            <Card 
              className="border-0 shadow-medium hover:shadow-large transition-all duration-300"
              style={{ borderRadius: config.layout.borderRadius }}
            >
              <CardContent className="p-8">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ 
                    backgroundColor: config.colors.success + '1A',
                    borderRadius: config.layout.borderRadius 
                  }}
                >
                  <Shield className="h-6 w-6" style={{ color: config.colors.success }} />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('features.secure')}</h3>
                <p className="text-muted-foreground">
                  Système de sécurité avancé avec 3 niveaux d'utilisateurs et gestion complète des permissions.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: Multi-langue */}
            <Card 
              className="border-0 shadow-medium hover:shadow-large transition-all duration-300"
              style={{ borderRadius: config.layout.borderRadius }}
            >
              <CardContent className="p-8">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ 
                    backgroundColor: config.colors.warning + '1A',
                    borderRadius: config.layout.borderRadius 
                  }}
                >
                  <Globe className="h-6 w-6" style={{ color: config.colors.warning }} />
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('features.multilingual')}</h3>
                <p className="text-muted-foreground">
                  Support natif pour 4 langues : Français, Anglais, Espagnol et Italien avec traductions complètes.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4: Base de données */}
            <Card 
              className="border-0 shadow-medium hover:shadow-large transition-all duration-300"
              style={{ borderRadius: config.layout.borderRadius }}
            >
              <CardContent className="p-8">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ 
                    backgroundColor: config.colors.primary + '1A',
                    borderRadius: config.layout.borderRadius 
                  }}
                >
                  <Settings className="h-6 w-6" style={{ color: config.colors.primary }} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Base de données flexible</h3>
                <p className="text-muted-foreground">
                  Connectez-vous à vos bases de données MySQL existantes avec configuration simple et sécurisée.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5: Performance */}
            <Card 
              className="border-0 shadow-medium hover:shadow-large transition-all duration-300"
              style={{ borderRadius: config.layout.borderRadius }}
            >
              <CardContent className="p-8">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ 
                    backgroundColor: config.colors.success + '1A',
                    borderRadius: config.layout.borderRadius 
                  }}
                >
                  <Zap className="h-6 w-6" style={{ color: config.colors.success }} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Haute Performance</h3>
                <p className="text-muted-foreground">
                  Architecture moderne et optimisée pour des performances exceptionnelles à grande échelle.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6: Gestion des utilisateurs */}
            <Card 
              className="border-0 shadow-medium hover:shadow-large transition-all duration-300"
              style={{ borderRadius: config.layout.borderRadius }}
            >
              <CardContent className="p-8">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ 
                    backgroundColor: config.colors.warning + '1A',
                    borderRadius: config.layout.borderRadius 
                  }}
                >
                  <Users className="h-6 w-6" style={{ color: config.colors.warning }} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Gestion complète</h3>
                <p className="text-muted-foreground">
                  Interface d'administration complète pour gérer utilisateurs, paramètres et toute l'application.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Carrousel - Ajoutée dynamiquement */}
      {config.showMediaSections && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <MediaSection
              type="carousel"
              carouselId="1"
              title="Découvrez notre solution en images"
              description="Explorez les fonctionnalités principales de notre plateforme SaaS"
              className="mb-16"
            />
          </div>
        </section>
      )}

      {/* Section Médias - Galerie d'images */}
      {config.showMediaSections && config.mediaLibraryVisible && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <MediaGallery
              title="Nos réalisations"
              filterType="image"
              gridCols={3}
            />
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('nav.pricing')}</h2>
            <p className="text-lg text-muted-foreground">
              Choisissez l'offre qui correspond le mieux à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan Starter */}
            <Card 
              className="border-0 shadow-medium"
              style={{ borderRadius: config.layout.borderRadius }}
            >
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Starter</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold">29€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Jusqu'à 10 utilisateurs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>1 base de données</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Support email</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  style={{ borderRadius: config.layout.borderRadius }}
                >
                  Commencer
                </Button>
              </CardContent>
            </Card>

            {/* Plan Pro */}
            <Card 
              className="shadow-large relative"
              style={{ 
                borderRadius: config.layout.borderRadius,
                borderWidth: '2px',
                borderColor: config.colors.primary
              }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span 
                  className="px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 text-white"
                  style={{ 
                    backgroundColor: config.colors.primary,
                    borderRadius: config.layout.borderRadius 
                  }}
                >
                  <Star className="h-3 w-3" />
                  Populaire
                </span>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Pro</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold">79€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Jusqu'à 100 utilisateurs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Bases de données illimitées</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Support prioritaire</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>API complète</span>
                  </li>
                </ul>
                <Button 
                  className="w-full text-white"
                  style={{ 
                    backgroundColor: config.colors.primary,
                    borderRadius: config.layout.borderRadius 
                  }}
                >
                  Commencer
                </Button>
              </CardContent>
            </Card>

            {/* Plan Enterprise */}
            <Card 
              className="border-0 shadow-medium"
              style={{ borderRadius: config.layout.borderRadius }}
            >
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold">199€</span>
                  <span className="text-muted-foreground">/mois</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Utilisateurs illimités</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Infrastructure dédiée</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Support 24/7</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5" style={{ color: config.colors.success }} />
                    <span>Personnalisation complète</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  style={{ borderRadius: config.layout.borderRadius }}
                >
                  Nous contacter
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-24"
        style={{ 
          background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.primaryDark})`
        }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Prêt à transformer votre entreprise ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez des milliers d'entreprises qui font déjà confiance à notre solution SaaS.
            </p>
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
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      {config.layout.footerStyle !== 'hidden' && (
        <footer className="bg-background border-t py-16">
          <div className="container mx-auto px-4 lg:px-8">
            {config.layout.footerStyle === 'complete' ? (
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    {config.branding.logoUrl ? (
                      <img 
                        src={config.branding.logoUrl} 
                        alt="Logo" 
                        className="w-8 h-8"
                        style={{ borderRadius: config.layout.borderRadius }}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div 
                        className="w-8 h-8"
                        style={{ 
                          background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.primaryDark})`,
                          borderRadius: config.layout.borderRadius 
                        }}
                      ></div>
                    )}
                    <span className="text-xl font-bold">{config.branding.companyName}</span>
                  </div>
                  <p className="text-muted-foreground">
                    La solution SaaS complète et personnalisable pour votre entreprise.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Produit</h4>
                  <ul className="space-y-2">
                    <li><Link to="/features" className="text-muted-foreground hover:text-foreground">Fonctionnalités</Link></li>
                    <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Tarifs</Link></li>
                    <li><Link to="/documentation" className="text-muted-foreground hover:text-foreground">Documentation</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Entreprise</h4>
                  <ul className="space-y-2">
                    <li><Link to="/about" className="text-muted-foreground hover:text-foreground">À propos</Link></li>
                    <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
                    <li><Link to="/careers" className="text-muted-foreground hover:text-foreground">Carrières</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Légal</h4>
                  <ul className="space-y-2">
                    <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Confidentialité</Link></li>
                    <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Conditions</Link></li>
                    <li><Link to="/legal" className="text-muted-foreground hover:text-foreground">Mentions légales</Link></li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {config.branding.logoUrl ? (
                    <img 
                      src={config.branding.logoUrl} 
                      alt="Logo" 
                      className="w-6 h-6"
                      style={{ borderRadius: config.layout.borderRadius }}
                    />
                  ) : (
                    <div 
                      className="w-6 h-6"
                      style={{ 
                        background: `linear-gradient(135deg, ${config.colors.primary}, ${config.colors.primaryDark})`,
                        borderRadius: config.layout.borderRadius 
                      }}
                    ></div>
                  )}
                  <span className="font-bold">{config.branding.companyName}</span>
                </div>
              </div>
            )}

            <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
              <p>&copy; 2024 {config.branding.companyName}. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};