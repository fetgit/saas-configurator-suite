-- ===================================================================
-- CRÉATION DE LA TABLE POUR LES SECURITY HEADERS
-- ===================================================================

-- Table pour stocker les configurations des Security Headers
CREATE TABLE IF NOT EXISTS admin_security_headers_config (
    id SERIAL PRIMARY KEY,
    environment VARCHAR(20) NOT NULL UNIQUE,
    csp JSONB NOT NULL DEFAULT '{}',
    hsts JSONB NOT NULL DEFAULT '{}',
    x_frame_options JSONB NOT NULL DEFAULT '{}',
    x_content_type_options JSONB NOT NULL DEFAULT '{}',
    x_xss_protection JSONB NOT NULL DEFAULT '{}',
    referrer_policy JSONB NOT NULL DEFAULT '{}',
    permissions_policy JSONB NOT NULL DEFAULT '{}',
    cross_origin_embedder_policy JSONB NOT NULL DEFAULT '{}',
    cross_origin_opener_policy JSONB NOT NULL DEFAULT '{}',
    cross_origin_resource_policy JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    updated_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_admin_security_headers_config_environment ON admin_security_headers_config(environment);
CREATE INDEX IF NOT EXISTS idx_admin_security_headers_config_active ON admin_security_headers_config(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_security_headers_config_created_at ON admin_security_headers_config(created_at);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_admin_security_headers_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_admin_security_headers_config_updated_at
    BEFORE UPDATE ON admin_security_headers_config
    FOR EACH ROW
    EXECUTE FUNCTION update_admin_security_headers_config_updated_at();

-- Insertion des configurations par défaut
INSERT INTO admin_security_headers_config (
    environment,
    csp,
    hsts,
    x_frame_options,
    x_content_type_options,
    x_xss_protection,
    referrer_policy,
    permissions_policy,
    cross_origin_embedder_policy,
    cross_origin_opener_policy,
    cross_origin_resource_policy,
    is_active
) VALUES (
    'development',
    '{
        "enabled": true,
        "directives": {
            "defaultSrc": ["''self''"],
            "scriptSrc": ["''self''", "''unsafe-inline''", "''unsafe-eval''", "https://cdn.jsdelivr.net"],
            "styleSrc": ["''self''", "''unsafe-inline''", "https://fonts.googleapis.com"],
            "imgSrc": ["''self''", "data:", "https:"],
            "fontSrc": ["''self''", "https://fonts.gstatic.com"],
            "connectSrc": ["''self''", "https://api.example.com"],
            "mediaSrc": ["''self''"],
            "objectSrc": ["''none''"],
            "childSrc": ["''self''"],
            "frameSrc": ["''self''"],
            "workerSrc": ["''self''"],
            "manifestSrc": ["''self''"],
            "formAction": ["''self''"],
            "frameAncestors": ["''none''"],
            "baseUri": ["''self''"],
            "upgradeInsecureRequests": [],
            "blockAllMixedContent": []
        },
        "reportOnly": false
    }',
    '{
        "enabled": true,
        "maxAge": 31536000,
        "includeSubDomains": true,
        "preload": true
    }',
    '{
        "enabled": true,
        "action": "deny"
    }',
    '{
        "enabled": true
    }',
    '{
        "enabled": true
    }',
    '{
        "enabled": true,
        "policy": "strict-origin-when-cross-origin"
    }',
    '{
        "enabled": true,
        "policies": {
            "camera": [],
            "microphone": [],
            "geolocation": [],
            "payment": [],
            "usb": [],
            "accelerometer": [],
            "gyroscope": [],
            "magnetometer": [],
            "ambientLightSensor": [],
            "autoplay": ["''self''"],
            "encryptedMedia": ["''self''"],
            "fullscreen": ["''self''"],
            "pictureInPicture": ["''self''"]
        }
    }',
    '{
        "enabled": true,
        "policy": "require-corp"
    }',
    '{
        "enabled": true,
        "policy": "same-origin"
    }',
    '{
        "enabled": true,
        "policy": "same-origin"
    }',
    true
) ON CONFLICT (environment) DO NOTHING;

