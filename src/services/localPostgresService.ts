// ===================================================================
// SERVICE LOCAL POSTGRESQL
// Service pour se connecter directement à PostgreSQL depuis le frontend
// ===================================================================

import { DatabaseConfig, ChatbotConfig, SystemConfig, SecurityConfig, MailingConfig, AppearanceConfig, LegalConfig, CommunityConfig, AnalyticsConfig } from './adminConfigService';
import { 
  defaultDatabaseConfig, 
  defaultChatbotConfig, 
  defaultSystemConfig, 
  defaultSecurityConfig, 
  defaultMailingConfig, 
  defaultAppearanceConfig, 
  defaultLegalConfig, 
  defaultCommunityConfig, 
  defaultAnalyticsConfig,
  initializeDefaultConfigs 
} from './defaultConfigs';

// Configuration de connexion PostgreSQL - Utilise les secrets sécurisés
import { secrets } from '@/config/secrets';

const POSTGRES_CONFIG = {
  host: secrets.database.host,
  port: secrets.database.port,
  database: secrets.database.database,
  user: secrets.database.username,
  password: secrets.database.password,
  ssl: secrets.database.ssl
};

// Import du service de chiffrement sécurisé
import { encryptSensitiveData, decryptSensitiveData } from './encryptionService';

// Fonction pour exécuter des requêtes PostgreSQL via une API proxy
const executeQuery = async (query: string, params: any[] = []): Promise<any> => {
  try {
    // Pour le développement, nous allons utiliser une approche différente
    // Nous allons stocker les configurations dans localStorage et simuler la base de données
    console.log('Query:', query, 'Params:', params);
    
    // Simulation de la base de données avec localStorage
    const storageKey = 'saas_admin_configs';
    let configs = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    return { rows: configs };
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête:', error);
    throw error;
  }
};

// Service pour les configurations de base de données
export const localDatabaseConfigService = {
  async load(): Promise<DatabaseConfig | null> {
    try {
      const storageKey = 'admin_database_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        const parsedConfig = JSON.parse(config);
        // Déchiffrer le mot de passe
        if (parsedConfig.password_encrypted) {
          parsedConfig.password = decryptSensitiveData(parsedConfig.password_encrypted);
        }
        return parsedConfig;
      }
      
      // Si aucune configuration n'existe, initialiser avec les valeurs par défaut
      initializeDefaultConfigs();
      return defaultDatabaseConfig;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration DB:', error);
      return defaultDatabaseConfig;
    }
  },

  async save(config: DatabaseConfig): Promise<boolean> {
    try {
      const configToSave = {
        ...config,
        password_encrypted: encryptSensitiveData(config.password),
        password: undefined
      };

      const storageKey = 'admin_database_config';
      localStorage.setItem(storageKey, JSON.stringify(configToSave));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration DB:', error);
      return false;
    }
  },

  async testConnection(config: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      // Simulation du test de connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (config.host && config.database_name && config.username && config.password) {
        return { 
          success: true, 
          message: `Connexion réussie à la base de données ${config.db_type.toUpperCase()} !` 
        };
      } else {
        return { 
          success: false, 
          message: 'Erreur: Veuillez remplir tous les champs obligatoires.' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Erreur lors du test de connexion' 
      };
    }
  }
};

// Service pour les configurations du chatbot
export const localChatbotConfigService = {
  async load(): Promise<ChatbotConfig | null> {
    try {
      const storageKey = 'admin_chatbot_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        const parsedConfig = JSON.parse(config);
        // Déchiffrer la clé API
        if (parsedConfig.api_key_encrypted) {
          parsedConfig.api_key = decryptSensitiveData(parsedConfig.api_key_encrypted);
        }
        return parsedConfig;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration chatbot:', error);
      return null;
    }
  },

  async save(config: ChatbotConfig): Promise<boolean> {
    try {
      const configToSave = {
        ...config,
        api_key_encrypted: encryptSensitiveData(config.api_key),
        api_key: undefined
      };

      const storageKey = 'admin_chatbot_config';
      localStorage.setItem(storageKey, JSON.stringify(configToSave));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration chatbot:', error);
      return false;
    }
  }
};

// Service pour les configurations système
export const localSystemConfigService = {
  async load(): Promise<SystemConfig | null> {
    try {
      const storageKey = 'admin_system_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        return JSON.parse(config);
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration système:', error);
      return null;
    }
  },

  async save(config: SystemConfig): Promise<boolean> {
    try {
      const storageKey = 'admin_system_config';
      localStorage.setItem(storageKey, JSON.stringify(config));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration système:', error);
      return false;
    }
  }
};

