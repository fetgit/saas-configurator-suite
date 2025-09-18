-- ===================================================================
-- TABLES POUR LE SYSTÈME DE HEADERS DE SÉCURITÉ
-- ===================================================================

-- Table pour les configurations de headers de sécurité
CREATE TABLE IF NOT EXISTS security_headers_config (
    id SERIAL PRIMARY KEY,
    environment VARCHAR(20) NOT NULL, -- 'development', 'staging', 'production'
    config_name VARCHAR(100) NOT NULL,
    csp_config JSONB NOT NULL DEFAULT '{}',
    hsts_config JSONB NOT NULL DEFAULT '{}',
    x_frame_options VARCHAR(50) DEFAULT 'DENY',
    x_content_type_options VARCHAR(20) DEFAULT 'nosniff',
    x_xss_protection VARCHAR(20) DEFAULT '1; mode=block',
    referrer_policy VARCHAR(50) DEFAULT 'strict-origin-when-cross-origin',
    permissions_policy JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour l'historique des headers générés
CREATE TABLE IF NOT EXISTS security_headers_history (
    id SERIAL PRIMARY KEY,
    config_id INTEGER REFERENCES security_headers_config(id),
    environment VARCHAR(20) NOT NULL,
    headers_generated JSONB NOT NULL,
    generation_reason VARCHAR(100), -- 'manual', 'auto', 'update'
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les tests de headers
CREATE TABLE IF NOT EXISTS security_headers_tests (
    id SERIAL PRIMARY KEY,
    config_id INTEGER REFERENCES security_headers_config(id),
    test_type VARCHAR(50) NOT NULL, -- 'csp', 'hsts', 'xss', 'clickjacking'
    test_url VARCHAR(255),
    test_result VARCHAR(20) NOT NULL, -- 'pass', 'fail', 'warning'
    test_details JSONB DEFAULT '{}',
    test_score INTEGER CHECK (test_score >= 0 AND test_score <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les violations de headers
CREATE TABLE IF NOT EXISTS security_headers_violations (
    id SERIAL PRIMARY KEY,
    violation_type VARCHAR(50) NOT NULL, -- 'csp', 'hsts', 'xss', 'clickjacking'
    source_url VARCHAR(255),
    blocked_url VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    violation_details JSONB DEFAULT '{}',
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    resolved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

-- Données initiales réalistes
INSERT INTO security_headers_config (environment, config_name, csp_config, hsts_config, x_frame_options, x_content_type_options, x_xss_protection, referrer_policy, permissions_policy) VALUES
('development', 'Configuration de développement', 
 '{"enabled": true, "directives": {"default-src": ["''self''"], "script-src": ["''self''", "''unsafe-inline''"], "style-src": ["''self''", "''unsafe-inline''"], "img-src": ["''self''", "data:", "https:"], "connect-src": ["''self''", "ws:", "wss:"]}}',
 '{"enabled": false, "maxAge": 31536000, "includeSubDomains": false, "preload": false}',
 'SAMEORIGIN', 'nosniff', '1; mode=block', 'strict-origin-when-cross-origin',
 '{"camera": [], "microphone": [], "geolocation": [], "payment": []}'),

('production', 'Configuration de production',
 '{"enabled": true, "directives": {"default-src": ["''self''"], "script-src": ["''self''"], "style-src": ["''self''"], "img-src": ["''self''", "https:"], "connect-src": ["''self''"], "font-src": ["''self''"], "object-src": ["''none''"], "base-uri": ["''self''"], "form-action": ["''self''"]}}',
 '{"enabled": true, "maxAge": 31536000, "includeSubDomains": true, "preload": true}',
 'DENY', 'nosniff', '1; mode=block', 'strict-origin-when-cross-origin',
 '{"camera": [], "microphone": [], "geolocation": [], "payment": []}');

INSERT INTO security_headers_tests (config_id, test_type, test_url, test_result, test_details, test_score) VALUES
(1, 'csp', 'http://localhost:8080', 'pass', '{"violations": 0, "warnings": 1}', 95),
(1, 'hsts', 'http://localhost:8080', 'fail', '{"reason": "not_https"}', 0),
(1, 'xss', 'http://localhost:8080', 'pass', '{"protection": "enabled"}', 100),
(1, 'clickjacking', 'http://localhost:8080', 'pass', '{"frame_options": "SAMEORIGIN"}', 90),
(2, 'csp', 'https://example.com', 'pass', '{"violations": 0, "warnings": 0}', 100),
(2, 'hsts', 'https://example.com', 'pass', '{"max_age": 31536000}', 100);

INSERT INTO security_headers_violations (violation_type, source_url, blocked_url, user_agent, ip_address, violation_details, severity) VALUES
('csp', 'http://localhost:8080', 'http://malicious-site.com/script.js', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100', '{"directive": "script-src", "blocked_uri": "http://malicious-site.com/script.js"}', 'high'),
('xss', 'http://localhost:8080', 'http://localhost:8080/search?q=<script>alert(1)</script>', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.101', '{"attempted_injection": "script", "blocked": true}', 'medium');

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_security_headers_config_environment ON security_headers_config(environment);
CREATE INDEX IF NOT EXISTS idx_security_headers_config_active ON security_headers_config(is_active);
CREATE INDEX IF NOT EXISTS idx_security_headers_history_config_id ON security_headers_history(config_id);
CREATE INDEX IF NOT EXISTS idx_security_headers_history_environment ON security_headers_history(environment);
CREATE INDEX IF NOT EXISTS idx_security_headers_tests_config_id ON security_headers_tests(config_id);
CREATE INDEX IF NOT EXISTS idx_security_headers_tests_result ON security_headers_tests(test_result);
CREATE INDEX IF NOT EXISTS idx_security_headers_violations_type ON security_headers_violations(violation_type);
CREATE INDEX IF NOT EXISTS idx_security_headers_violations_severity ON security_headers_violations(severity);
CREATE INDEX IF NOT EXISTS idx_security_headers_violations_resolved ON security_headers_violations(resolved);
