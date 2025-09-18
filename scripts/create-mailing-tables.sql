-- ===================================================================
-- TABLES POUR LE SYSTÈME DE MAILING
-- ===================================================================

-- Table pour la configuration SMTP
CREATE TABLE IF NOT EXISTS mailing_smtp_config (
    id SERIAL PRIMARY KEY,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL DEFAULT 587,
    secure BOOLEAN NOT NULL DEFAULT false,
    username VARCHAR(255) NOT NULL,
    password_encrypted TEXT NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    from_name VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les templates d'emails
CREATE TABLE IF NOT EXISTS email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]',
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les listes de diffusion
CREATE TABLE IF NOT EXISTS mailing_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les contacts
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    company VARCHAR(255),
    tags JSONB DEFAULT '[]',
    subscribed BOOLEAN NOT NULL DEFAULT true,
    subscription_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_date TIMESTAMP,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table de liaison contacts-listes
CREATE TABLE IF NOT EXISTS contact_mailing_lists (
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    mailing_list_id INTEGER REFERENCES mailing_lists(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contact_id, mailing_list_id)
);

-- Table pour les campagnes
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_id INTEGER REFERENCES email_templates(id),
    mailing_list_ids JSONB DEFAULT '[]',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les statistiques de campagnes
CREATE TABLE IF NOT EXISTS campaign_statistics (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    sent INTEGER NOT NULL DEFAULT 0,
    delivered INTEGER NOT NULL DEFAULT 0,
    opened INTEGER NOT NULL DEFAULT 0,
    clicked INTEGER NOT NULL DEFAULT 0,
    unsubscribed INTEGER NOT NULL DEFAULT 0,
    bounced INTEGER NOT NULL DEFAULT 0,
    complained INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les événements d'emails
CREATE TABLE IF NOT EXISTS email_events (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_subscribed ON contacts(subscribed);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_contact ON email_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);

-- Données par défaut
INSERT INTO email_templates (name, subject, html_content, text_content, variables, category) VALUES
('Email de bienvenue', 'Bienvenue sur {{company_name}} !', 
'<h1>Bienvenue {{first_name}} !</h1><p>Nous sommes ravis de vous compter parmi nos utilisateurs.</p><p>Votre compte a été créé avec succès pour l''entreprise {{company_name}}.</p><a href="{{login_url}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Se connecter</a>',
'Bienvenue {{first_name}} ! Nous sommes ravis de vous compter parmi nos utilisateurs.',
'["first_name", "company_name", "login_url"]', 'welcome'),

('Newsletter mensuelle', 'Nouveautés du mois - {{month_name}}',
'<h1>Newsletter {{month_name}}</h1><p>Découvrez les dernières nouveautés et améliorations.</p><div><h2>Nouvelles fonctionnalités</h2><ul><li>{{feature_1}}</li><li>{{feature_2}}</li></ul></div>',
'Newsletter {{month_name}} - Découvrez les dernières nouveautés.',
'["month_name", "feature_1", "feature_2"]', 'newsletter'),

('Réinitialisation de mot de passe', 'Réinitialisation de votre mot de passe',
'<h1>Réinitialisation de mot de passe</h1><p>Bonjour {{first_name}},</p><p>Vous avez demandé une réinitialisation de votre mot de passe.</p><a href="{{reset_url}}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Réinitialiser mon mot de passe</a><p>Ce lien expire dans 24 heures.</p>',
'Bonjour {{first_name}}, vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur ce lien : {{reset_url}}',
'["first_name", "reset_url"]', 'transactional');

INSERT INTO mailing_lists (name, description, tags) VALUES
('Tous les utilisateurs', 'Liste générale de tous les utilisateurs', '["general", "all"]'),
('Clients Premium', 'Liste des clients avec un abonnement premium', '["premium", "clients"]'),
('Newsletter', 'Liste pour la newsletter mensuelle', '["newsletter", "marketing"]');

-- Configuration SMTP par défaut
INSERT INTO mailing_smtp_config (host, port, secure, username, password_encrypted, from_email, from_name) VALUES
('smtp.gmail.com', 587, false, 'your-email@gmail.com', 'encrypted_password_here', 'noreply@yourcompany.com', 'Votre Entreprise');
