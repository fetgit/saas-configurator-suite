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

async function setupAnalyticsDatabase() {
  try {
    console.log('🚀 Initialisation de la base de données analytics...');

    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'create-missing-analytics-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Exécuter le script SQL
    await pool.query(sql);
    console.log('✅ Tables analytics créées avec succès');

    // Vérifier que les tables existent
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name LIKE '%performance%' OR table_name LIKE '%traffic%' OR table_name LIKE '%device%' OR table_name LIKE '%location%' OR table_name LIKE '%security_events_analytics%' OR table_name LIKE '%login_stats%' OR table_name LIKE '%role_distribution%' OR table_name LIKE '%company_distribution%')
      ORDER BY table_name
    `);

    console.log('📋 Tables analytics créées :');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // Vérifier les données par défaut
    const performanceCount = await pool.query('SELECT COUNT(*) FROM performance_metrics');
    const trafficCount = await pool.query('SELECT COUNT(*) FROM traffic_stats');
    const sourcesCount = await pool.query('SELECT COUNT(*) FROM traffic_sources');
    const devicesCount = await pool.query('SELECT COUNT(*) FROM device_stats');
    const locationsCount = await pool.query('SELECT COUNT(*) FROM location_stats');
    const securityCount = await pool.query('SELECT COUNT(*) FROM security_events_analytics');
    const loginCount = await pool.query('SELECT COUNT(*) FROM login_stats');

    console.log('📊 Données par défaut :');
    console.log(`  - Métriques de performance: ${performanceCount.rows[0].count}`);
    console.log(`  - Statistiques de trafic: ${trafficCount.rows[0].count}`);
    console.log(`  - Sources de trafic: ${sourcesCount.rows[0].count}`);
    console.log(`  - Statistiques d'appareils: ${devicesCount.rows[0].count}`);
    console.log(`  - Statistiques de localisation: ${locationsCount.rows[0].count}`);
    console.log(`  - Événements de sécurité: ${securityCount.rows[0].count}`);
    console.log(`  - Statistiques de connexion: ${loginCount.rows[0].count}`);

    console.log('🎉 Base de données analytics initialisée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données analytics:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  setupAnalyticsDatabase()
    .then(() => {
      console.log('✅ Script terminé avec succès');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

module.exports = { setupAnalyticsDatabase };
