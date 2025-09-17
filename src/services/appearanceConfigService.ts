import { apiClient } from './index';

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
  heroConfig: {
    showHero: boolean;
    backgroundType: 'color' | 'image';
    backgroundImage: string;
    backgroundColor: string;
    layout: 'centered' | 'left' | 'right';
  };
  featuresConfig?: {
    title?: string;
    description?: string;
    ctaText?: string;
    ctaSecondary?: string;
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
  };
}

export interface ConfigHistoryItem {
  id: number;
  config_type: string;
  config_data: AppearanceConfig;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

class AppearanceConfigService {
  // Récupérer la configuration globale (publique)
  static async getGlobalConfig(): Promise<{ success: boolean; config?: AppearanceConfig; message?: string }> {
    try {
      console.log('🔍 AppearanceConfigService - Récupération de la configuration globale...');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/appearance/global-config`);
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ AppearanceConfigService - Configuration globale récupérée:', data.config);
        return {
          success: true,
          config: data.config as AppearanceConfig,
        };
      } else {
        console.log('❌ AppearanceConfigService - Erreur:', data.message);
        return {
          success: false,
          message: data.message || 'Erreur lors de la récupération de la configuration globale',
        };
      }
    } catch (error: any) {
      console.error('❌ AppearanceConfigService - Erreur lors de la récupération globale:', error);
      return {
        success: false,
        message: error.message || 'Erreur réseau lors de la récupération de la configuration globale',
        error: error
      };
    }
  }

  // Récupérer la configuration d'apparence depuis la base de données
  static async getConfig(): Promise<{ success: boolean; config?: AppearanceConfig; message?: string }> {
    try {
      console.log('🔍 AppearanceConfigService - Récupération de la configuration depuis la BDD...');
      
      const response = await apiClient.get('/appearance/config');
      
      console.log('🔍 AppearanceConfigService - Réponse complète:', response);
      console.log('🔍 AppearanceConfigService - response:', response);
      
      if (response && response.success) {
        console.log('✅ AppearanceConfigService - Configuration récupérée depuis la BDD:', response.config);
        return {
          success: true,
          config: response.config
        };
      } else {
        console.log('❌ AppearanceConfigService - Erreur:', response.message);
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error: any) {
      console.error('❌ AppearanceConfigService - Erreur lors de la récupération:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération de la configuration'
      };
    }
  }

  // Sauvegarder la configuration d'apparence dans la base de données
  static async saveConfig(config: AppearanceConfig): Promise<{ success: boolean; message?: string; configId?: number }> {
    try {
      console.log('🔍 AppearanceConfigService - Sauvegarde de la configuration vers la BDD...', config);
      
      const response = await apiClient.post('/appearance/config', config);
      
      if (response.success) {
        console.log('✅ AppearanceConfigService - Configuration sauvegardée en BDD:', response.configId);
        return {
          success: true,
          message: response.message,
          configId: response.configId
        };
      } else {
        console.log('❌ AppearanceConfigService - Erreur lors de la sauvegarde:', response.message);
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error: any) {
      console.error('❌ AppearanceConfigService - Erreur lors de la sauvegarde:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la sauvegarde de la configuration'
      };
    }
  }

  // Migrer depuis localStorage vers la base de données
  static async migrateFromLocalStorage(localStorageConfig: AppearanceConfig): Promise<{ success: boolean; message?: string; configId?: number }> {
    try {
      console.log('🔍 AppearanceConfigService - Migration depuis localStorage vers la BDD...', localStorageConfig);
      
      const response = await apiClient.post('/appearance/migrate', localStorageConfig);
      
      console.log('🔍 AppearanceConfigService - Réponse migration complète:', response);
      console.log('🔍 AppearanceConfigService - response migration:', response);
      
      if (response && response.success) {
        console.log('✅ AppearanceConfigService - Migration réussie:', response.configId);
        return {
          success: true,
          message: response.message,
          configId: response.configId
        };
      } else {
        console.log('❌ AppearanceConfigService - Erreur lors de la migration:', response.message);
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error: any) {
      console.error('❌ AppearanceConfigService - Erreur lors de la migration:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la migration de la configuration'
      };
    }
  }

  // Récupérer l'historique des configurations
  static async getConfigHistory(limit: number = 10): Promise<{ success: boolean; history?: ConfigHistoryItem[]; message?: string }> {
    try {
      console.log('🔍 AppearanceConfigService - Récupération de l\'historique...');
      
      const response = await apiClient.get(`/appearance/history?limit=${limit}`);
      
      if (response.success) {
        console.log('✅ AppearanceConfigService - Historique récupéré:', response.history?.length, 'éléments');
        return {
          success: true,
          history: response.history
        };
      } else {
        console.log('❌ AppearanceConfigService - Erreur lors de la récupération de l\'historique:', response.message);
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error: any) {
      console.error('❌ AppearanceConfigService - Erreur lors de la récupération de l\'historique:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération de l\'historique'
      };
    }
  }

  // Vérifier si une configuration existe dans localStorage
  static hasLocalStorageConfig(): boolean {
    const config = localStorage.getItem('appearanceConfig');
    return config !== null && config !== '{}';
  }

  // Récupérer la configuration depuis localStorage
  static getLocalStorageConfig(): AppearanceConfig | null {
    try {
      const config = localStorage.getItem('appearanceConfig');
      if (config) {
        return JSON.parse(config);
      }
      return null;
    } catch (error) {
      console.error('❌ AppearanceConfigService - Erreur lors de la lecture du localStorage:', error);
      return null;
    }
  }

  // Supprimer la configuration du localStorage après migration
  static clearLocalStorageConfig(): void {
    try {
      localStorage.removeItem('appearanceConfig');
      console.log('✅ AppearanceConfigService - Configuration supprimée du localStorage');
    } catch (error) {
      console.error('❌ AppearanceConfigService - Erreur lors de la suppression du localStorage:', error);
    }
  }
}

export default AppearanceConfigService;
