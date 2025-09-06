// ===================================================================
// CONFIGURATIONS PAR DÉFAUT
// Fichier contenant toutes les configurations par défaut de l'application
// ===================================================================

import { DatabaseConfig, ChatbotConfig, SystemConfig, SecurityConfig, MailingConfig, AppearanceConfig, LegalConfig, CommunityConfig, AnalyticsConfig } from './adminConfigService';

// Configuration par défaut de la base de données - Utilise les secrets sécurisés
import { secrets } from '@/config/secrets';

export const defaultDatabaseConfig: DatabaseConfig = {
  db_type: 'postgresql',
  host: secrets.database.host,
  port: secrets.database.port,
  database_name: secrets.database.database,
  username: secrets.database.username,
  password: secrets.database.password,
  ssl_enabled: secrets.database.ssl,
  ssl_verify_cert: true,
  charset: 'UTF8',
  schema_name: 'public',
  timezone: 'UTC',
  extensions: ['uuid-ossp', 'pg_trgm'],
  max_connections: 50,
  connection_timeout: 30,
  query_timeout: 60,
  is_active: true,
  test_status: 'never_tested',
  test_message: ''
};

// Configuration par défaut du chatbot
export const defaultChatbotConfig: ChatbotConfig = {
  enabled: true,
  api_key: '',
  welcome_message: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
  max_messages: 50,
  response_delay: 1000,
  language: 'fr',
  personality: 'helpful',
  context_memory: true,
  context_duration: 30,
  auto_respond: false,
  business_hours_only: false,
  business_hours: {
    start: '09:00',
    end: '18:00',
    timezone: 'Europe/Paris'
  },
  fallback_message: 'Je ne suis pas disponible pour le moment.',
  appearance: {
    position: 'bottom-right',
    theme: 'light',
    primary_color: '#3b82f6',
    show_avatar: true,
    show_typing: true
  },
  behavior: {
    greeting_delay: 5000,
    auto_open: false,
    persistent: true,
    sound_enabled: true
  },
  analytics: {
    track_conversations: true,
    track_satisfaction: true,
    export_data: false
  }
};

// Configuration par défaut du système
export const defaultSystemConfig: SystemConfig = {
  general: {
    app_name: 'SaaS Configurator Suite',
    app_url: 'https://example.com',
    support_email: 'support@example.com',
    maintenance_mode: false,
    debug_mode: false,
    log_level: 'info'
  },
  performance: {
    max_file_size_mb: 100,
    max_users: 5000,
    cache_enabled: true,
    cache_ttl: 3600
  },
  backup: {
    enabled: true,
    frequency: 'daily',
    retention_days: 30,
    encrypted: true,
    cloud_storage: false
  },
  monitoring: {
    health_checks: true,
    metrics_collection: true,
    alerting: true,
    uptime_monitoring: true
  },
  integrations: {
    stripe_enabled: false,
    analytics_enabled: true,
    webhooks_enabled: true,
    api_enabled: true
  }
};

// Configuration par défaut de la sécurité
export const defaultSecurityConfig: SecurityConfig = {
  password_policy: {
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_symbols: true,
    max_age_days: 90,
    prevent_reuse: 5
  },
  two_factor: {
    enabled: false,
    required_for_admin: true,
    required_for_users: false,
    backup_codes: true
  },
  session_management: {
    timeout_minutes: 60,
    max_concurrent: 3,
    remember_me_days: 30,
    secure_cookies: true
  },
  login_security: {
    max_attempts: 5,
    lockout_duration: 15,
    ip_whitelist: [],
    geo_restrictions: false
  },
  api_security: {
    rate_limit_per_hour: 1000,
    require_api_key: true,
    cors_enabled: true,
    allowed_origins: []
  },
  audit_logging: {
    enabled: true,
    retention_days: 365,
    log_failed_attempts: true,
    log_admin_actions: true
  }
};

// Configuration par défaut du mailing
export const defaultMailingConfig: MailingConfig = {
  enabled: true,
  provider: 'smtp',
  smtp_config: {
    host: '',
    port: 587,
    secure: false,
    username: '',
    password: '',
    from_name: '',
    from_email: ''
  },
  api_config: {
    api_key: '',
    domain: '',
    region: ''
  },
  rate_limits: {
    emails_per_hour: 1000,
    emails_per_day: 10000,
    burst_limit: 100
  },
  templates: {
    welcome: true,
    password_reset: true,
    invoice: true,
    newsletter: true
  },
  tracking: {
    open_tracking: true,
    click_tracking: true,
    unsubscribe_tracking: true
  },
  compliance: {
    gdpr_compliant: true,
    can_spam_compliant: true,
    unsubscribe_required: true
  }
};

