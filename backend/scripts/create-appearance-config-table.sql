-- Table pour stocker les configurations d'apparence
CREATE TABLE IF NOT EXISTS appearance_configs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    config_type VARCHAR(50) NOT NULL DEFAULT 'global', -- 'global', 'user', 'company'
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activer RLS
ALTER TABLE appearance_configs ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité
-- Les administrateurs peuvent tout faire
CREATE POLICY admin_all_access ON appearance_configs
FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = user_id AND (role = 'admin' OR role = 'superadmin')))
WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = user_id AND (role = 'admin' OR role = 'superadmin')));

-- Les utilisateurs peuvent voir les configs globales et leurs propres configs
CREATE POLICY users_view_access ON appearance_configs
FOR SELECT
USING (
    config_type = 'global' OR 
    user_id = current_setting('app.current_user_id', true)::uuid OR
    EXISTS (SELECT 1 FROM users WHERE id = user_id AND (role = 'admin' OR role = 'superadmin'))
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_appearance_configs_user_id ON appearance_configs (user_id);
CREATE INDEX IF NOT EXISTS idx_appearance_configs_type ON appearance_configs (config_type);
CREATE INDEX IF NOT EXISTS idx_appearance_configs_active ON appearance_configs (is_active);

-- Trigger pour mettre à jour 'updated_at'
CREATE OR REPLACE FUNCTION update_appearance_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_appearance_configs_updated_at ON appearance_configs;
CREATE TRIGGER update_appearance_configs_updated_at
BEFORE UPDATE ON appearance_configs
FOR EACH ROW
EXECUTE FUNCTION update_appearance_configs_updated_at();

-- Insérer une configuration globale par défaut
INSERT INTO appearance_configs (user_id, config_type, config_data, is_active) 
VALUES (
    NULL, -- Configuration globale
    'global',
    '{
        "colors": {
            "primary": "#3b82f6",
            "primaryLight": "#60a5fa",
            "primaryDark": "#2563eb",
            "secondary": "#f1f5f9",
            "success": "#10b981",
            "warning": "#f59e0b",
            "destructive": "#ef4444"
        },
        "branding": {
            "companyName": "SaaS Template",
            "logoUrl": "",
            "faviconUrl": "",
            "heroTitle": "Transformez votre entreprise avec notre SaaS",
            "heroSubtitle": "Une solution complète et personnalisable pour faire évoluer votre activité"
        },
        "layout": {
            "headerStyle": "default",
            "footerStyle": "complete",
            "sidebarPosition": "left",
            "borderRadius": "0.5rem",
            "theme": "light"
        },
        "heroConfig": {
            "showHero": true,
            "backgroundType": "color",
            "backgroundImage": "",
            "backgroundColor": "#3b82f6",
            "layout": "centered"
        },
        "featuresConfig": {
            "title": "Fonctionnalités puissantes pour votre entreprise",
            "description": "Découvrez toutes les fonctionnalités qui font de notre SaaS la solution complète pour moderniser votre entreprise.",
            "ctaText": "Essayer gratuitement",
            "ctaSecondary": "Voir les tarifs",
            "features": {
                "customization": {
                    "title": "Personnalisation complète",
                    "description": "Thèmes, couleurs, logos personnalisables",
                    "icon": "Palette",
                    "enabled": true
                },
                "security": {
                    "title": "Sécurité avancée",
                    "description": "2FA, gestion des rôles, conformité",
                    "icon": "Shield",
                    "enabled": true
                },
                "multiLanguage": {
                    "title": "Multi-langue",
                    "description": "Support 4 langues, traductions complètes",
                    "icon": "Globe",
                    "enabled": true
                },
                "database": {
                    "title": "Base de données",
                    "description": "MySQL, migrations, monitoring",
                    "icon": "Database",
                    "enabled": true
                },
                "userManagement": {
                    "title": "Gestion utilisateurs",
                    "description": "Rôles, permissions, profils",
                    "icon": "Users",
                    "enabled": true
                },
                "analytics": {
                    "title": "Analytics",
                    "description": "Tableaux de bord, rapports, métriques",
                    "icon": "BarChart3",
                    "enabled": true
                }
            }
        }
    }'::jsonb,
    true
) ON CONFLICT DO NOTHING;
