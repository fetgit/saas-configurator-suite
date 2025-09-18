-- ===================================================================
-- TABLES POUR LE SYSTÈME DE CHATBOT
-- ===================================================================

-- Table pour les conversations du chatbot
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'ended', 'transferred'
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les messages du chatbot
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    message_type VARCHAR(20) NOT NULL, -- 'user', 'bot', 'system'
    content TEXT NOT NULL,
    intent VARCHAR(100), -- 'greeting', 'support', 'billing', 'technical', 'other'
    confidence DECIMAL(5,2), -- Niveau de confiance de l'IA
    response_time_ms INTEGER, -- Temps de réponse en millisecondes
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les statistiques du chatbot
CREATE TABLE IF NOT EXISTS chatbot_stats (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    total_conversations INTEGER NOT NULL DEFAULT 0,
    active_conversations INTEGER NOT NULL DEFAULT 0,
    total_messages INTEGER NOT NULL DEFAULT 0,
    average_response_time DECIMAL(10,2) NOT NULL DEFAULT 0,
    satisfaction_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    resolution_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour les intents les plus fréquents
CREATE TABLE IF NOT EXISTS chatbot_intents (
    id SERIAL PRIMARY KEY,
    intent_name VARCHAR(100) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table pour la configuration du chatbot
CREATE TABLE IF NOT EXISTS chatbot_config (
    id SERIAL PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    welcome_message TEXT DEFAULT 'Bonjour ! Comment puis-je vous aider aujourd''hui ?',
    fallback_message TEXT DEFAULT 'Je ne comprends pas votre demande. Pouvez-vous reformuler ?',
    max_conversation_duration INTEGER DEFAULT 1800, -- 30 minutes en secondes
    auto_transfer_threshold INTEGER DEFAULT 3, -- Nombre de messages avant transfert
    language VARCHAR(10) DEFAULT 'fr',
    personality VARCHAR(50) DEFAULT 'helpful',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Données initiales réalistes
INSERT INTO chatbot_config (enabled, welcome_message, fallback_message, language, personality) VALUES
(true, 'Bonjour ! Comment puis-je vous aider aujourd''hui ?', 'Je ne comprends pas votre demande. Pouvez-vous reformuler ?', 'fr', 'helpful');

INSERT INTO chatbot_stats (date, total_conversations, active_conversations, total_messages, average_response_time, satisfaction_rate, resolution_rate) VALUES
(CURRENT_DATE, 750, 35, 3500, 1.8, 87.5, 92.3),
(CURRENT_DATE - INTERVAL '1 day', 680, 28, 3200, 1.9, 85.2, 89.7),
(CURRENT_DATE - INTERVAL '2 days', 720, 42, 3400, 1.7, 88.1, 91.5);

INSERT INTO chatbot_intents (intent_name, count, percentage, date) VALUES
('greeting', 150, 25.0, CURRENT_DATE),
('support', 120, 20.0, CURRENT_DATE),
('billing', 90, 15.0, CURRENT_DATE),
('technical', 80, 13.3, CURRENT_DATE),
('other', 160, 26.7, CURRENT_DATE);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_started_at ON chatbot_conversations(started_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_timestamp ON chatbot_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_intent ON chatbot_messages(intent);
CREATE INDEX IF NOT EXISTS idx_chatbot_stats_date ON chatbot_stats(date);
CREATE INDEX IF NOT EXISTS idx_chatbot_intents_date ON chatbot_intents(date);
