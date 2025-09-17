// ===================================================================
// SERVICE POUR LA GESTION DES CONFIGURATIONS ADMINISTRATEUR
// Service pour sauvegarder et charger les configurations depuis PostgreSQL
// ===================================================================

import { useToast } from '@/hooks/use-toast';

// Types pour les configurations
export interface DatabaseConfig {
  id?: string;
  db_type: 'mysql' | 'postgresql';
  host: string;
  port: number;
  database_name: string;
  username: string;
  password: string;
  ssl_enabled: boolean;
  ssl_verify_cert: boolean;
  charset: string;
  schema_name?: string;
  timezone?: string;
  extensions?: string[];
  max_connections: number;
  connection_timeout: number;
  query_timeout: number;
  is_active: boolean;
  last_tested_at?: string;
  test_status?: 'success' | 'error' | 'never_tested';
  test_message?: string;
}

export interface ChatbotConfig {
  id?: string;
  enabled: boolean;
  api_key: string;
  welcome_message: string;
  max_messages: number;
  response_delay: number;
  language: string;
  personality: string;
  context_memory: boolean;
  context_duration: number;
  auto_respond: boolean;
  business_hours_only: boolean;
  business_hours: {
    start: string;
    end: string;
    timezone: string;
  };
  fallback_message: string;
  appearance: {
    position: string;
    theme: string;
    primary_color: string;
    show_avatar: boolean;
    show_typing: boolean;
  };
  behavior: {
    greeting_delay: number;
    auto_open: boolean;
    persistent: boolean;
    sound_enabled: boolean;
  };
  analytics: {
    track_conversations: boolean;
    track_satisfaction: boolean;
    export_data: boolean;
  };
}

export interface SystemConfig {
  id?: string;
  general: {
    app_name: string;
    app_url: string;
    support_email: string;
    maintenance_mode: boolean;
    debug_mode: boolean;
    log_level: string;
  };
  performance: {
    max_file_size_mb: number;
    max_users: number;
    cache_enabled: boolean;
    cache_ttl: number;
  };
  backup: {
    enabled: boolean;
    frequency: string;
    retention_days: number;
    encrypted: boolean;
    cloud_storage: boolean;
  };
  monitoring: {
    health_checks: boolean;
    metrics_collection: boolean;
    alerting: boolean;
    uptime_monitoring: boolean;
  };
  integrations: {
    stripe_enabled: boolean;
    analytics_enabled: boolean;
    webhooks_enabled: boolean;
    api_enabled: boolean;
  };
}

export interface SecurityConfig {
  id?: string;
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
    max_age_days: number;
    prevent_reuse: number;
  };
  two_factor: {
    enabled: boolean;
    required_for_admin: boolean;
    required_for_users: boolean;
    backup_codes: boolean;
  };
  session_management: {
    timeout_minutes: number;
    max_concurrent: number;
    remember_me_days: number;
    secure_cookies: boolean;
  };
  login_security: {
    max_attempts: number;
    lockout_duration: number;
    ip_whitelist: string[];
    geo_restrictions: boolean;
  };
  api_security: {
    rate_limit_per_hour: number;
    require_api_key: boolean;
    cors_enabled: boolean;
    allowed_origins: string[];
  };
  audit_logging: {
    enabled: boolean;
    retention_days: number;
    log_failed_attempts: boolean;
    log_admin_actions: boolean;
  };
}

export interface MailingConfig {
  id?: string;
  enabled: boolean;
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  smtp_config: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
    from_name: string;
    from_email: string;
  };
  api_config: {
    api_key: string;
    domain: string;
    region: string;
  };
  rate_limits: {
    emails_per_hour: number;
    emails_per_day: number;
    burst_limit: number;
  };
  templates: {
    welcome: boolean;
    password_reset: boolean;
    invoice: boolean;
    newsletter: boolean;
  };
  tracking: {
    open_tracking: boolean;
    click_tracking: boolean;
    unsubscribe_tracking: boolean;
  };
  compliance: {
    gdpr_compliant: boolean;
    can_spam_compliant: boolean;
    unsubscribe_required: boolean;
  };
}

