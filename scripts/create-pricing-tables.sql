-- ===================================================================
-- SCRIPT DE CRÉATION DES TABLES DE GESTION DES TARIFS
-- ===================================================================

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- TABLE: subscription_plans
-- ===================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50) NOT NULL CHECK (tier IN ('free', 'basic', 'premium', 'enterprise')),
    price_monthly INTEGER NOT NULL, -- Amount in cents
    price_yearly INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
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

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_subscription_plans_tier ON subscription_plans(tier);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_created_at ON subscription_plans(created_at);

-- ===================================================================
-- TABLE: subscriptions
-- ===================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
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
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    tax_rate DECIMAL(5,4),
    discount_id VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);

-- ===================================================================
-- TABLE: invoices
-- ===================================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    stripe_invoice_id VARCHAR(255),
    invoice_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    amount_due INTEGER NOT NULL,
    amount_paid INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    tax_rate DECIMAL(5,4),
    tax_amount INTEGER NOT NULL DEFAULT 0,
    subtotal INTEGER NOT NULL,
    total INTEGER NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    hosted_invoice_url TEXT,
    invoice_pdf TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- ===================================================================
-- TABLE: payment_methods
-- ===================================================================

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_method_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('card', 'bank_account', 'sepa_debit')),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    bank_name VARCHAR(255),
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_payment_method_id ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

-- ===================================================================
-- TABLE: billing_settings
-- ===================================================================

CREATE TABLE IF NOT EXISTS billing_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_billing_settings_key ON billing_settings(key);

-- ===================================================================
-- TABLE: usage_metrics
-- ===================================================================

CREATE TABLE IF NOT EXISTS usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL,
    metric_value INTEGER NOT NULL DEFAULT 0,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_subscription_id ON usage_metrics(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_metric_name ON usage_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_period ON usage_metrics(period_start, period_end);

-- ===================================================================
-- TABLE: discount_codes
-- ===================================================================

CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('percentage', 'fixed_amount')),
    value INTEGER NOT NULL, -- Percentage (0-100) or amount in cents
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    max_redemptions INTEGER,
    times_redeemed INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    applicable_plans JSONB NOT NULL DEFAULT '[]', -- Array of plan IDs
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_is_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_codes_valid_period ON discount_codes(valid_from, valid_until);

-- ===================================================================
-- TABLE: discount_redemptions
-- ===================================================================

CREATE TABLE IF NOT EXISTS discount_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discount_code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount_saved INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_discount_code_id ON discount_redemptions(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_user_id ON discount_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_subscription_id ON discount_redemptions(subscription_id);

-- ===================================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ===================================================================

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à toutes les tables
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_billing_settings_updated_at BEFORE UPDATE ON billing_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_metrics_updated_at BEFORE UPDATE ON usage_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- POLITIQUES RLS (ROW LEVEL SECURITY)
-- ===================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_redemptions ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- POLITIQUES POUR subscription_plans
-- ===================================================================

-- Les plans sont visibles par tous les utilisateurs authentifiés
CREATE POLICY "subscription_plans_select_policy" ON subscription_plans
    FOR SELECT
    TO authenticated
    USING (true);

-- Seuls les admins peuvent modifier les plans
CREATE POLICY "subscription_plans_modify_policy" ON subscription_plans
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===================================================================
-- POLITIQUES POUR subscriptions
-- ===================================================================

-- Les utilisateurs peuvent voir leurs propres abonnements
CREATE POLICY "subscriptions_select_policy" ON subscriptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Les admins peuvent voir tous les abonnements
CREATE POLICY "subscriptions_admin_select_policy" ON subscriptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Les utilisateurs peuvent créer leurs propres abonnements
CREATE POLICY "subscriptions_insert_policy" ON subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Seuls les admins peuvent modifier les abonnements
CREATE POLICY "subscriptions_modify_policy" ON subscriptions
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===================================================================
-- POLITIQUES POUR invoices
-- ===================================================================

-- Les utilisateurs peuvent voir leurs propres factures
CREATE POLICY "invoices_select_policy" ON invoices
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM subscriptions 
            WHERE subscriptions.id = invoices.subscription_id 
            AND subscriptions.user_id = auth.uid()
        )
    );

-- Les admins peuvent voir toutes les factures
CREATE POLICY "invoices_admin_select_policy" ON invoices
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Seuls les admins peuvent modifier les factures
CREATE POLICY "invoices_modify_policy" ON invoices
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===================================================================
-- POLITIQUES POUR payment_methods
-- ===================================================================

