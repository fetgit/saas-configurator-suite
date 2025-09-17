import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AppearanceConfigService, { AppearanceConfig as ServiceAppearanceConfig } from '../services/appearanceConfigService';
import { useAuth } from './AuthContext';

export interface HeroConfig {
  showHero: boolean;
  backgroundType: 'color' | 'image';
  backgroundImage: string;
  backgroundImageId?: number; // ID de l'image uploadée
  backgroundColor: string;
  layout: 'centered' | 'left' | 'right';
}

export interface CarouselConfig {
  autoplay: boolean;
  interval: number;
  showArrows: boolean;
  showDots: boolean;
  height: string;
  borderRadius: string;
  images: Array<{
    id: string;
    url: string;
    alt: string;
  }>;
}

export interface FeatureConfig {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaSecondary?: string;
  showFeaturesSection?: boolean;
  features?: {
    customization?: {
      title?: string;
      description?: string;
      icon?: string;
      enabled?: boolean;
    };
    security?: {
      title?: string;
      description?: string;
      icon?: string;
      enabled?: boolean;
    };
    multiLanguage?: {
      title?: string;
      description?: string;
      icon?: string;
      enabled?: boolean;
    };
    database?: {
      title?: string;
      description?: string;
      icon?: string;
      enabled?: boolean;
    };
    userManagement?: {
      title?: string;
      description?: string;
      icon?: string;
      enabled?: boolean;
    };
    analytics?: {
      title?: string;
      description?: string;
      icon?: string;
      enabled?: boolean;
    };
  };
}

export interface PricingPlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: 'monthly' | 'annually';
  description?: string;
  features: PricingPlanFeature[];
  ctaText: string;
  ctaLink?: string;
  highlighted: boolean;
  popular?: boolean;
}

export interface PricingFeature {
  icon: string;
  title: string;
  description: string;
}

export interface PricingFAQ {
  question: string;
  answer: string;
}

export interface HomepageCTAConfig {
  showCTASection: boolean;
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
}

export interface PricingConfig {
  showPricingPage?: boolean;
  showPricingSection?: boolean;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaSecondary?: string;
  plans?: PricingPlan[];
  showFeaturesSection?: boolean;
  featuresTitle?: string;
  featuresDescription?: string;
  features?: PricingFeature[];
  showFAQSection?: boolean;
  faqTitle?: string;
  faqs?: PricingFAQ[];
  showFinalCTA?: boolean;
  finalCTATitle?: string;
  finalCTADescription?: string;
  finalCTAPrimary?: string;
  finalCTASecondary?: string;
}

export interface AppearanceConfig {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    success: string;
    warning: string;
    destructive: string;
  };
  branding: {
    companyName: string;
    logoUrl: string;
    logoId?: number; // ID de l'image uploadée
    faviconUrl: string;
    faviconId?: number; // ID de l'image uploadée
    heroTitle: string;
    heroSubtitle: string;
  };
  layout: {
    headerStyle: string;
    footerStyle: string;
    sidebarPosition: string;
    borderRadius: string;
    theme: string;
  };
  mediaLibraryVisible: boolean;
  heroConfig: HeroConfig;
  showMediaSections: boolean;
  carouselConfig?: CarouselConfig;
  featuresConfig?: FeatureConfig;
  pricingConfig?: PricingConfig;
  homepageCTA?: HomepageCTAConfig;
}