// Configuration par défaut de l'apparence
export const defaultAppearanceConfig: AppearanceConfig = {
  theme: {
    primary_color: '#3b82f6',
    secondary_color: '#64748b',
    accent_color: '#f59e0b',
    background_color: '#ffffff',
    text_color: '#1f2937',
    border_color: '#e5e7eb'
  },
  branding: {
    logo_url: '',
    favicon_url: '',
    company_name: '',
    tagline: '',
    show_branding: true
  },
  layout: {
    sidebar_collapsed: false,
    header_style: 'default',
    footer_enabled: true,
    breadcrumbs_enabled: true
  },
  customization: {
    custom_css: '',
    custom_js: '',
    fonts: {
      primary: 'Inter',
      secondary: 'Roboto'
    }
  }
};

// Configuration par défaut des aspects légaux
export const defaultLegalConfig: LegalConfig = {
  terms_of_service: {
    enabled: true,
    version: '1.0',
    last_updated: null,
    require_acceptance: true
  },
  privacy_policy: {
    enabled: true,
    version: '1.0',
    last_updated: null,
    gdpr_compliant: true
  },
  cookie_policy: {
    enabled: true,
    version: '1.0',
    last_updated: null,
    banner_enabled: true
  },
  legal_notice: {
    enabled: true,
    version: '1.0',
    last_updated: null,
    company_info: {}
  },
  compliance: {
    gdpr_enabled: true,
    ccpa_enabled: false,
    data_retention_days: 365,
    right_to_deletion: true
  }
};

// Configuration par défaut de la communauté
export const defaultCommunityConfig: CommunityConfig = {
  general: {
    enabled: true,
    public_registration: true,
    moderation_enabled: true,
    auto_approve_posts: false
  },
  features: {
    posts_enabled: true,
    comments_enabled: true,
    reactions_enabled: true,
    media_sharing: true,
    user_profiles: true
  },
  moderation: {
    auto_moderation: false,
    profanity_filter: true,
    spam_protection: true,
    report_system: true
  },
  limits: {
    max_posts_per_day: 10,
    max_comments_per_post: 100,
    max_file_size_mb: 10,
    max_communities_per_user: 5
  }
};

// Configuration par défaut des analytics
export const defaultAnalyticsConfig: AnalyticsConfig = {
  tracking: {
    enabled: true,
    google_analytics_id: '',
    facebook_pixel_id: '',
    custom_tracking: false
  },
  metrics: {
    user_behavior: true,
    performance_metrics: true,
    business_metrics: true,
    error_tracking: true
  },
  reporting: {
    daily_reports: false,
    weekly_reports: true,
    monthly_reports: true,
    custom_dashboards: true
  },
  privacy: {
    anonymize_ip: true,
    respect_dnt: true,
    cookie_consent: true,
    data_retention_days: 365
  }
};

// Fonction pour initialiser toutes les configurations par défaut
export const initializeDefaultConfigs = () => {
  const configs = {
    database: defaultDatabaseConfig,
    chatbot: defaultChatbotConfig,
    system: defaultSystemConfig,
    security: defaultSecurityConfig,
    mailing: defaultMailingConfig,
    appearance: defaultAppearanceConfig,
    legal: defaultLegalConfig,
    community: defaultCommunityConfig,
    analytics: defaultAnalyticsConfig
  };

  // Sauvegarder dans localStorage si elles n'existent pas déjà
  Object.entries(configs).forEach(([key, config]) => {
    const storageKey = `admin_${key}_config`;
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(config));
      console.log(`✅ Configuration par défaut initialisée: ${key}`);
    }
  });
};

// Fonction pour réinitialiser toutes les configurations
export const resetAllConfigs = () => {
  const configs = {
    database: defaultDatabaseConfig,
    chatbot: defaultChatbotConfig,
    system: defaultSystemConfig,
    security: defaultSecurityConfig,
    mailing: defaultMailingConfig,
    appearance: defaultAppearanceConfig,
    legal: defaultLegalConfig,
    community: defaultCommunityConfig,
    analytics: defaultAnalyticsConfig
  };

  // Sauvegarder dans localStorage
  Object.entries(configs).forEach(([key, config]) => {
    const storageKey = `admin_${key}_config`;
    localStorage.setItem(storageKey, JSON.stringify(config));
    console.log(`🔄 Configuration réinitialisée: ${key}`);
  });
};
