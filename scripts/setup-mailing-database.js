const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  host: process.env.DB_HOST || '147.93.58.155',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'saas_configurator',
  user: process.env.DB_USER || 'vpshostinger',
  password: process.env.DB_PASSWORD || 'Fethi@2025!',
  ssl: {
    rejectUnauthorized: false
  }
});

async function setupMailingDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données mailing...');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'create-missing-mailing-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Exécuter le script SQL
    await pool.query(sql);
    console.log('✅ Tables de mailing créées avec succès');

    // Vérifier que les tables existent
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%mailing%' OR table_name LIKE '%email%' OR table_name LIKE '%campaign%' OR table_name LIKE '%contact%'
      ORDER BY table_name
    `);

    console.log('📋 Tables créées :');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Vérifier les données par défaut
    const templatesCount = await pool.query('SELECT COUNT(*) FROM email_templates');
    const listsCount = await pool.query('SELECT COUNT(*) FROM mailing_lists');
    const configCount = await pool.query('SELECT COUNT(*) FROM mailing_smtp_config');

    console.log('📊 Données par défaut :');
    console.log(`  - Templates d'emails: ${templatesCount.rows[0].count}`);
    console.log(`  - Listes de diffusion: ${listsCount.rows[0].count}`);
    console.log(`  - Configurations SMTP: ${configCount.rows[0].count}`);

    console.log('🎉 Base de données mailing initialisée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  setupMailingDatabase()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { setupMailingDatabase };
