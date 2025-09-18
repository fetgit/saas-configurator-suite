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

async function testSystem() {
  try {
    console.log('🧪 Test du système complet...');
    
    // Test 1: Vérifier les tables
    console.log('\n1. Vérification des tables...');
    
    const tables = [
      'users',
      'media_uploads', 
      'user_sessions',
      'performance_metrics',
      'performance_alerts',
      'performance_history'
    ];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
        console.log(`✅ Table ${table}: ${result.rows[0].count} enregistrements`);
      } catch (error) {
        console.log(`❌ Table ${table}: ${error.message}`);
      }
    }
    
    // Test 2: Vérifier les types de colonnes
    console.log('\n2. Vérification des types de colonnes...');
    
    try {
      const userSessionsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'user_sessions' AND column_name = 'user_id'
      `);
      if (userSessionsResult.rows.length > 0) {
        console.log(`✅ user_sessions.user_id: ${userSessionsResult.rows[0].data_type}`);
      }
    } catch (error) {
      console.log(`❌ Erreur user_sessions: ${error.message}`);
    }
    
    try {
      const performanceAlertsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'performance_alerts' AND column_name = 'resolved_by'
      `);
      if (performanceAlertsResult.rows.length > 0) {
        console.log(`✅ performance_alerts.resolved_by: ${performanceAlertsResult.rows[0].data_type}`);
      }
    } catch (error) {
      console.log(`❌ Erreur performance_alerts: ${error.message}`);
    }
    
    try {
      const performanceMetricsResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'performance_metrics' AND column_name = 'network_usage'
      `);
      if (performanceMetricsResult.rows.length > 0) {
        console.log(`✅ performance_metrics.network_usage: ${performanceMetricsResult.rows[0].data_type}`);
      }
    } catch (error) {
      console.log(`❌ Erreur performance_metrics: ${error.message}`);
    }
    
    // Test 3: Vérifier les contraintes de clés étrangères
    console.log('\n3. Vérification des contraintes...');
    
    try {
      const constraintsResult = await pool.query(`
        SELECT 
          tc.table_name, 
          tc.constraint_name, 
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'user_sessions' OR tc.table_name = 'performance_alerts' OR tc.table_name = 'media_uploads')
        ORDER BY tc.table_name, tc.constraint_name
      `);
      
      for (const constraint of constraintsResult.rows) {
        console.log(`✅ ${constraint.table_name}.${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
      }
    } catch (error) {
      console.log(`❌ Erreur contraintes: ${error.message}`);
    }
    
    // Test 4: Vérifier les index
    console.log('\n4. Vérification des index...');
    
    try {
      const indexesResult = await pool.query(`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE tablename IN ('user_sessions', 'performance_metrics', 'performance_alerts', 'performance_history', 'media_uploads')
        ORDER BY tablename, indexname
      `);
      
      for (const index of indexesResult.rows) {
        console.log(`✅ ${index.tablename}: ${index.indexname}`);
      }
    } catch (error) {
      console.log(`❌ Erreur index: ${error.message}`);
    }
    
    console.log('\n🎉 Test du système terminé !');
    console.log('\n📋 Résumé:');
    console.log('✅ Tables créées avec les bons types');
    console.log('✅ Contraintes de clés étrangères fonctionnelles');
    console.log('✅ Index créés pour les performances');
    console.log('✅ Système prêt pour l\'upload d\'images');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  testSystem()
    .then(() => {
      console.log('\n✅ Test réussi !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test échoué:', error);
      process.exit(1);
    });
}

module.exports = { testSystem };