interface AppearanceContextType {
  config: AppearanceConfig;
  isLoading: boolean;
  isMigrating: boolean;
  migrationCompleted: boolean;
  updateConfig: (updates: Partial<AppearanceConfig>) => void;
  updateColors: (colors: Partial<AppearanceConfig['colors']>) => void;
  updateBranding: (branding: Partial<AppearanceConfig['branding']>) => void;
  updateLayout: (layout: Partial<AppearanceConfig['layout']>) => void;
  updateHeroConfig: (heroConfig: Partial<HeroConfig>) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationCompleted, setMigrationCompleted] = useState(false);
  const [config, setConfig] = useState<AppearanceConfig>({
    colors: {
      primary: '#3b82f6',
      primaryLight: '#60a5fa',
      primaryDark: '#2563eb',
      secondary: '#f1f5f9',
      success: '#10b981',
      warning: '#f59e0b',
      destructive: '#ef4444',
    },
    branding: {
      companyName: 'SaaS Template',
      logoUrl: '',
      faviconUrl: '',
      heroTitle: 'Transformez votre entreprise avec notre SaaS',
      heroSubtitle: 'Une solution complète et personnalisable pour faire évoluer votre activité',
    },
    layout: {
      headerStyle: 'default',
      footerStyle: 'complete',
      sidebarPosition: 'left',
      borderRadius: '0.5rem',
      theme: 'light',
    },
    mediaLibraryVisible: true,
    heroConfig: {
      showHero: true,
      backgroundType: 'color',
      backgroundImage: '',
      backgroundColor: '#3b82f6',
      layout: 'centered'
    },
    showMediaSections: true,
    carouselConfig: {
      autoplay: true,
      interval: 3000,
      showArrows: true,
      showDots: true,
      height: "400px",
      borderRadius: "0.5rem",
      images: []
    },
    featuresConfig: {
      title: "Fonctionnalités puissantes pour votre entreprise",
      description: "Découvrez toutes les fonctionnalités qui font de notre SaaS la solution complète pour moderniser votre entreprise.",
      ctaText: "Essayer gratuitement",
      ctaSecondary: "Voir les tarifs",
      showFeaturesSection: true,
      features: {
        customization: {
          title: "Personnalisation complète",
          description: "Thèmes, couleurs, logos personnalisables",
          icon: "Palette",
          enabled: true
        },
        security: {
          title: "Sécurité avancée",
          description: "2FA, gestion des rôles, conformité",
          icon: "Shield",
          enabled: true
        },
        multiLanguage: {
          title: "Multi-langue",
          description: "Support 4 langues, traductions complètes",
          icon: "Globe",
          enabled: true
        },
        database: {
          title: "Base de données",
          description: "MySQL, migrations, monitoring",
          icon: "Database",
          enabled: true
        },
        userManagement: {
          title: "Gestion utilisateurs",
          description: "Rôles, permissions, profils",
          icon: "Users",
          enabled: true
        },
        analytics: {
          title: "Analytics",
          description: "Tableaux de bord, rapports, métriques",
          icon: "BarChart3",
          enabled: true
        }
      }
    },
    pricingConfig: {
      showPricingPage: true,
      showPricingSection: true,
      title: "Tarifs transparents",
      description: "Choisissez le plan qui correspond à vos besoins",
      ctaText: "Commencer l'essai gratuit",
      ctaSecondary: "Voir tous les plans",
      plans: [
        {
          id: "starter",
          name: "Starter",
          price: 29,
          currency: "€",
          period: "monthly",
          description: "Parfait pour les petites équipes qui commencent",
          features: [
            { text: "Jusqu'à 10 utilisateurs", included: true },
            { text: "1 base de données", included: true },
            { text: "Support email", included: true },
            { text: "Stockage 10GB", included: true }
          ],
          ctaText: "Commencer",
          ctaLink: "/signup?plan=starter",
          highlighted: false,
          popular: false
        },
        {
          id: "pro",
          name: "Pro",
          price: 79,
          currency: "€",
          period: "monthly",
          description: "Idéal pour les entreprises en croissance",
          features: [
            { text: "Jusqu'à 100 utilisateurs", included: true },
            { text: "Bases de données illimitées", included: true },
            { text: "Support prioritaire", included: true },
            { text: "API complète", included: true },
            { text: "Stockage 100GB", included: true }
          ],
          ctaText: "Commencer",
          ctaLink: "/signup?plan=pro",
          highlighted: true,
          popular: true
        },
        {
          id: "enterprise",
          name: "Enterprise",
          price: 199,
          currency: "€",
          period: "monthly",
          description: "Solution complète pour les grandes organisations",
          features: [
            { text: "Utilisateurs illimités", included: true },
            { text: "Infrastructure dédiée", included: true },
            { text: "Support 24/7", included: true },
            { text: "Personnalisation complète", included: true },
            { text: "Stockage illimité", included: true }
          ],
          ctaText: "Nous contacter",
          ctaLink: "/contact?plan=enterprise",
          highlighted: false,
          popular: false
        }
      ],
      showFeaturesSection: true,
      featuresTitle: "Fonctionnalités incluses dans tous les plans",
      featuresDescription: "Tous nos plans incluent ces fonctionnalités essentielles",
      features: [
        {
          icon: "Shield",
          title: "Sécurité de niveau entreprise",
          description: "Chiffrement end-to-end, authentification 2FA, conformité RGPD"
        },
        {
          icon: "Zap",
          title: "Performance optimisée",
          description: "Infrastructure cloud haute disponibilité avec CDN global"
        },
        {
          icon: "Users",
          title: "Gestion d'équipe avancée",
          description: "Rôles et permissions granulaires, collaboration en temps réel"
        },
        {
          icon: "Database",
          title: "Intégration base de données",
          description: "Connexion sécurisée à vos bases MySQL existantes"
        },
        {
          icon: "Globe",
          title: "Multi-langue",
          description: "Support natif pour 4 langues avec traductions complètes"
        },
        {
          icon: "Headphones",
          title: "Support expert",
          description: "Équipe de support technique disponible selon votre plan"
        }
      ],
      showFAQSection: true,
      faqTitle: "Questions fréquentes",
      faqs: [
        {
          question: "Puis-je changer de plan à tout moment ?",
          answer: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement et les factures sont ajustées au prorata."
        },
        {
          question: "Y a-t-il des frais de configuration ?",
          answer: "Non, il n'y a aucun frais de configuration. Vous payez uniquement votre abonnement mensuel ou annuel selon le plan choisi."
        },
        {
          question: "Que se passe-t-il si je dépasse mes limites ?",
          answer: "Nous vous préviendrons avant d'atteindre vos limites. Vous pourrez alors upgrader votre plan ou nous contacter pour discuter d'une solution personnalisée."
        },
        {
          question: "Proposez-vous des remises pour les organisations ?",
          answer: "Oui, nous offrons des remises pour les organisations à but non lucratif, les établissements d'enseignement et les commandes importantes. Contactez-nous pour plus d'informations."
        }
      ],
      showFinalCTA: true,
      finalCTATitle: "Prêt à commencer ?",
      finalCTADescription: "Rejoignez des milliers d'entreprises qui font confiance à notre solution.",
      finalCTAPrimary: "Commencer l'essai gratuit",
      finalCTASecondary: "Nous contacter"
    },
    homepageCTA: {
      showCTASection: true,
      title: "Prêt à transformer votre entreprise ?",
      description: "Rejoignez des milliers d'entreprises qui font déjà confiance à notre solution SaaS.",
      primaryButtonText: "Commencer gratuitement",
      primaryButtonLink: "/register",
      secondaryButtonText: "Nous contacter",
      secondaryButtonLink: "/contact"
    }
  });

  // Fonction pour nettoyer les URLs blob invalides
  const cleanBlobUrls = (config: any) => {
    const cleaned = { ...config };
    
    // Nettoyer les URLs blob dans branding
    if (cleaned.branding) {
      if (cleaned.branding.logoUrl && cleaned.branding.logoUrl.startsWith('blob:')) {
        cleaned.branding.logoUrl = '';
        cleaned.branding.logoId = undefined;
      }
      if (cleaned.branding.faviconUrl && cleaned.branding.faviconUrl.startsWith('blob:')) {
        cleaned.branding.faviconUrl = '';
        cleaned.branding.faviconId = undefined;
      }
    }
    
    // Nettoyer les URLs blob dans heroConfig
    if (cleaned.heroConfig && cleaned.heroConfig.backgroundImage && cleaned.heroConfig.backgroundImage.startsWith('blob:')) {
      cleaned.heroConfig.backgroundImage = '';
      cleaned.heroConfig.backgroundImageId = undefined;
    }
    
    return cleaned;
  };

  // Load config from database or localStorage on mount
  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      
      try {
        if (isAuthenticated && user) {
          console.log('🔍 AppearanceContext - Chargement depuis la BDD...');
          
          // Essayer de charger depuis la base de données
          const result = await AppearanceConfigService.getConfig();
          
          if (result.success && result.config) {
            console.log('✅ AppearanceContext - Configuration chargée depuis la BDD');
            const cleanedConfig = cleanBlobUrls(result.config);
            setConfig(prev => ({ ...prev, ...cleanedConfig }));
            setMigrationCompleted(true);
          } else {
            console.log('⚠️ AppearanceContext - Pas de config en BDD, vérification localStorage...');
            
            // Si pas de config en BDD, vérifier localStorage et migrer
            if (AppearanceConfigService.hasLocalStorageConfig()) {
              const localStorageConfig = AppearanceConfigService.getLocalStorageConfig();
              if (localStorageConfig) {
                console.log('🔄 AppearanceContext - Migration depuis localStorage...');
                setIsMigrating(true);
                
                const migrationResult = await AppearanceConfigService.migrateFromLocalStorage(localStorageConfig);
                
                if (migrationResult.success) {
                  console.log('✅ AppearanceContext - Migration réussie');
                  const cleanedConfig = cleanBlobUrls(localStorageConfig);
                  setConfig(prev => ({ ...prev, ...cleanedConfig }));
                  AppearanceConfigService.clearLocalStorageConfig();
                } else {
                  console.log('❌ AppearanceContext - Migration échouée, utilisation localStorage');
                  const cleanedConfig = cleanBlobUrls(localStorageConfig);
                  setConfig(prev => ({ ...prev, ...cleanedConfig }));
                }
                
                setIsMigrating(false);
                setMigrationCompleted(true);
              }
            }
          }
        } else {
          console.log('🔍 AppearanceContext - Utilisateur non authentifié, tentative de chargement depuis la BDD (config globale)...');
          
          // Essayer de charger la configuration globale même sans authentification
          try {
            const result = await AppearanceConfigService.getGlobalConfig();
            
            if (result.success && result.config) {
              console.log('✅ AppearanceContext - Configuration globale chargée depuis la BDD');
              const cleanedConfig = cleanBlobUrls(result.config);
              setConfig(prev => ({ ...prev, ...cleanedConfig }));
            } else {
              console.log('⚠️ AppearanceContext - Pas de config globale, fallback localStorage...');
              
              // Fallback vers localStorage
              const savedConfig = localStorage.getItem('appearanceConfig');
              if (savedConfig) {
                try {
                  const parsedConfig = JSON.parse(savedConfig);
                  const cleanedConfig = cleanBlobUrls(parsedConfig);
                  setConfig(prev => ({ ...prev, ...cleanedConfig }));
                  console.log('✅ AppearanceContext - Configuration chargée depuis localStorage (fallback)');
                } catch (error) {
                  console.error('❌ AppearanceContext - Erreur lors du chargement localStorage:', error);
                }
              }
            }
          } catch (error) {
            console.error('❌ AppearanceContext - Erreur lors du chargement config globale:', error);
            
            // Fallback vers localStorage en cas d'erreur
            const savedConfig = localStorage.getItem('appearanceConfig');
            if (savedConfig) {
              try {
                const parsedConfig = JSON.parse(savedConfig);
                const cleanedConfig = cleanBlobUrls(parsedConfig);
                setConfig(prev => ({ ...prev, ...cleanedConfig }));
                console.log('✅ AppearanceContext - Configuration chargée depuis localStorage (fallback erreur)');
              } catch (parseError) {
                console.error('❌ AppearanceContext - Erreur parsing localStorage:', parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ AppearanceContext - Erreur lors du chargement:', error);
        
        // Fallback vers localStorage en cas d'erreur
        const savedConfig = localStorage.getItem('appearanceConfig');
        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            const cleanedConfig = cleanBlobUrls(parsedConfig);
            setConfig(prev => ({ ...prev, ...cleanedConfig }));
            console.log('✅ AppearanceContext - Fallback vers localStorage');
          } catch (parseError) {
            console.error('❌ AppearanceContext - Erreur parsing localStorage:', parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [isAuthenticated, user]);

  // Apply theme to DOM
  useEffect(() => {
    const { theme } = config.layout;
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [config.layout.theme]);

  // Save config to localStorage only if user is not authenticated (fallback)
  useEffect(() => {
    // Skip saving on initial load to prevent unnecessary re-renders
    if (config.layout.theme === 'light' && config.colors.primary === '#3b82f6') {
      return;
    }
    
    // Only save to localStorage if user is not authenticated (fallback mode)
    if (!isAuthenticated) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('appearanceConfig', JSON.stringify(config));
        console.log('💾 AppearanceContext - Configuration sauvegardée dans localStorage (fallback)');
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [config, isAuthenticated]);

  const updateConfig = useCallback(async (updates: Partial<AppearanceConfig>) => {
    console.log('🔍 AppearanceContext - updateConfig appelé avec:', updates);
    
    // Mettre à jour l'état local immédiatement pour l'UI
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      console.log('🔍 AppearanceContext - Nouveau config local:', newConfig);
      
      // Sauvegarder en base de données si l'utilisateur est authentifié
      if (isAuthenticated && user) {
        // Utiliser setTimeout pour éviter les problèmes de timing
        setTimeout(async () => {
          try {
            const result = await AppearanceConfigService.saveConfig(newConfig as ServiceAppearanceConfig);
            
            if (result.success) {
              console.log('✅ AppearanceContext - Configuration sauvegardée en BDD:', result.configId);
            } else {
              console.error('❌ AppearanceContext - Erreur lors de la sauvegarde:', result.message);
            }
          } catch (error) {
            console.error('❌ AppearanceContext - Erreur lors de la sauvegarde:', error);
          }
        }, 100);
      }
      
      return newConfig;
    });
  }, [isAuthenticated, user]);

  const updateColors = useCallback((colors: Partial<AppearanceConfig['colors']>) => {
    setConfig(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colors }
    }));
  }, []);

  const updateBranding = useCallback((branding: Partial<AppearanceConfig['branding']>) => {
    console.log('🔍 AppearanceContext - updateBranding appelé:', branding);
    
    // Mettre à jour l'état local
    setConfig(prev => {
      const newConfig = {
        ...prev,
        branding: { ...prev.branding, ...branding }
      };
      console.log('🔍 AppearanceContext - Nouveau branding:', newConfig.branding);
      
      // Sauvegarder automatiquement en base de données
      if (isAuthenticated && user) {
        setTimeout(() => {
          updateConfig(newConfig);
        }, 100);
      }
      
      return newConfig;
    });
  }, [isAuthenticated, user, updateConfig]);

  const updateLayout = useCallback((layout: Partial<AppearanceConfig['layout']>) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        layout: { ...prev.layout, ...layout }
      };
      
      // Sauvegarder automatiquement en base de données
      if (isAuthenticated && user) {
        setTimeout(() => {
          updateConfig(newConfig);
        }, 100);
      }
      
      return newConfig;
    });
  }, [isAuthenticated, user, updateConfig]);

  const updateHeroConfig = useCallback((heroConfig: Partial<HeroConfig>) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        heroConfig: { ...prev.heroConfig, ...heroConfig }
      };
      
      // Sauvegarder automatiquement en base de données
      if (isAuthenticated && user) {
        setTimeout(() => {
          updateConfig(newConfig);
        }, 100);
      }
      
      return newConfig;
    });
  }, [isAuthenticated, user, updateConfig]);

  const contextValue = useMemo(() => ({
    config,
    isLoading,
    isMigrating,
    migrationCompleted,
    updateConfig,
    updateColors,
    updateBranding,
    updateLayout,
    updateHeroConfig
  }), [config, isLoading, isMigrating, migrationCompleted, updateConfig, updateColors, updateBranding, updateLayout, updateHeroConfig]);

  return (
    <AppearanceContext.Provider value={contextValue}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
};