INSERT INTO admin_security_headers_config (
    environment,
    csp,
    hsts,
    x_frame_options,
    x_content_type_options,
    x_xss_protection,
    referrer_policy,
    permissions_policy,
    cross_origin_embedder_policy,
    cross_origin_opener_policy,
    cross_origin_resource_policy,
    is_active
) VALUES (
    'production',
    '{
        "enabled": true,
        "directives": {
            "defaultSrc": ["''self''"],
            "scriptSrc": ["''self''", "https://cdn.jsdelivr.net"],
            "styleSrc": ["''self''", "https://fonts.googleapis.com"],
            "imgSrc": ["''self''", "data:", "https:"],
            "fontSrc": ["''self''", "https://fonts.gstatic.com"],
            "connectSrc": ["''self''", "https://api.example.com"],
            "mediaSrc": ["''self''"],
            "objectSrc": ["''none''"],
            "childSrc": ["''self''"],
            "frameSrc": ["''self''"],
            "workerSrc": ["''self''"],
            "manifestSrc": ["''self''"],
            "formAction": ["''self''"],
            "frameAncestors": ["''none''"],
            "baseUri": ["''self''"],
            "upgradeInsecureRequests": [],
            "blockAllMixedContent": []
        },
        "reportOnly": false
    }',
    '{
        "enabled": true,
        "maxAge": 31536000,
        "includeSubDomains": true,
        "preload": true
    }',
    '{
        "enabled": true,
        "action": "deny"
    }',
    '{
        "enabled": true
    }',
    '{
        "enabled": true
    }',
    '{
        "enabled": true,
        "policy": "strict-origin-when-cross-origin"
    }',
    '{
        "enabled": true,
        "policies": {
            "camera": [],
            "microphone": [],
            "geolocation": [],
            "payment": [],
            "usb": [],
            "accelerometer": [],
            "gyroscope": [],
            "magnetometer": [],
            "ambientLightSensor": [],
            "autoplay": ["''self''"],
            "encryptedMedia": ["''self''"],
            "fullscreen": ["''self''"],
            "pictureInPicture": ["''self''"]
        }
    }',
    '{
        "enabled": true,
        "policy": "require-corp"
    }',
    '{
        "enabled": true,
        "policy": "same-origin"
    }',
    '{
        "enabled": true,
        "policy": "same-origin"
    }',
    true
) ON CONFLICT (environment) DO NOTHING;

-- Commentaires sur la table
COMMENT ON TABLE admin_security_headers_config IS 'Configuration des headers de sécurité HTTP pour différents environnements';
COMMENT ON COLUMN admin_security_headers_config.environment IS 'Environnement (development, production, staging)';
COMMENT ON COLUMN admin_security_headers_config.csp IS 'Configuration Content Security Policy (JSON)';
COMMENT ON COLUMN admin_security_headers_config.hsts IS 'Configuration HTTP Strict Transport Security (JSON)';
COMMENT ON COLUMN admin_security_headers_config.x_frame_options IS 'Configuration X-Frame-Options (JSON)';
COMMENT ON COLUMN admin_security_headers_config.x_content_type_options IS 'Configuration X-Content-Type-Options (JSON)';
COMMENT ON COLUMN admin_security_headers_config.x_xss_protection IS 'Configuration X-XSS-Protection (JSON)';
COMMENT ON COLUMN admin_security_headers_config.referrer_policy IS 'Configuration Referrer-Policy (JSON)';
COMMENT ON COLUMN admin_security_headers_config.permissions_policy IS 'Configuration Permissions-Policy (JSON)';
COMMENT ON COLUMN admin_security_headers_config.cross_origin_embedder_policy IS 'Configuration Cross-Origin-Embedder-Policy (JSON)';
COMMENT ON COLUMN admin_security_headers_config.cross_origin_opener_policy IS 'Configuration Cross-Origin-Opener-Policy (JSON)';
COMMENT ON COLUMN admin_security_headers_config.cross_origin_resource_policy IS 'Configuration Cross-Origin-Resource-Policy (JSON)';
COMMENT ON COLUMN admin_security_headers_config.is_active IS 'Indique si la configuration est active';
COMMENT ON COLUMN admin_security_headers_config.created_by IS 'ID de l''utilisateur qui a créé la configuration';
COMMENT ON COLUMN admin_security_headers_config.updated_by IS 'ID de l''utilisateur qui a mis à jour la configuration';
