const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../config.env') });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function setupMediaTable() {
  try {
    console.log('🚀 Création de la table media_uploads...');
    
    // Lire le fichier SQL
    const sqlFile = path.join(__dirname, 'create-media-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Exécuter le SQL
    await pool.query(sql);
    
    console.log('✅ Table media_uploads créée avec succès !');
    console.log('✅ RLS (Row Level Security) configuré !');
    console.log('✅ Politiques de sécurité créées !');
    console.log('✅ Index et triggers configurés !');
    
    // Vérifier la création
    const result = await pool.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'media_uploads' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Structure de la table media_uploads:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Vérifier les politiques RLS
    const policies = await pool.query(`
      SELECT policyname, cmd, qual 
      FROM pg_policies 
      WHERE tablename = 'media_uploads'
    `);
    
    console.log('\n🔒 Politiques RLS configurées:');
    policies.rows.forEach(policy => {
      console.log(`  - ${policy.policyname}: ${policy.cmd}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table media_uploads:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  setupMediaTable()
    .then(() => {
      console.log('\n🎉 Configuration terminée avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { setupMediaTable };