-- Les utilisateurs peuvent voir leurs propres méthodes de paiement
CREATE POLICY "payment_methods_select_policy" ON payment_methods
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Les utilisateurs peuvent gérer leurs propres méthodes de paiement
CREATE POLICY "payment_methods_modify_policy" ON payment_methods
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- ===================================================================
-- POLITIQUES POUR billing_settings
-- ===================================================================

-- Seuls les admins peuvent accéder aux paramètres de facturation
CREATE POLICY "billing_settings_policy" ON billing_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===================================================================
-- POLITIQUES POUR usage_metrics
-- ===================================================================

-- Les utilisateurs peuvent voir leurs propres métriques
CREATE POLICY "usage_metrics_select_policy" ON usage_metrics
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Les admins peuvent voir toutes les métriques
CREATE POLICY "usage_metrics_admin_select_policy" ON usage_metrics
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Seuls les admins peuvent modifier les métriques
CREATE POLICY "usage_metrics_modify_policy" ON usage_metrics
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===================================================================
-- POLITIQUES POUR discount_codes
-- ===================================================================

-- Les codes de réduction actifs sont visibles par tous
CREATE POLICY "discount_codes_select_policy" ON discount_codes
    FOR SELECT
    TO authenticated
    USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- Les admins peuvent voir tous les codes
CREATE POLICY "discount_codes_admin_select_policy" ON discount_codes
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Seuls les admins peuvent modifier les codes
CREATE POLICY "discount_codes_modify_policy" ON discount_codes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===================================================================
-- POLITIQUES POUR discount_redemptions
-- ===================================================================

-- Les utilisateurs peuvent voir leurs propres rédactions
CREATE POLICY "discount_redemptions_select_policy" ON discount_redemptions
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Les admins peuvent voir toutes les rédactions
CREATE POLICY "discount_redemptions_admin_select_policy" ON discount_redemptions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Seuls les admins peuvent modifier les rédactions
CREATE POLICY "discount_redemptions_modify_policy" ON discount_redemptions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- ===================================================================
-- DONNÉES INITIALES
-- ===================================================================

-- Insérer des plans par défaut
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, description, features, limits, is_active) VALUES
(
    'Starter',
    'basic',
    2900, -- 29€
    29000, -- 290€ (remise de 20%)
    'Parfait pour les petites équipes qui commencent',
    '[
        {"name": "Jusqu''à 10 utilisateurs", "included": true},
        {"name": "1 base de données", "included": true},
        {"name": "Support email", "included": true},
        {"name": "Stockage 10GB", "included": true},
        {"name": "API basique", "included": true},
        {"name": "Sauvegardes quotidiennes", "included": true}
    ]',
    '{
        "users": 10,
        "storage": 10240,
        "api_calls": 10000,
        "email_sends": 1000
    }',
    true
),
(
    'Pro',
    'premium',
    7900, -- 79€
    79000, -- 790€ (remise de 20%)
    'Idéal pour les entreprises en croissance',
    '[
        {"name": "Jusqu''à 100 utilisateurs", "included": true},
        {"name": "Bases de données illimitées", "included": true},
        {"name": "Support prioritaire", "included": true},
        {"name": "Stockage 100GB", "included": true},
        {"name": "API complète", "included": true},
        {"name": "Sauvegardes en temps réel", "included": true},
        {"name": "Personnalisation avancée", "included": true},
        {"name": "Intégrations tierces", "included": true},
        {"name": "Analytics détaillées", "included": true}
    ]',
    '{
        "users": 100,
        "storage": 102400,
        "api_calls": 100000,
        "email_sends": 10000
    }',
    true
),
(
    'Enterprise',
    'enterprise',
    19900, -- 199€
    199000, -- 1990€ (remise de 20%)
    'Solution complète pour les grandes organisations',
    '[
        {"name": "Utilisateurs illimités", "included": true},
        {"name": "Infrastructure dédiée", "included": true},
        {"name": "Support 24/7", "included": true},
        {"name": "Stockage illimité", "included": true},
        {"name": "API complète + webhooks", "included": true},
        {"name": "Sauvegardes continues", "included": true},
        {"name": "Personnalisation complète", "included": true},
        {"name": "Intégrations sur mesure", "included": true},
        {"name": "Analytics avancées", "included": true},
        {"name": "SLA 99.9%", "included": true},
        {"name": "Formation dédiée", "included": true},
        {"name": "Gestionnaire de compte", "included": true}
    ]',
    '{
        "users": -1,
        "storage": -1,
        "api_calls": -1,
        "email_sends": -1
    }',
    true
);

