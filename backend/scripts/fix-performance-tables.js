const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { 
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  } : false,
});

async function fixPerformanceTables() {
  try {
    console.log('🔧 Correction des tables de performance...');
    
    // Supprimer les tables existantes si elles existent
    console.log('🗑️ Suppression des anciennes tables...');
    await pool.query('DROP TABLE IF EXISTS performance_history CASCADE');
    await pool.query('DROP TABLE IF EXISTS performance_alerts CASCADE');
    await pool.query('DROP TABLE IF EXISTS performance_metrics CASCADE');
    
    // Recréer les tables avec les bons types
    console.log('🏗️ Création des nouvelles tables...');
    
    // Table pour les métriques de performance
    await pool.query(`
      CREATE TABLE performance_metrics (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        page_load_time DECIMAL(10,2),
        api_response_time DECIMAL(10,2),
        database_query_time DECIMAL(10,2),
        memory_usage DECIMAL(5,2),
        cpu_usage DECIMAL(5,2),
        disk_usage DECIMAL(5,2),
        network_usage DECIMAL(10,2),
        active_connections INTEGER,
        requests_per_second INTEGER,
        total_requests INTEGER,
        error_rate DECIMAL(5,2),
        uptime_seconds INTEGER,
        server_load DECIMAL(5,2)
      )
    `);
    
    // Table pour les alertes de performance
    await pool.query(`
      CREATE TABLE performance_alerts (
        id SERIAL PRIMARY KEY,
        alert_id VARCHAR(50) UNIQUE NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('warning', 'error', 'info')),
        message TEXT NOT NULL,
        metric_name VARCHAR(100),
        metric_value DECIMAL(10,2),
        threshold_value DECIMAL(10,2),
        resolved BOOLEAN DEFAULT FALSE,
        resolved_at TIMESTAMP,
        resolved_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Table pour l'historique des performances
    await pool.query(`
      CREATE TABLE performance_history (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        period VARCHAR(10) NOT NULL,
        page_load_time DECIMAL(10,2),
        api_response_time DECIMAL(10,2),
        memory_usage DECIMAL(5,2),
        cpu_usage DECIMAL(5,2),
        disk_usage DECIMAL(5,2),
        network_usage DECIMAL(10,2),
        active_connections INTEGER,
        requests_per_second INTEGER,
        total_requests INTEGER,
        error_rate DECIMAL(5,2),
        uptime_seconds INTEGER,
        server_load DECIMAL(5,2)
      )
    `);
    
    // Créer les index
    console.log('📊 Création des index...');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts(resolved)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_history_timestamp ON performance_history(timestamp)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_history_period ON performance_history(period)');
    
    console.log('✅ Tables de performance corrigées avec succès !');
    console.log('✅ Types UUID compatibles avec la table users');
    console.log('✅ Index créés pour optimiser les performances');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction des tables:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  fixPerformanceTables()
    .then(() => {
      console.log('\n🎉 Correction terminée avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { fixPerformanceTables };
