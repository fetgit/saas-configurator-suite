const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function fixAllTables() {
  try {
    console.log('🔧 Correction de toutes les tables...');
    
    // Supprimer les tables problématiques
    console.log('🗑️ Suppression des tables avec erreurs de types...');
    await pool.query('DROP TABLE IF EXISTS user_sessions CASCADE');
    await pool.query('DROP TABLE IF EXISTS performance_history CASCADE');
    await pool.query('DROP TABLE IF EXISTS performance_alerts CASCADE');
    await pool.query('DROP TABLE IF EXISTS performance_metrics CASCADE');
    
    // Recréer user_sessions avec UUID
    console.log('🏗️ Création de user_sessions...');
    await pool.query(`
      CREATE TABLE user_sessions (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        session_id VARCHAR(255) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        referrer TEXT,
        source VARCHAR(100),
        medium VARCHAR(100),
        campaign VARCHAR(100),
        device_type VARCHAR(50),
        browser VARCHAR(100),
        os VARCHAR(100),
        country VARCHAR(100),
        city VARCHAR(100),
        page_views INTEGER DEFAULT 1,
        session_duration INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id)
      )
    `);
    
    // Recréer performance_metrics avec network_usage
    console.log('🏗️ Création de performance_metrics...');
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
        active_connections INTEGER,
        requests_per_second INTEGER,
        total_requests INTEGER,
        network_usage DECIMAL(10,2),
        error_rate DECIMAL(5,2),
        uptime_seconds INTEGER,
        server_load DECIMAL(5,2)
      )
    `);
    
    // Recréer performance_alerts avec UUID
    console.log('🏗️ Création de performance_alerts...');
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
    
    // Recréer performance_history
    console.log('🏗️ Création de performance_history...');
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
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON user_sessions(session_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON user_sessions(created_at)');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_alerts_type ON performance_alerts(type)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_alerts_resolved ON performance_alerts(resolved)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_history_timestamp ON performance_history(timestamp)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_performance_history_period ON performance_history(period)');
    
    console.log('✅ Toutes les tables corrigées avec succès !');
    console.log('✅ Types UUID compatibles avec la table users');
    console.log('✅ Colonnes network_usage cohérentes');
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
  fixAllTables()
    .then(() => {
      console.log('\n🎉 Correction terminée avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { fixAllTables };
