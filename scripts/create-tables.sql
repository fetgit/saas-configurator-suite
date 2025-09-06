-- ===================================================================
-- SCRIPT SIMPLIFIÉ POUR CRÉER LES TABLES DE CONFIGURATION
-- ===================================================================

-- Table principale des configurations
CREATE TABLE IF NOT EXISTS admin_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_type VARCHAR(50) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(config_type, config_key)
);

-- Table pour les configurations de base de données
CREATE TABLE IF NOT EXISTS admin_database_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    db_type VARCHAR(20) NOT NULL CHECK (db_type IN ('mysql', 'postgresql')),
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    database_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL,
    ssl_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ssl_verify_cert BOOLEAN NOT NULL DEFAULT TRUE,
    charset VARCHAR(50) DEFAULT 'utf8mb4',
    schema_name VARCHAR(100) DEFAULT 'public',
    timezone VARCHAR(50) DEFAULT 'UTC',
    extensions JSONB DEFAULT '[]',
    max_connections INTEGER DEFAULT 50,
    connection_timeout INTEGER DEFAULT 30,
    query_timeout INTEGER DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_tested_at TIMESTAMPTZ,
    test_status VARCHAR(20) CHECK (test_status IN ('success', 'error', 'never_tested')),
    test_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les configurations du chatbot
CREATE TABLE IF NOT EXISTS admin_chatbot_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    api_key_encrypted TEXT,
    welcome_message TEXT NOT NULL DEFAULT 'Bonjour ! Comment puis-je vous aider ?',
    max_messages INTEGER DEFAULT 50,
    response_delay INTEGER DEFAULT 1000,
    language VARCHAR(10) DEFAULT 'fr',
    personality VARCHAR(50) DEFAULT 'helpful',
    context_memory BOOLEAN DEFAULT TRUE,
    context_duration INTEGER DEFAULT 30,
    auto_respond BOOLEAN DEFAULT FALSE,
    business_hours_only BOOLEAN DEFAULT FALSE,
    business_hours JSONB DEFAULT '{"start": "09:00", "end": "18:00", "timezone": "Europe/Paris"}',
    fallback_message TEXT DEFAULT 'Je ne suis pas disponible pour le moment.',
    appearance JSONB DEFAULT '{"position": "bottom-right", "theme": "light", "primary_color": "#3b82f6", "show_avatar": true, "show_typing": true}',
    behavior JSONB DEFAULT '{"greeting_delay": 5000, "auto_open": false, "persistent": true, "sound_enabled": true}',
    analytics JSONB DEFAULT '{"track_conversations": true, "track_satisfaction": true, "export_data": false}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les configurations système
CREATE TABLE IF NOT EXISTS admin_system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    general JSONB DEFAULT '{"app_name": "SaaS Configurator Suite", "app_url": "https://example.com", "support_email": "support@example.com", "maintenance_mode": false, "debug_mode": false, "log_level": "info"}',
    performance JSONB DEFAULT '{"max_file_size_mb": 100, "max_users": 5000, "cache_enabled": true, "cache_ttl": 3600}',
    backup JSONB DEFAULT '{"enabled": true, "frequency": "daily", "retention_days": 30, "encrypted": true, "cloud_storage": false}',
    monitoring JSONB DEFAULT '{"health_checks": true, "metrics_collection": true, "alerting": true, "uptime_monitoring": true}',
    integrations JSONB DEFAULT '{"stripe_enabled": false, "analytics_enabled": true, "webhooks_enabled": true, "api_enabled": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les configurations de sécurité
CREATE TABLE IF NOT EXISTS admin_security_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    password_policy JSONB DEFAULT '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_symbols": true, "max_age_days": 90, "prevent_reuse": 5}',
    two_factor JSONB DEFAULT '{"enabled": false, "required_for_admin": true, "required_for_users": false, "backup_codes": true}',
    session_management JSONB DEFAULT '{"timeout_minutes": 60, "max_concurrent": 3, "remember_me_days": 30, "secure_cookies": true}',
    login_security JSONB DEFAULT '{"max_attempts": 5, "lockout_duration": 15, "ip_whitelist": [], "geo_restrictions": false}',
    api_security JSONB DEFAULT '{"rate_limit_per_hour": 1000, "require_api_key": true, "cors_enabled": true, "allowed_origins": []}',
    audit_logging JSONB DEFAULT '{"enabled": true, "retention_days": 365, "log_failed_attempts": true, "log_admin_actions": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les configurations de mailing
CREATE TABLE IF NOT EXISTS admin_mailing_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    provider VARCHAR(50) NOT NULL DEFAULT 'smtp' CHECK (provider IN ('smtp', 'sendgrid', 'mailgun', 'ses')),
    smtp_config JSONB DEFAULT '{"host": "", "port": 587, "secure": false, "username": "", "password_encrypted": "", "from_name": "", "from_email": ""}',
    api_config JSONB DEFAULT '{"api_key_encrypted": "", "domain": "", "region": ""}',
    rate_limits JSONB DEFAULT '{"emails_per_hour": 1000, "emails_per_day": 10000, "burst_limit": 100}',
    templates JSONB DEFAULT '{"welcome": true, "password_reset": true, "invoice": true, "newsletter": true}',
    tracking JSONB DEFAULT '{"open_tracking": true, "click_tracking": true, "unsubscribe_tracking": true}',
    compliance JSONB DEFAULT '{"gdpr_compliant": true, "can_spam_compliant": true, "unsubscribe_required": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les configurations d'apparence
