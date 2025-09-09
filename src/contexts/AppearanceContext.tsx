import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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

  // Save config to localStorage whenever it changes (debounced)
  useEffect(() => {
    // Skip saving on initial load to prevent unnecessary re-renders
    if (config.layout.theme === 'light' && config.colors.primary === '#3b82f6') {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem('appearanceConfig', JSON.stringify(config));
    }, 500); // Increased debounce time
    
    return () => clearTimeout(timeoutId);
  }, [config]);

  const updateConfig = useCallback((updates: Partial<AppearanceConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const updateColors = useCallback((colors: Partial<AppearanceConfig['colors']>) => {
    setConfig(prev => ({
      ...prev,
      colors: { ...prev.colors, ...colors }
    }));
  }, []);

  const updateBranding = useCallback((branding: Partial<AppearanceConfig['branding']>) => {
    setConfig(prev => ({
      ...prev,
      branding: { ...prev.branding, ...branding }
    }));
  }, []);

  const updateLayout = useCallback((layout: Partial<AppearanceConfig['layout']>) => {
    setConfig(prev => ({
      ...prev,
      layout: { ...prev.layout, ...layout }
    }));
  }, []);

  const updateHeroConfig = useCallback((heroConfig: Partial<HeroConfig>) => {
    setConfig(prev => ({
      ...prev,
      heroConfig: { ...prev.heroConfig, ...heroConfig }
    }));
  }, []);

  const contextValue = useMemo(() => ({
    config,
    updateConfig,
    updateColors,
    updateBranding,
    updateLayout,
    updateHeroConfig
  }), [config, updateConfig, updateColors, updateBranding, updateLayout, updateHeroConfig]);

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