-- Insérer des paramètres de facturation par défaut
INSERT INTO billing_settings (key, value, description) VALUES
('default_currency', '"EUR"', 'Devise par défaut pour la facturation'),
('default_trial_days', '14', 'Période d''essai par défaut en jours'),
('auto_invoicing', 'true', 'Activer la génération automatique des factures'),
('payment_notifications', 'true', 'Activer les notifications de paiement'),
('proration_enabled', 'true', 'Activer la proration des changements de plan'),
('tax_rate', '0.20', 'Taux de TVA par défaut (20%)');

-- ===================================================================
-- VUES UTILES
-- ===================================================================

-- Vue pour les statistiques des plans
CREATE OR REPLACE VIEW plan_statistics AS
SELECT 
    sp.id,
    sp.name,
    sp.tier,
    sp.price_monthly,
    sp.price_yearly,
    sp.is_active,
    COUNT(s.id) as total_subscriptions,
    COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
    COUNT(CASE WHEN s.status = 'trialing' THEN 1 END) as trialing_subscriptions,
    SUM(CASE WHEN s.status = 'active' THEN s.amount ELSE 0 END) as monthly_revenue
FROM subscription_plans sp
LEFT JOIN subscriptions s ON sp.id = s.plan_id
GROUP BY sp.id, sp.name, sp.tier, sp.price_monthly, sp.price_yearly, sp.is_active;

-- Vue pour les métriques de revenus
CREATE OR REPLACE VIEW revenue_metrics AS
SELECT 
    DATE_TRUNC('month', s.created_at) as month,
    sp.tier,
    COUNT(s.id) as new_subscriptions,
    SUM(s.amount) as revenue,
    AVG(s.amount) as average_revenue_per_subscription
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.status = 'active'
GROUP BY DATE_TRUNC('month', s.created_at), sp.tier
ORDER BY month DESC, sp.tier;

-- ===================================================================
-- FONCTIONS UTILES
-- ===================================================================

-- Fonction pour calculer le prix annuel avec remise
CREATE OR REPLACE FUNCTION calculate_yearly_price(monthly_price INTEGER, discount_percent INTEGER DEFAULT 20)
RETURNS INTEGER AS $$
BEGIN
    RETURN ROUND(monthly_price * 12 * (1 - discount_percent / 100.0));
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier si un utilisateur peut s'abonner à un plan
CREATE OR REPLACE FUNCTION can_subscribe_to_plan(user_id UUID, plan_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    plan_tier VARCHAR(50);
    current_subscription_count INTEGER;
BEGIN
    -- Récupérer le niveau du plan
    SELECT tier INTO plan_tier FROM subscription_plans WHERE id = plan_id AND is_active = true;
    
    IF plan_tier IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Vérifier s'il y a déjà un abonnement actif
    SELECT COUNT(*) INTO current_subscription_count
    FROM subscriptions 
    WHERE subscriptions.user_id = can_subscribe_to_plan.user_id 
    AND status IN ('active', 'trialing');
    
    -- Un utilisateur ne peut avoir qu'un seul abonnement actif
    RETURN current_subscription_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- COMMENTAIRES SUR LES TABLES
-- ===================================================================

COMMENT ON TABLE subscription_plans IS 'Plans d''abonnement disponibles';
COMMENT ON TABLE subscriptions IS 'Abonnements des utilisateurs';
COMMENT ON TABLE invoices IS 'Factures générées pour les abonnements';
COMMENT ON TABLE payment_methods IS 'Méthodes de paiement des utilisateurs';
COMMENT ON TABLE billing_settings IS 'Paramètres globaux de facturation';
COMMENT ON TABLE usage_metrics IS 'Métriques d''utilisation par utilisateur';
COMMENT ON TABLE discount_codes IS 'Codes de réduction disponibles';
COMMENT ON TABLE discount_redemptions IS 'Utilisation des codes de réduction';

-- ===================================================================
-- FIN DU SCRIPT
-- ===================================================================

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Tables de gestion des tarifs créées avec succès !';
    RAISE NOTICE 'Plans par défaut insérés : Starter, Pro, Enterprise';
    RAISE NOTICE 'Politiques RLS configurées pour la sécurité';
    RAISE NOTICE 'Vues et fonctions utilitaires créées';
END $$;