export interface AppearanceConfig {
  id?: string;
  theme: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    border_color: string;
  };
  branding: {
    logo_url: string;
    favicon_url: string;
    company_name: string;
    tagline: string;
    show_branding: boolean;
  };
  layout: {
    sidebar_collapsed: boolean;
    header_style: string;
    footer_enabled: boolean;
    breadcrumbs_enabled: boolean;
  };
  customization: {
    custom_css: string;
    custom_js: string;
    fonts: {
      primary: string;
      secondary: string;
    };
  };
}

export interface LegalConfig {
  id?: string;
  terms_of_service: {
    enabled: boolean;
    version: string;
    last_updated: string | null;
    require_acceptance: boolean;
  };
  privacy_policy: {
    enabled: boolean;
    version: string;
    last_updated: string | null;
    gdpr_compliant: boolean;
  };
  cookie_policy: {
    enabled: boolean;
    version: string;
    last_updated: string | null;
    banner_enabled: boolean;
  };
  legal_notice: {
    enabled: boolean;
    version: string;
    last_updated: string | null;
    company_info: Record<string, any>;
  };
  compliance: {
    gdpr_enabled: boolean;
    ccpa_enabled: boolean;
    data_retention_days: number;
    right_to_deletion: boolean;
  };
}

export interface CommunityConfig {
  id?: string;
  general: {
    enabled: boolean;
    public_registration: boolean;
    moderation_enabled: boolean;
    auto_approve_posts: boolean;
  };
  features: {
    posts_enabled: boolean;
    comments_enabled: boolean;
    reactions_enabled: boolean;
    media_sharing: boolean;
    user_profiles: boolean;
  };
  moderation: {
    auto_moderation: boolean;
    profanity_filter: boolean;
    spam_protection: boolean;
    report_system: boolean;
  };
  limits: {
    max_posts_per_day: number;
    max_comments_per_post: number;
    max_file_size_mb: number;
    max_communities_per_user: number;
  };
}

export interface AnalyticsConfig {
  id?: string;
  tracking: {
    enabled: boolean;
    google_analytics_id: string;
    facebook_pixel_id: string;
    custom_tracking: boolean;
  };
  metrics: {
    user_behavior: boolean;
    performance_metrics: boolean;
    business_metrics: boolean;
    error_tracking: boolean;
  };
  reporting: {
    daily_reports: boolean;
    weekly_reports: boolean;
    monthly_reports: boolean;
    custom_dashboards: boolean;
  };
  privacy: {
    anonymize_ip: boolean;
    respect_dnt: boolean;
    cookie_consent: boolean;
    data_retention_days: number;
  };
}

// Configuration de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003/api';

// Fonction utilitaire pour chiffrer les données sensibles
const encryptSensitiveData = (data: string): string => {
  // En production, utilisez une vraie méthode de chiffrement
  // Pour le développement, on encode simplement en base64
  return btoa(data);
};

// Fonction utilitaire pour déchiffrer les données sensibles
const decryptSensitiveData = (encryptedData: string): string => {
  // En production, utilisez la vraie méthode de déchiffrement
  // Pour le développement, on décode simplement du base64
  try {
    return atob(encryptedData);
  } catch {
    return encryptedData;
  }
};

// Service pour les configurations de base de données
export const databaseConfigService = {
  // Charger la configuration de base de données
  async load(): Promise<DatabaseConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/database`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      const data = await response.json();
      
      // Déchiffrer le mot de passe
      if (data.password_encrypted) {
        data.password = decryptSensitiveData(data.password_encrypted);
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration DB:', error);
      return null;
    }
  },

  // Sauvegarder la configuration de base de données
  async save(config: DatabaseConfig): Promise<boolean> {
    try {
      // Chiffrer le mot de passe avant l'envoi
      const configToSave = {
        ...config,
        password_encrypted: encryptSensitiveData(config.password),
        password: undefined // Ne pas envoyer le mot de passe en clair
      };

      const response = await fetch(`${API_BASE_URL}/admin/config/database`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration DB:', error);
      return false;
    }
  },

  // Tester la connexion à la base de données
  async testConnection(config: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    try {
      const configToTest = {
        ...config,
        password_encrypted: encryptSensitiveData(config.password),
        password: undefined
      };

      const response = await fetch(`${API_BASE_URL}/admin/config/database/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToTest),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      return { success: false, message: 'Erreur lors du test de connexion' };
    }
  }
};

