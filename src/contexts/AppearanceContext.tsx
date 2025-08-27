import React, { createContext, useContext, useState, useEffect } from 'react';

export interface HeroConfig {
  showHero: boolean;
  backgroundType: 'color' | 'image';
  backgroundImage: string;
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
    faviconUrl: string;
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
}

interface AppearanceContextType {
  config: AppearanceConfig;
  updateConfig: (updates: Partial<AppearanceConfig>) => void;
  updateColors: (colors: Partial<AppearanceConfig['colors']>) => void;
  updateBranding: (branding: Partial<AppearanceConfig['branding']>) => void;
  updateLayout: (layout: Partial<AppearanceConfig['layout']>) => void;
  updateHeroConfig: (heroConfig: Partial<HeroConfig>) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    }
  });

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('appearanceConfig');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error('Error loading appearance config:', error);
      }
    }
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appearanceConfig', JSON.stringify(config));
  }, [config]);

  const updateConfig = (updates: Partial<AppearanceConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const updateColors = (colors: Partial<AppearanceConfig['colors']>) => {
    setConfig(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colors }
    }));
  };

  const updateBranding = (branding: Partial<AppearanceConfig['branding']>) => {
    setConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, ...branding }
    }));
  };

  const updateLayout = (layout: Partial<AppearanceConfig['layout']>) => {
    setConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, ...layout }
    }));
  };

  const updateHeroConfig = (heroConfig: Partial<HeroConfig>) => {
    setConfig(prev => ({
      ...prev,
      heroConfig: { ...prev.heroConfig, ...heroConfig }
    }));
  };

  return (
    <AppearanceContext.Provider value={{
      config,
      updateConfig,
      updateColors,
      updateBranding,
      updateLayout,
      updateHeroConfig
    }}>
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