CREATE TABLE IF NOT EXISTS admin_appearance_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    theme JSONB DEFAULT '{"primary_color": "#3b82f6", "secondary_color": "#64748b", "accent_color": "#f59e0b", "background_color": "#ffffff", "text_color": "#1f2937", "border_color": "#e5e7eb"}',
    branding JSONB DEFAULT '{"logo_url": "", "favicon_url": "", "company_name": "", "tagline": "", "show_branding": true}',
    layout JSONB DEFAULT '{"sidebar_collapsed": false, "header_style": "default", "footer_enabled": true, "breadcrumbs_enabled": true}',
    customization JSONB DEFAULT '{"custom_css": "", "custom_js": "", "fonts": {"primary": "Inter", "secondary": "Roboto"}}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les configurations légales
CREATE TABLE IF NOT EXISTS admin_legal_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    terms_of_service JSONB DEFAULT '{"enabled": true, "version": "1.0", "last_updated": null, "require_acceptance": true}',
    privacy_policy JSONB DEFAULT '{"enabled": true, "version": "1.0", "last_updated": null, "gdpr_compliant": true}',
    cookie_policy JSONB DEFAULT '{"enabled": true, "version": "1.0", "last_updated": null, "banner_enabled": true}',
    legal_notice JSONB DEFAULT '{"enabled": true, "version": "1.0", "last_updated": null, "company_info": {}}',
    compliance JSONB DEFAULT '{"gdpr_enabled": true, "ccpa_enabled": false, "data_retention_days": 365, "right_to_deletion": true}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les configurations de communauté
CREATE TABLE IF NOT EXISTS admin_community_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    general JSONB DEFAULT '{"enabled": true, "public_registration": true, "moderation_enabled": true, "auto_approve_posts": false}',
    features JSONB DEFAULT '{"posts_enabled": true, "comments_enabled": true, "reactions_enabled": true, "media_sharing": true, "user_profiles": true}',
    moderation JSONB DEFAULT '{"auto_moderation": false, "profanity_filter": true, "spam_protection": true, "report_system": true}',
    limits JSONB DEFAULT '{"max_posts_per_day": 10, "max_comments_per_post": 100, "max_file_size_mb": 10, "max_communities_per_user": 5}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table pour les configurations d'analytics
CREATE TABLE IF NOT EXISTS admin_analytics_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking JSONB DEFAULT '{"enabled": true, "google_analytics_id": "", "facebook_pixel_id": "", "custom_tracking": false}',
    metrics JSONB DEFAULT '{"user_behavior": true, "performance_metrics": true, "business_metrics": true, "error_tracking": true}',
    reporting JSONB DEFAULT '{"daily_reports": false, "weekly_reports": true, "monthly_reports": true, "custom_dashboards": true}',
    privacy JSONB DEFAULT '{"anonymize_ip": true, "respect_dnt": true, "cookie_consent": true, "data_retention_days": 365}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Création des index
CREATE INDEX IF NOT EXISTS idx_admin_configurations_type ON admin_configurations(config_type);
CREATE INDEX IF NOT EXISTS idx_admin_configurations_key ON admin_configurations(config_key);
CREATE INDEX IF NOT EXISTS idx_admin_configurations_active ON admin_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_database_config_type ON admin_database_config(db_type);
CREATE INDEX IF NOT EXISTS idx_admin_database_config_active ON admin_database_config(is_active);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_admin_configurations_updated_at BEFORE UPDATE ON admin_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_database_config_updated_at BEFORE UPDATE ON admin_database_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_chatbot_config_updated_at BEFORE UPDATE ON admin_chatbot_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_system_config_updated_at BEFORE UPDATE ON admin_system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_security_config_updated_at BEFORE UPDATE ON admin_security_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_mailing_config_updated_at BEFORE UPDATE ON admin_mailing_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_appearance_config_updated_at BEFORE UPDATE ON admin_appearance_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_legal_config_updated_at BEFORE UPDATE ON admin_legal_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_community_config_updated_at BEFORE UPDATE ON admin_community_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_analytics_config_updated_at BEFORE UPDATE ON admin_analytics_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données par défaut
INSERT INTO admin_database_config (
    db_type, host, port, database_name, username, password_encrypted, 
    ssl_enabled, charset, is_active, test_status
) VALUES (
    'postgresql', '147.93.58.155', 5432, 'saas_configurator', 'vpshostinger', 
    'encrypted_default_password', false, 'UTF8', true, 'never_tested'
) ON CONFLICT DO NOTHING;

INSERT INTO admin_chatbot_config (
    enabled, welcome_message, language, personality
) VALUES (
    true, 'Bonjour ! Comment puis-je vous aider ?', 'fr', 'helpful'
) ON CONFLICT DO NOTHING;

INSERT INTO admin_system_config (
    general, performance, backup
) VALUES (
    '{"app_name": "SaaS Configurator Suite", "maintenance_mode": false, "debug_mode": false}',
    '{"max_file_size_mb": 100, "max_users": 5000}',
    '{"enabled": true, "frequency": "daily", "retention_days": 30}'
) ON CONFLICT DO NOTHING;

INSERT INTO admin_security_config (
    password_policy, session_management, login_security
) VALUES (
    '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true}',
    '{"timeout_minutes": 60, "max_concurrent": 3}',
    '{"max_attempts": 5, "lockout_duration": 15}'
) ON CONFLICT DO NOTHING;
