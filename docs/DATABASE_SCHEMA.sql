-- ===================================================================
-- SAAS TEMPLATE DATABASE SCHEMA
-- Universal SQL schema compatible with PostgreSQL, MySQL, etc.
-- Complete schema for all SaaS features and modules
-- ===================================================================

-- ===================================================================
-- EXTENSIONS & SETUP (PostgreSQL specific - adapt for other DBs)
-- ===================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- Enable PostGIS for geolocation (optional)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- ===================================================================
-- USERS & AUTHENTICATION
-- ===================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    company_id UUID,
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    phone VARCHAR(50),
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    last_login_at TIMESTAMPTZ,
    login_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    preferences JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ===================================================================
-- MFA DEVICES
-- ===================================================================

CREATE TABLE mfa_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL CHECK (device_type IN ('totp', 'sms', 'email', 'backup_codes')),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    backup_codes TEXT[],
    phone_number VARCHAR(50),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mfa_devices_user_id ON mfa_devices(user_id);
CREATE INDEX idx_mfa_devices_type ON mfa_devices(device_type);

-- ===================================================================
-- SUBSCRIPTIONS & BILLING
-- ===================================================================

CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('free', 'basic', 'premium', 'enterprise')),
    price_monthly INTEGER NOT NULL, -- Amount in cents
    price_yearly INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    features JSONB NOT NULL DEFAULT '[]',
    limits JSONB NOT NULL DEFAULT '{}',
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    trial_days INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_tier ON subscription_plans(tier);
CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete')),
    tier VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    canceled_at TIMESTAMPTZ,
    billing_cycle VARCHAR(20) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    tax_rate DECIMAL(5,4),
    discount_id VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    stripe_invoice_id VARCHAR(255),
    invoice_number VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')),
    amount INTEGER NOT NULL,
    tax_amount INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    due_date TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    payment_method VARCHAR(255),
    billing_address JSONB,
    line_items JSONB NOT NULL DEFAULT '[]',
    pdf_url VARCHAR(500),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- ===================================================================
-- AUDIT & SECURITY
-- ===================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(255) NOT NULL,
    resource_id VARCHAR(255),
    ip_address INET NOT NULL,
    user_agent TEXT,
    location JSONB, -- {country, region, city, latitude, longitude}
    status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failure', 'warning')),
    details JSONB NOT NULL DEFAULT '{}',
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    session_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
        'suspicious_login', 'failed_login_attempts', 'mfa_bypass_attempt',
        'unusual_activity', 'data_export', 'admin_action', 'api_abuse'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ip_address INET NOT NULL,
    user_agent TEXT,
    location JSONB,
    details JSONB NOT NULL DEFAULT '{}',
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_security_events_user_id ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_resolved ON security_events(resolved);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);

-- ===================================================================
-- CONTENT & COMMUNITY
-- ===================================================================

CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    visibility VARCHAR(50) NOT NULL CHECK (visibility IN ('public', 'private', 'community', 'followers')),
    member_count INTEGER NOT NULL DEFAULT 0,
    post_count INTEGER NOT NULL DEFAULT 0,
    settings JSONB NOT NULL DEFAULT '{}',
    rules TEXT[],
    tags VARCHAR(100)[],
    banner_url VARCHAR(500),
    avatar_url VARCHAR(500),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_communities_slug ON communities(slug);
CREATE INDEX idx_communities_owner_id ON communities(owner_id);
CREATE INDEX idx_communities_visibility ON communities(visibility);
CREATE INDEX idx_communities_created_at ON communities(created_at);

CREATE TABLE community_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('member', 'moderator', 'admin', 'owner')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'banned', 'pending', 'left')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, community_id)
);

CREATE INDEX idx_community_memberships_user_id ON community_memberships(user_id);
CREATE INDEX idx_community_memberships_community_id ON community_memberships(community_id);
CREATE INDEX idx_community_memberships_role ON community_memberships(role);
CREATE INDEX idx_community_memberships_status ON community_memberships(status);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (content_type IN ('text', 'markdown', 'html')),
    status VARCHAR(50) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    visibility VARCHAR(50) NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'community', 'followers')),
    tags VARCHAR(100)[],
    attachments JSONB NOT NULL DEFAULT '[]',
    reactions JSONB NOT NULL DEFAULT '{}',
    comment_count INTEGER NOT NULL DEFAULT 0,
    view_count INTEGER NOT NULL DEFAULT 0,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_community_id ON posts(community_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_featured ON posts(featured);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    reactions JSONB NOT NULL DEFAULT '{}',
    reply_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at);

-- ===================================================================
-- SUPPORT & TICKETING
-- ===================================================================

CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'billing', 'feature_request', 'bug_report', 'general')),
    tags VARCHAR(100)[],
    attachments JSONB NOT NULL DEFAULT '[]',
    resolution TEXT,
    resolved_at TIMESTAMPTZ,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_feedback TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);

CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    attachments JSONB NOT NULL DEFAULT '[]',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_user_id ON ticket_messages(user_id);
CREATE INDEX idx_ticket_messages_created_at ON ticket_messages(created_at);

-- ===================================================================
-- EMAIL & MARKETING
-- ===================================================================

CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('transactional', 'marketing', 'notification', 'welcome', 'billing', 'security')),
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables VARCHAR(100)[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    tags VARCHAR(100)[],
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_is_active ON email_templates(is_active);
CREATE INDEX idx_email_templates_tags ON email_templates USING GIN(tags);

CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    template_id UUID NOT NULL REFERENCES email_templates(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'failed')),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    target_audience JSONB NOT NULL DEFAULT '{}',
    statistics JSONB NOT NULL DEFAULT '{
        "sent": 0, "delivered": 0, "opened": 0, "clicked": 0,
        "unsubscribed": 0, "bounced": 0, "complained": 0,
        "conversion_count": 0, "conversion_value": 0
    }',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_campaigns_template_id ON email_campaigns(template_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);
CREATE INDEX idx_email_campaigns_sent_at ON email_campaigns(sent_at);

-- ===================================================================
-- FILE MANAGEMENT & ATTACHMENTS
-- ===================================================================

CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bucket VARCHAR(255) NOT NULL,
    path VARCHAR(1000) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_bucket ON attachments(bucket);
CREATE INDEX idx_attachments_mime_type ON attachments(mime_type);
CREATE INDEX idx_attachments_created_at ON attachments(created_at);

-- ===================================================================
-- ANALYTICS & TRACKING
-- ===================================================================

CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    ip_address INET NOT NULL,
    user_agent TEXT,
    location JSONB,
    device_info JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_session_id ON user_events(session_id);
CREATE INDEX idx_user_events_event_name ON user_events(event_name);
CREATE INDEX idx_user_events_created_at ON user_events(created_at);
CREATE INDEX idx_user_events_properties ON user_events USING GIN(properties);

-- ===================================================================
-- DATA EXPORT & BACKUP
-- ===================================================================

CREATE TABLE data_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    export_type VARCHAR(50) NOT NULL CHECK (export_type IN ('user_data', 'gdpr_export', 'backup', 'analytics')),
    format VARCHAR(20) NOT NULL CHECK (format IN ('json', 'csv', 'xml', 'pdf')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    file_url VARCHAR(1000),
    file_size BIGINT,
    expires_at TIMESTAMPTZ NOT NULL,
    requested_data TEXT[] NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_exports_user_id ON data_exports(user_id);
CREATE INDEX idx_data_exports_status ON data_exports(status);
CREATE INDEX idx_data_exports_export_type ON data_exports(export_type);
CREATE INDEX idx_data_exports_expires_at ON data_exports(expires_at);

CREATE TABLE backup_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('full', 'incremental', 'differential')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'expired')),
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT,
    tables_included TEXT[] NOT NULL DEFAULT '{}',
    retention_days INTEGER NOT NULL DEFAULT 30,
    encrypted BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_backup_jobs_status ON backup_jobs(status);
CREATE INDEX idx_backup_jobs_type ON backup_jobs(type);
CREATE INDEX idx_backup_jobs_created_at ON backup_jobs(created_at);

-- ===================================================================
-- API MANAGEMENT
-- ===================================================================

CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    permissions JSONB NOT NULL DEFAULT '[]',
    rate_limit INTEGER NOT NULL DEFAULT 1000,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ip_whitelist INET[] DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    events VARCHAR(100)[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    secret VARCHAR(255) NOT NULL,
    retry_count INTEGER NOT NULL DEFAULT 3,
    timeout_seconds INTEGER NOT NULL DEFAULT 30,
    last_triggered_at TIMESTAMPTZ,
    success_count INTEGER NOT NULL DEFAULT 0,
    failure_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_is_active ON webhooks(is_active);
CREATE INDEX idx_webhooks_events ON webhooks USING GIN(events);

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'abandoned')),
    response_code INTEGER,
    response_body TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_event_type ON webhook_deliveries(event_type);
CREATE INDEX idx_webhook_deliveries_created_at ON webhook_deliveries(created_at);

-- ===================================================================
-- SYSTEM CONFIGURATION
-- ===================================================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    requires_restart BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);

CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    rollout_percentage INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_audience JSONB,
    conditions JSONB NOT NULL DEFAULT '{}',
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_key ON feature_flags(key);
CREATE INDEX idx_feature_flags_is_enabled ON feature_flags(is_enabled);

-- ===================================================================
-- TRIGGERS FOR UPDATED_AT
-- ===================================================================

-- Generic trigger function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mfa_devices_updated_at BEFORE UPDATE ON mfa_devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_logs_updated_at BEFORE UPDATE ON audit_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_events_updated_at BEFORE UPDATE ON security_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON communities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_memberships_updated_at BEFORE UPDATE ON community_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_messages_updated_at BEFORE UPDATE ON ticket_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE ON attachments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_events_updated_at BEFORE UPDATE ON user_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_exports_updated_at BEFORE UPDATE ON data_exports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_backup_jobs_updated_at BEFORE UPDATE ON backup_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhook_deliveries_updated_at BEFORE UPDATE ON webhook_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- SAMPLE DATA INSERTS
-- ===================================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, features, limits, trial_days, description) VALUES
('Free Plan', 'free', 0, 0, 
 '["Basic features", "1 user", "Email support"]', 
 '{"users": 1, "storage_gb": 1, "api_calls_per_month": 1000, "email_sends_per_month": 100, "communities": 1, "custom_domains": 0, "support_level": "basic"}',
 14, 'Perfect for getting started'),
('Basic Plan', 'basic', 999, 9990, 
 '["All free features", "5 users", "10GB storage", "Priority email support"]', 
 '{"users": 5, "storage_gb": 10, "api_calls_per_month": 10000, "email_sends_per_month": 1000, "communities": 5, "custom_domains": 1, "support_level": "priority"}',
 14, 'Great for small teams'),
('Premium Plan', 'premium', 2999, 29990, 
 '["All basic features", "25 users", "100GB storage", "Phone support", "Advanced analytics"]', 
 '{"users": 25, "storage_gb": 100, "api_calls_per_month": 100000, "email_sends_per_month": 10000, "communities": 25, "custom_domains": 5, "support_level": "priority"}',
 14, 'Perfect for growing businesses'),
('Enterprise Plan', 'enterprise', 9999, 99990, 
 '["All premium features", "Unlimited users", "1TB storage", "Dedicated support", "Custom integrations"]', 
 '{"users": -1, "storage_gb": 1000, "api_calls_per_month": -1, "email_sends_per_month": -1, "communities": -1, "custom_domains": -1, "support_level": "dedicated"}',
 30, 'For large organizations');

-- Insert default system settings
INSERT INTO system_settings (key, value, data_type, category, description) VALUES
('app_name', 'SaaS Template', 'string', 'general', 'Application name'),
('app_url', 'https://example.com', 'string', 'general', 'Application URL'),
('support_email', 'support@example.com', 'string', 'general', 'Support email address'),
('max_file_size_mb', '10', 'number', 'files', 'Maximum file upload size in MB'),
('session_timeout_minutes', '60', 'number', 'security', 'Session timeout in minutes'),
('enable_registration', 'true', 'boolean', 'auth', 'Allow new user registration'),
('require_email_verification', 'true', 'boolean', 'auth', 'Require email verification for new accounts'),
('maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode');

-- Insert default feature flags
INSERT INTO feature_flags (name, key, description, is_enabled, rollout_percentage) VALUES
('New Dashboard', 'new_dashboard', 'Enable new dashboard design', false, 0),
('Advanced Analytics', 'advanced_analytics', 'Enable advanced analytics features', true, 100),
('Beta Features', 'beta_features', 'Enable beta features for testing', false, 10),
('Community Features', 'community_features', 'Enable community and social features', true, 100);

-- Insert default email templates
INSERT INTO email_templates (name, category, subject, html_content, text_content, variables) VALUES
('Welcome Email', 'welcome', 'Welcome to {{app_name}}!', 
 '<h1>Welcome {{user_name}}!</h1><p>Thanks for joining {{app_name}}. We''re excited to have you on board!</p>', 
 'Welcome {{user_name}}! Thanks for joining {{app_name}}. We''re excited to have you on board!',
 ARRAY['user_name', 'app_name']),
('Password Reset', 'security', 'Reset your password', 
 '<h1>Password Reset</h1><p>Click <a href="{{reset_url}}">here</a> to reset your password.</p>', 
 'Click this link to reset your password: {{reset_url}}',
 ARRAY['reset_url']),
('Invoice Created', 'billing', 'Your invoice is ready', 
 '<h1>Invoice {{invoice_number}}</h1><p>Your invoice for ${{amount}} is now available.</p>', 
 'Your invoice {{invoice_number}} for ${{amount}} is now available.',
 ARRAY['invoice_number', 'amount']);