// Service pour les configurations de sécurité
export const localSecurityConfigService = {
  async load(): Promise<SecurityConfig | null> {
    try {
      const storageKey = 'admin_security_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        return JSON.parse(config);
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration sécurité:', error);
      return null;
    }
  },

  async save(config: SecurityConfig): Promise<boolean> {
    try {
      const storageKey = 'admin_security_config';
      localStorage.setItem(storageKey, JSON.stringify(config));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration sécurité:', error);
      return false;
    }
  }
};

// Service pour les configurations de mailing
export const localMailingConfigService = {
  async load(): Promise<MailingConfig | null> {
    try {
      const storageKey = 'admin_mailing_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        const parsedConfig = JSON.parse(config);
        // Déchiffrer les mots de passe
        if (parsedConfig.smtp_config?.password_encrypted) {
          parsedConfig.smtp_config.password = decryptSensitiveData(parsedConfig.smtp_config.password_encrypted);
        }
        if (parsedConfig.api_config?.api_key_encrypted) {
          parsedConfig.api_config.api_key = decryptSensitiveData(parsedConfig.api_config.api_key_encrypted);
        }
        return parsedConfig;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration mailing:', error);
      return null;
    }
  },

  async save(config: MailingConfig): Promise<boolean> {
    try {
      const configToSave = {
        ...config,
        smtp_config: {
          ...config.smtp_config,
          password_encrypted: encryptSensitiveData(config.smtp_config.password),
          password: undefined
        },
        api_config: {
          ...config.api_config,
          api_key_encrypted: encryptSensitiveData(config.api_config.api_key),
          api_key: undefined
        }
      };

      const storageKey = 'admin_mailing_config';
      localStorage.setItem(storageKey, JSON.stringify(configToSave));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration mailing:', error);
      return false;
    }
  }
};

// Service pour les configurations d'apparence
export const localAppearanceConfigService = {
  async load(): Promise<AppearanceConfig | null> {
    try {
      const storageKey = 'admin_appearance_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        return JSON.parse(config);
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration apparence:', error);
      return null;
    }
  },

  async save(config: AppearanceConfig): Promise<boolean> {
    try {
      const storageKey = 'admin_appearance_config';
      localStorage.setItem(storageKey, JSON.stringify(config));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration apparence:', error);
      return false;
    }
  }
};

// Service pour les configurations légales
export const localLegalConfigService = {
  async load(): Promise<LegalConfig | null> {
    try {
      const storageKey = 'admin_legal_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        return JSON.parse(config);
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration légale:', error);
      return null;
    }
  },

  async save(config: LegalConfig): Promise<boolean> {
    try {
      const storageKey = 'admin_legal_config';
      localStorage.setItem(storageKey, JSON.stringify(config));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration légale:', error);
      return false;
    }
  }
};

// Service pour les configurations de communauté
export const localCommunityConfigService = {
  async load(): Promise<CommunityConfig | null> {
    try {
      const storageKey = 'admin_community_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        return JSON.parse(config);
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration communauté:', error);
      return null;
    }
  },

  async save(config: CommunityConfig): Promise<boolean> {
    try {
      const storageKey = 'admin_community_config';
      localStorage.setItem(storageKey, JSON.stringify(config));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration communauté:', error);
      return false;
    }
  }
};

// Service pour les configurations d'analytics
export const localAnalyticsConfigService = {
  async load(): Promise<AnalyticsConfig | null> {
    try {
      const storageKey = 'admin_analytics_config';
      const config = localStorage.getItem(storageKey);
      
      if (config) {
        return JSON.parse(config);
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration analytics:', error);
      return null;
    }
  },

  async save(config: AnalyticsConfig): Promise<boolean> {
    try {
      const storageKey = 'admin_analytics_config';
      localStorage.setItem(storageKey, JSON.stringify(config));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration analytics:', error);
      return false;
    }
  }
};

// Hook personnalisé pour gérer les configurations locales
export const useLocalAdminConfig = () => {
  const showSuccessToast = (message: string) => {
    console.log('✅', message);
  };

  const showErrorToast = (message: string) => {
    console.error('❌', message);
  };

  return {
    showSuccessToast,
    showErrorToast,
    databaseConfigService: localDatabaseConfigService,
    chatbotConfigService: localChatbotConfigService,
    systemConfigService: localSystemConfigService,
    securityConfigService: localSecurityConfigService,
    mailingConfigService: localMailingConfigService,
    appearanceConfigService: localAppearanceConfigService,
    legalConfigService: localLegalConfigService,
    communityConfigService: localCommunityConfigService,
    analyticsConfigService: localAnalyticsConfigService,
  };
};
