const { Client } = require('pg');

console.log('🗄️ Création automatique de la base de données');
console.log('=' .repeat(60));

// Configuration par défaut
const defaultConfig = {
  host: '147.93.58.155',
  port: 5432,
  database: 'saas_configurator',
  user: 'vpshostinger',
  password: 'Fethi@2025!',
  ssl: false
};

async function createDatabaseIfNotExists(config) {
  console.log('\n🔍 Vérification de la base de données...');
  
  // Connexion au serveur PostgreSQL (sans base spécifique)
  const serverClient = new Client({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: 'postgres', // Connexion à la DB par défaut
    ssl: config.ssl
  });

  try {
    await serverClient.connect();
    console.log('✅ Connexion au serveur PostgreSQL réussie');

    // Vérifier si la base de données existe
    const dbCheckQuery = `
      SELECT 1 FROM pg_database WHERE datname = $1
    `;
    const dbResult = await serverClient.query(dbCheckQuery, [config.database]);

    if (dbResult.rows.length === 0) {
      console.log(`📋 Base de données '${config.database}' n'existe pas, création en cours...`);
      
      // Créer la base de données
      const createDbQuery = `CREATE DATABASE "${config.database}"`;
      await serverClient.query(createDbQuery);
      console.log(`✅ Base de données '${config.database}' créée avec succès`);
    } else {
      console.log(`✅ Base de données '${config.database}' existe déjà`);
    }

    await serverClient.end();

    // Maintenant se connecter à la nouvelle base de données
    const dbClient = new Client({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      ssl: config.ssl
    });

    await dbClient.connect();
    console.log(`✅ Connexion à la base '${config.database}' réussie`);

    // Créer les extensions si elles n'existent pas
    console.log('\n🔧 Création des extensions PostgreSQL...');
    const extensions = ['uuid-ossp', 'pg_trgm'];
    
    for (const extension of extensions) {
      try {
        await dbClient.query(`CREATE EXTENSION IF NOT EXISTS "${extension}"`);
        console.log(`✅ Extension '${extension}' créée/vérifiée`);
      } catch (error) {
        console.log(`⚠️ Extension '${extension}': ${error.message}`);
      }
    }

    // Vérifier si les tables existent
    console.log('\n📋 Vérification des tables...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    const tablesResult = await dbClient.query(tablesQuery);
    const existingTables = tablesResult.rows.map(row => row.table_name);

    console.log(`📊 Tables existantes: ${existingTables.length}`);
    if (existingTables.length > 0) {
      console.log(`   📋 ${existingTables.join(', ')}`);
    }

    if (existingTables.length === 0) {
      console.log('\n🏗️ Création des tables...');
      
      // Lire et exécuter le script de création des tables
      const fs = require('fs');
      const path = require('path');
      
      try {
        const createTablesPath = path.join(__dirname, 'create-tables.sql');
        const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
        
        await dbClient.query(createTablesSQL);
        console.log('✅ Tables créées avec succès');
      } catch (error) {
        console.log(`⚠️ Erreur lors de la création des tables: ${error.message}`);
      }
    } else {
      console.log('✅ Tables existent déjà');
    }

    await dbClient.end();
    
    console.log('\n🎉 Base de données prête !');
    return true;

  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    return false;
  }
}

// Fonction pour tester avec de nouvelles configurations
async function testWithNewConfig(newConfig) {
  console.log('\n🧪 Test avec nouvelle configuration...');
  console.log(`📍 Host: ${newConfig.host}`);
  console.log(`📍 Port: ${newConfig.port}`);
  console.log(`📍 Database: ${newConfig.database}`);
  console.log(`📍 User: ${newConfig.user}`);
  
  const success = await createDatabaseIfNotExists(newConfig);
  
  if (success) {
    console.log('\n✅ Nouvelle configuration testée avec succès !');
    console.log('💡 Vous pouvez maintenant utiliser ces paramètres dans l\'application.');
  } else {
    console.log('\n❌ Échec de la nouvelle configuration');
    console.log('💡 Vérifiez les paramètres de connexion.');
  }
  
  return success;
}

// Exemple d'utilisation
async function main() {
  console.log('📋 Options disponibles:');
  console.log('1. Tester avec la configuration par défaut');
  console.log('2. Tester avec une nouvelle configuration');
  console.log('3. Quitter');
  
  // Pour l'instant, testons avec la config par défaut
  console.log('\n🔧 Test avec la configuration par défaut...');
  await createDatabaseIfNotExists(defaultConfig);
  
  // Exemple de nouvelle configuration
  const newConfig = {
    host: 'localhost',
    port: 5432,
    database: 'ma_nouvelle_db',
    user: 'mon_utilisateur',
    password: 'mon_mot_de_passe',
    ssl: false
  };
  
  console.log('\n💡 Pour tester avec une nouvelle configuration:');
  console.log('   Modifiez les paramètres dans le script et relancez-le');
  console.log('   Ou utilisez l\'interface admin pour changer les paramètres');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createDatabaseIfNotExists, testWithNewConfig };
