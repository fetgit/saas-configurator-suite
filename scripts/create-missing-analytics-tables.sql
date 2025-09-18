-- ===================================================================
-- TABLES MANQUANTES POUR LE SYSTÈME D'ANALYTICS
-- ===================================================================

-- Table pour les statistiques de trafic
CREATE TABLE IF NOT EXISTS traffic_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    page_views INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    bounce_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    session_duration DECIMAL(10,2) NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les sources de trafic
CREATE TABLE IF NOT EXISTS traffic_sources (
    id SERIAL PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'direct', 'search', 'social', 'email', 'referral'
    visits INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les appareils utilisés
CREATE TABLE IF NOT EXISTS device_stats (
    id SERIAL PRIMARY KEY,
    device_type VARCHAR(50) NOT NULL, -- 'desktop', 'mobile', 'tablet'
    visits INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les localisations géographiques
CREATE TABLE IF NOT EXISTS location_stats (
    id SERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    sessions INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les événements de sécurité
CREATE TABLE IF NOT EXISTS security_events_analytics (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'threat', 'blocked_ip', 'failed_login', 'security_score'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    count INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les statistiques de connexion
CREATE TABLE IF NOT EXISTS login_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    successful_logins INTEGER NOT NULL DEFAULT 0,
    failed_logins INTEGER NOT NULL DEFAULT 0,
    unique_users INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour la distribution des rôles
CREATE TABLE IF NOT EXISTS role_distribution (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour la distribution des entreprises
CREATE TABLE IF NOT EXISTS company_distribution (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données initiales réalistes
INSERT INTO traffic_stats (date, page_views, unique_visitors, bounce_rate, session_duration, conversion_rate) VALUES
(CURRENT_DATE, 15420, 1250, 32.5, 245.8, 3.2),
(CURRENT_DATE - INTERVAL '1 day', 14200, 1180, 35.2, 220.5, 2.8),
(CURRENT_DATE - INTERVAL '2 days', 16800, 1350, 30.1, 260.3, 3.5);

INSERT INTO traffic_sources (source_name, source_type, visits, date) VALUES
('Direct', 'direct', 6939, CURRENT_DATE),
('Google', 'search', 4626, CURRENT_DATE),
('Social Media', 'social', 2313, CURRENT_DATE),
('Email Campaigns', 'email', 1542, CURRENT_DATE);

INSERT INTO device_stats (device_type, visits, date) VALUES
('Desktop', 9252, CURRENT_DATE),
('Mobile', 5397, CURRENT_DATE),
('Tablet', 771, CURRENT_DATE);

INSERT INTO location_stats (country, sessions, date) VALUES
('France', 6939, CURRENT_DATE),
('Belgique', 3084, CURRENT_DATE),
('Suisse', 2313, CURRENT_DATE),
('Canada', 1542, CURRENT_DATE),
('Autres', 1542, CURRENT_DATE);

INSERT INTO security_events_analytics (event_type, severity, count, date, details) VALUES
('threat', 'medium', 3, CURRENT_DATE, '{"type": "suspicious_activity"}'),
('blocked_ip', 'high', 12, CURRENT_DATE, '{"reason": "brute_force"}'),
('failed_login', 'low', 8, CURRENT_DATE, '{"attempts": 8}'),
('security_score', 'low', 95, CURRENT_DATE, '{"score": 95}');

INSERT INTO login_stats (date, successful_logins, failed_logins, unique_users) VALUES
(CURRENT_DATE, 1250, 8, 1200),
(CURRENT_DATE - INTERVAL '1 day', 1180, 12, 1150),
(CURRENT_DATE - INTERVAL '2 days', 1350, 5, 1300);

-- Mettre à jour la distribution des rôles basée sur les vrais utilisateurs
INSERT INTO role_distribution (role, count, date)
SELECT 
    role,
    COUNT(*) as count,
    CURRENT_DATE as date
FROM users 
GROUP BY role;

-- Mettre à jour la distribution des entreprises basée sur les vrais utilisateurs
INSERT INTO company_distribution (company_name, count, date)
SELECT 
    COALESCE(company, 'Non spécifiée') as company_name,
    COUNT(*) as count,
    CURRENT_DATE as date
FROM users 
GROUP BY company;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_traffic_stats_date ON traffic_stats(date);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_date ON traffic_sources(date);
CREATE INDEX IF NOT EXISTS idx_device_stats_date ON device_stats(date);
CREATE INDEX IF NOT EXISTS idx_location_stats_date ON location_stats(date);
CREATE INDEX IF NOT EXISTS idx_security_events_date ON security_events_analytics(date);
CREATE INDEX IF NOT EXISTS idx_login_stats_date ON login_stats(date);