// Service pour les configurations du chatbot
export const chatbotConfigService = {
  async load(): Promise<ChatbotConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/chatbot`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      const data = await response.json();
      
      // Déchiffrer la clé API
      if (data.api_key_encrypted) {
        data.api_key = decryptSensitiveData(data.api_key_encrypted);
      }
      
      return data;
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

      const response = await fetch(`${API_BASE_URL}/admin/config/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration chatbot:', error);
      return false;
    }
  }
};

// Service pour les configurations système
export const systemConfigService = {
  async load(): Promise<SystemConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/system`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration système:', error);
      return null;
    }
  },

  async save(config: SystemConfig): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration système:', error);
      return false;
    }
  }
};

// Service pour les configurations de sécurité
export const securityConfigService = {
  async load(): Promise<SecurityConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/security`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration sécurité:', error);
      return null;
    }
  },

  async save(config: SecurityConfig): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/security`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration sécurité:', error);
      return false;
    }
  }
};

// Service pour les configurations de mailing
export const mailingConfigService = {
  async load(): Promise<MailingConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/mailing`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      const data = await response.json();
      
      // Déchiffrer les mots de passe
      if (data.smtp_config?.password_encrypted) {
        data.smtp_config.password = decryptSensitiveData(data.smtp_config.password_encrypted);
      }
      if (data.api_config?.api_key_encrypted) {
        data.api_config.api_key = decryptSensitiveData(data.api_config.api_key_encrypted);
      }
      
      return data;
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

      const response = await fetch(`${API_BASE_URL}/admin/config/mailing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration mailing:', error);
      return false;
    }
  }
};

// Service pour les configurations d'apparence
export const appearanceConfigService = {
  async load(): Promise<AppearanceConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/appearance`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration apparence:', error);
      return null;
    }
  },

  async save(config: AppearanceConfig): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/appearance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration apparence:', error);
      return false;
    }
  }
};

// Service pour les configurations légales
export const legalConfigService = {
  async load(): Promise<LegalConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/legal`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration légale:', error);
      return null;
    }
  },

  async save(config: LegalConfig): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/legal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration légale:', error);
      return false;
    }
  }
};

// Service pour les configurations de communauté
export const communityConfigService = {
  async load(): Promise<CommunityConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/community`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration communauté:', error);
      return null;
    }
  },

  async save(config: CommunityConfig): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration communauté:', error);
      return false;
    }
  }
};

// Service pour les configurations d'analytics
export const analyticsConfigService = {
  async load(): Promise<AnalyticsConfig | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/analytics`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de la configuration');
      }
      return await response.json();
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration analytics:', error);
      return null;
    }
  },

  async save(config: AnalyticsConfig): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/config/analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde de la configuration');
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration analytics:', error);
      return false;
    }
  }
};

// Hook personnalisé pour gérer les configurations avec toast
export const useAdminConfig = () => {
  const { toast } = useToast();

  const showSuccessToast = (message: string) => {
    toast({
      title: "Configuration sauvegardée",
      description: message,
    });
  };

  const showErrorToast = (message: string) => {
    toast({
      title: "Erreur",
      description: message,
      variant: "destructive",
    });
  };

  return {
    showSuccessToast,
    showErrorToast,
    databaseConfigService,
    chatbotConfigService,
    systemConfigService,
    securityConfigService,
    mailingConfigService,
    appearanceConfigService,
    legalConfigService,
    communityConfigService,
    analyticsConfigService,
  };
};
