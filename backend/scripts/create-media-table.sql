-- Création de la table media_uploads pour stocker les images uploadées
CREATE TABLE IF NOT EXISTS media_uploads (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    category VARCHAR(50) DEFAULT 'general', -- hero, logo, favicon, etc.
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_media_uploads_category ON media_uploads(category);
CREATE INDEX IF NOT EXISTS idx_media_uploads_uploaded_by ON media_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_uploads_created_at ON media_uploads(created_at);

-- RLS (Row Level Security)
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;

-- Politique RLS : Les utilisateurs peuvent voir tous les médias
CREATE POLICY "Users can view all media" ON media_uploads
    FOR SELECT USING (true);

-- Politique RLS : Seuls les admins et superadmins peuvent uploader
CREATE POLICY "Admins can upload media" ON media_uploads
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = uploaded_by 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Politique RLS : Seuls les admins et superadmins peuvent modifier
CREATE POLICY "Admins can update media" ON media_uploads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = uploaded_by 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Politique RLS : Seuls les admins et superadmins peuvent supprimer
CREATE POLICY "Admins can delete media" ON media_uploads
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = uploaded_by 
            AND users.role IN ('admin', 'superadmin')
        )
    );

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_media_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_media_uploads_updated_at
    BEFORE UPDATE ON media_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_media_uploads_updated_at();

-- Commentaires sur la table
COMMENT ON TABLE media_uploads IS 'Table pour stocker les fichiers média uploadés (images, etc.)';
COMMENT ON COLUMN media_uploads.category IS 'Catégorie du média: hero, logo, favicon, general, etc.';
COMMENT ON COLUMN media_uploads.file_path IS 'Chemin relatif vers le fichier stocké sur le serveur';
