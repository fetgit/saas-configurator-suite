-- ===================================================================
-- TABLES POUR LE SYSTÈME DE MONITORING
-- ===================================================================

-- Table pour les services système
CREATE TABLE IF NOT EXISTS system_services (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    service_type VARCHAR(50) NOT NULL, -- 'web', 'database', 'cache', 'email', 'storage'
    status VARCHAR(20) NOT NULL, -- 'healthy', 'warning', 'error', 'down'
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uptime_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    response_time_ms INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les alertes système
CREATE TABLE IF NOT EXISTS system_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(50) NOT NULL, -- 'cpu', 'memory', 'disk', 'network', 'service'
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    message TEXT NOT NULL,
    service_name VARCHAR(100),
    threshold_value DECIMAL(10,2),
    current_value DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'acknowledged'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    acknowledged_at TIMESTAMP NULL,
    acknowledged_by UUID REFERENCES users(id)
);

-- Table pour l'historique des métriques système
CREATE TABLE IF NOT EXISTS system_metrics_history (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL, -- 'cpu', 'memory', 'disk', 'network', 'connections'
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'percent', 'bytes', 'count', 'ms'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    service_name VARCHAR(100),
    metadata JSONB DEFAULT '{}'
);

-- Table pour les événements système
CREATE TABLE IF NOT EXISTS system_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'startup', 'shutdown', 'restart', 'error', 'warning'
    service_name VARCHAR(100),
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'critical'
    details JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données initiales réalistes
INSERT INTO system_services (service_name, service_type, status, uptime_percentage, response_time_ms, error_count, details) VALUES
('Serveur Web', 'web', 'healthy', 99.9, 45, 0, '{"port": 3003, "version": "1.0.0"}'),
('Base de données', 'database', 'healthy', 99.8, 12, 0, '{"host": "147.93.58.155", "port": 5432}'),
('Cache Redis', 'cache', 'healthy', 99.9, 2, 0, '{"memory_usage": "45MB"}'),
('Service Email', 'email', 'warning', 98.5, 120, 3, '{"smtp_status": "slow"}'),
('Stockage Fichiers', 'storage', 'healthy', 99.7, 25, 0, '{"disk_usage": "65%"}');

INSERT INTO system_alerts (alert_type, severity, message, service_name, threshold_value, current_value, status) VALUES
('memory', 'medium', 'Utilisation mémoire élevée', 'Serveur Web', 80.0, 85.2, 'active'),
('disk', 'low', 'Espace disque faible', 'Stockage Fichiers', 90.0, 88.5, 'resolved'),
('response_time', 'high', 'Temps de réponse élevé', 'Service Email', 100.0, 120.0, 'active');

INSERT INTO system_metrics_history (metric_type, value, unit, service_name, metadata) VALUES
('cpu', 25.5, 'percent', 'Serveur Web', '{"core": "all"}'),
('memory', 45.2, 'percent', 'Serveur Web', '{"type": "ram"}'),
('disk', 60.8, 'percent', 'Stockage Fichiers', '{"partition": "/"}'),
('network', 75.3, 'percent', 'Serveur Web', '{"interface": "eth0"}'),
('connections', 125, 'count', 'Base de données', '{"type": "active"}');

INSERT INTO system_events (event_type, service_name, message, severity, details) VALUES
('startup', 'Serveur Web', 'Serveur démarré avec succès', 'info', '{"port": 3003}'),
('restart', 'Cache Redis', 'Redémarrage automatique effectué', 'warning', '{"reason": "memory_cleanup"}'),
('error', 'Service Email', 'Erreur de connexion SMTP', 'error', '{"error_code": "ECONNREFUSED"}'),
('warning', 'Base de données', 'Connexions élevées détectées', 'warning', '{"connection_count": 95}');

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_system_services_status ON system_services(status);
CREATE INDEX IF NOT EXISTS idx_system_services_last_check ON system_services(last_check);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_history_timestamp ON system_metrics_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_metrics_history_metric_type ON system_metrics_history(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_events_timestamp ON system_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON system_events(severity);
