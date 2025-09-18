-- ===================================================================
-- TABLES MANQUANTES POUR LE SYSTÈME DE MAILING
-- ===================================================================

-- Table pour la configuration SMTP (si elle n'existe pas)
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

-- Table pour les statistiques de campagnes (adaptée aux UUIDs existants)
CREATE TABLE IF NOT EXISTS campaign_statistics (
    id SERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
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
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'unsubscribed'
    event_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_subscribed ON contacts(subscribed);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_events_campaign ON email_events(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_events_contact ON email_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(event_type);

-- Données par défaut pour les listes de diffusion
INSERT INTO mailing_lists (name, description, tags) VALUES
('Tous les utilisateurs', 'Liste générale de tous les utilisateurs', '["general", "all"]'),
('Clients Premium', 'Liste des clients avec un abonnement premium', '["premium", "clients"]'),
('Newsletter', 'Liste pour la newsletter mensuelle', '["newsletter", "marketing"]')
ON CONFLICT DO NOTHING;

-- Configuration SMTP par défaut
INSERT INTO mailing_smtp_config (host, port, secure, username, password_encrypted, from_email, from_name) VALUES
('smtp.gmail.com', 587, false, 'your-email@gmail.com', 'encrypted_password_here', 'noreply@yourcompany.com', 'Votre Entreprise')
ON CONFLICT DO NOTHING;
