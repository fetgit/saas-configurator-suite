const { Client } = require('pg');

// Configuration de la base de données
const POSTGRES_CONFIG = {
  host: '147.93.58.155',
  port: 5432,
  database: 'saas_configurator',
  user: 'vpshostinger',
  password: 'Fethi@2025!',
  ssl: false
};

async function addTwoFactorColumns() {
  const client = new Client(POSTGRES_CONFIG);
  
  try {
    console.log('🔐 Ajout des colonnes 2FA à la table users...');
    
    await client.connect();
    console.log('✅ Connexion à PostgreSQL réussie');

    // Ajouter les colonnes 2FA
    const queries = [
      // Colonne pour le secret 2FA
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);`,
      
      // Colonne pour indiquer si la 2FA est activée
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;`,
      
      // Colonne pour les codes de récupération (JSON)
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes JSONB;`,
      
      // Colonne pour les codes de récupération utilisés (JSON)
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS used_backup_codes JSONB DEFAULT '[]'::jsonb;`,
      
      // Colonne pour la date d'activation de la 2FA
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_activated_at TIMESTAMP;`,
      
      // Colonne pour la date de dernière utilisation de la 2FA
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_two_factor_used TIMESTAMP;`
    ];

    for (const query of queries) {
      try {
        await client.query(query);
        console.log('✅ Requête exécutée:', query.split(' ')[2]);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('ℹ️ Colonne déjà existante:', query.split(' ')[2]);
        } else {
          console.error('❌ Erreur:', error.message);
        }
      }
    }

    // Créer un index pour améliorer les performances
    try {
      await client.query('CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled);');
      console.log('✅ Index créé pour two_factor_enabled');
    } catch (error) {
      console.log('ℹ️ Index déjà existant ou erreur:', error.message);
    }

    // Vérifier la structure de la table
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name LIKE '%two_factor%' OR column_name LIKE '%backup%'
      ORDER BY column_name;
    `);

    console.log('\n📋 Colonnes 2FA ajoutées:');
    result.rows.forEach(row => {
      console.log(`✅ ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });

    console.log('\n🎉 Colonnes 2FA ajoutées avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des colonnes 2FA:', error);
  } finally {
    await client.end();
    console.log('🔌 Connexion fermée');
  }
}

// Exécuter le script
addTwoFactorColumns().catch(console.error);