-- ===================================================================
-- VIEWS FOR COMMON QUERIES
-- ===================================================================

-- Active users with subscription info
CREATE VIEW active_users_with_subscriptions AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.status,
    u.subscription_tier,
    s.status as subscription_status,
    s.current_period_end,
    sp.name as plan_name,
    sp.price_monthly,
    u.created_at,
    u.last_login_at
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE u.status = 'active';

-- Recent security events summary
CREATE VIEW recent_security_events AS
SELECT 
    se.event_type,
    se.severity,
    COUNT(*) as event_count,
    MAX(se.created_at) as last_occurrence,
    COUNT(DISTINCT se.user_id) as affected_users
FROM security_events se
WHERE se.created_at >= NOW() - INTERVAL '7 days'
GROUP BY se.event_type, se.severity
ORDER BY event_count DESC;

-- Community engagement stats
CREATE VIEW community_engagement_stats AS
SELECT 
    c.id,
    c.name,
    c.member_count,
    c.post_count,
    COUNT(DISTINCT p.id) as recent_posts,
    COUNT(DISTINCT cm.id) as recent_comments,
    AVG(p.view_count) as avg_post_views
FROM communities c
LEFT JOIN posts p ON c.id = p.community_id AND p.created_at >= NOW() - INTERVAL '30 days'
LEFT JOIN comments cm ON p.id = cm.post_id AND cm.created_at >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.name, c.member_count, c.post_count;

-- ===================================================================
-- FULL-TEXT SEARCH SETUP
-- ===================================================================

-- Full-text search on posts
ALTER TABLE posts ADD COLUMN search_vector tsvector;

CREATE INDEX idx_posts_search_vector ON posts USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.tags, ' ')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER update_posts_search_vector_trigger
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_posts_search_vector();

-- Update existing posts with search vectors
UPDATE posts SET search_vector = 
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(tags, ' ')), 'C');

-- ===================================================================
-- PERFORMANCE OPTIMIZATION
-- ===================================================================

-- Partial indexes for better performance
CREATE INDEX idx_subscriptions_active ON subscriptions(user_id) WHERE status = 'active';
CREATE INDEX idx_posts_published ON posts(created_at DESC) WHERE status = 'published';
CREATE INDEX idx_audit_logs_recent ON audit_logs(created_at DESC) WHERE created_at >= NOW() - INTERVAL '30 days';
CREATE INDEX idx_security_events_unresolved ON security_events(created_at DESC) WHERE resolved = false;

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_select_own ON users FOR SELECT USING (id = current_user_id());
CREATE POLICY users_update_own ON users FOR UPDATE USING (id = current_user_id());

-- Subscriptions can only be viewed by the owner
CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (user_id = current_user_id());

-- Invoices can only be viewed by the owner
CREATE POLICY invoices_select_own ON invoices FOR SELECT USING (user_id = current_user_id());

-- Support tickets can be viewed by owner or assigned staff
CREATE POLICY tickets_select_own ON support_tickets FOR SELECT USING (
    user_id = current_user_id() OR 
    assigned_to = current_user_id() OR
    current_user_role() IN ('admin', 'superadmin')
);

-- Data exports can only be viewed by the requester
CREATE POLICY data_exports_select_own ON data_exports FOR SELECT USING (user_id = current_user_id());

-- API keys can only be viewed by the owner
CREATE POLICY api_keys_select_own ON api_keys FOR SELECT USING (user_id = current_user_id());

-- Audit logs can only be viewed by admins or the subject user
CREATE POLICY audit_logs_select_restricted ON audit_logs FOR SELECT USING (
    user_id = current_user_id() OR current_user_role() IN ('admin', 'superadmin')
);

-- Helper functions (these would need to be implemented based on your auth system)
-- CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
--   SELECT auth.uid()
-- $$ LANGUAGE SQL SECURITY DEFINER;

-- CREATE OR REPLACE FUNCTION current_user_role() RETURNS TEXT AS $$
--   SELECT role FROM users WHERE id = current_user_id()
-- $$ LANGUAGE SQL SECURITY DEFINER;

-- ===================================================================
-- CLEANUP AND MAINTENANCE PROCEDURES
-- ===================================================================

-- Procedure to clean up expired data exports
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM data_exports WHERE expires_at < NOW() AND status = 'completed';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to clean up old audit logs (keep last 6 months)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '6 months';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure to clean up old user events (keep last 3 months)
CREATE OR REPLACE FUNCTION cleanup_old_user_events()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_events WHERE created_at < NOW() - INTERVAL '3 months';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- END OF SCHEMA
-- ===================================================================