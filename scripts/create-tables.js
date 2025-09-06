const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de connexion
const config = {
  host: '147.93.58.155',
  port: 5432,
  database: 'saas_configurator',
  user: 'vpshostinger',
  password: 'Fethi@2025!',
  ssl: false
};

async function createTables() {
  const client = new Client(config);
  
  try {
    console.log('🔄 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    console.log('🔄 Lecture du fichier SQL...');
    const sqlFile = path.join(__dirname, 'create-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🔄 Exécution du script SQL...');
    await client.query(sql);
    
    console.log('✅ Tables créées avec succès !');
    
    // Vérification des tables créées
    console.log('\n🔄 Vérification des tables créées...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'admin_%'
      ORDER BY table_name
    `);
    
    console.log('📋 Tables créées :');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // Test d'insertion
    console.log('\n🔄 Test d\'insertion de données...');
    const testResult = await client.query(`
      SELECT COUNT(*) as count FROM admin_database_config
    `);
    console.log(`✅ ${testResult.rows[0].count} configuration(s) de base de données trouvée(s)`);
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
    console.log('\n🎉 Script terminé !');
  }
}

createTables();
