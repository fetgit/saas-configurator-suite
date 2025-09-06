// ===================================================================
// SCRIPT DE TEST DE CONNEXION POSTGRESQL
// Script pour tester la connexion à votre base PostgreSQL locale
// ===================================================================

const { Client } = require('pg');

// Configuration de connexion (adaptez selon votre setup)
const config = {
  host: 'localhost',
  port: 5432,
  database: 'postgres', // Base par défaut
  user: 'postgres',     // Utilisateur par défaut
  password: process.env.POSTGRES_PASSWORD || 'postgres', // Mot de passe depuis variable d'environnement
  ssl: false
};

// Fonction pour demander les paramètres de connexion
function getConnectionConfig() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('🔧 Configuration de connexion PostgreSQL');
    console.log('Appuyez sur Entrée pour utiliser les valeurs par défaut\n');
    
    rl.question('Host (localhost): ', (host) => {
      rl.question('Port (5432): ', (port) => {
        rl.question('Username (postgres): ', (user) => {
          rl.question('Password: ', (password) => {
            rl.close();
            resolve({
              host: host || 'localhost',
              port: parseInt(port) || 5432,
              user: user || 'postgres',
              password: password || 'postgres',
              database: 'postgres',
              ssl: false
            });
          });
        });
      });
    });
  });
}

async function testConnection(connectionConfig = config) {
  const client = new Client(connectionConfig);
  
  try {
    console.log('🔄 Tentative de connexion à PostgreSQL...');
    console.log(`📍 Host: ${connectionConfig.host}:${connectionConfig.port}`);
    console.log(`🗄️  Database: ${connectionConfig.database}`);
    console.log(`👤 User: ${connectionConfig.user}`);
    
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // Test de requête simple
    const result = await client.query('SELECT version()');
    console.log('📊 Version PostgreSQL:', result.rows[0].version);
    
    // Test de création d'une base de données pour l'application
    const dbName = 'saas_configurator';
    console.log(`\n🔄 Vérification de la base de données '${dbName}'...`);
    
    const dbCheck = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", 
      [dbName]
    );
    
    if (dbCheck.rows.length === 0) {
      console.log(`📝 Création de la base de données '${dbName}'...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de données '${dbName}' créée avec succès !`);
    } else {
      console.log(`✅ Base de données '${dbName}' existe déjà.`);
    }
    
    // Test de connexion à la nouvelle base
    console.log(`\n🔄 Test de connexion à la base '${dbName}'...`);
    await client.end();
    
    const appClient = new Client({
      ...connectionConfig,
      database: dbName
    });
    
    await appClient.connect();
    console.log(`✅ Connexion à '${dbName}' réussie !`);
    
    // Test de création des extensions
    console.log('\n🔄 Test des extensions PostgreSQL...');
    
    try {
      await appClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      console.log('✅ Extension uuid-ossp disponible');
    } catch (error) {
      console.log('⚠️  Extension uuid-ossp non disponible:', error.message);
    }
    
    try {
      await appClient.query('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
      console.log('✅ Extension pg_trgm disponible');
    } catch (error) {
      console.log('⚠️  Extension pg_trgm non disponible:', error.message);
    }
    
    // Test de génération d'UUID
    const uuidResult = await appClient.query('SELECT uuid_generate_v4() as test_uuid');
    console.log('✅ Génération d\'UUID testée:', uuidResult.rows[0].test_uuid);
    
    await appClient.end();
    
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('\n📋 Configuration recommandée pour l\'application :');
    console.log(`   Host: ${connectionConfig.host}`);
    console.log(`   Port: ${connectionConfig.port}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   Username: ${connectionConfig.user}`);
    console.log(`   Password: [votre mot de passe]`);
    console.log(`   SSL: false`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n🔧 Solutions possibles :');
    console.log('1. Vérifiez que PostgreSQL est démarré');
    console.log('2. Vérifiez les paramètres de connexion (host, port, user, password)');
    console.log('3. Vérifiez que l\'utilisateur a les permissions nécessaires');
    console.log('4. Vérifiez les paramètres de pg_hba.conf');
  }
}

// Fonction pour créer les tables de configuration
async function createConfigTables(connectionConfig = config) {
  const client = new Client({
    ...connectionConfig,
    database: 'saas_configurator'
  });
  
  try {
    console.log('\n🔄 Création des tables de configuration...');
    await client.connect();
    
    // Lire le fichier SQL
    const fs = require('fs');
    const path = require('path');
    const sqlFile = path.join(__dirname, '..', 'docs', 'ADMIN_CONFIG_TABLES.sql');
    
    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, 'utf8');
      await client.query(sql);
      console.log('✅ Tables de configuration créées avec succès !');
    } else {
      console.log('⚠️  Fichier SQL non trouvé:', sqlFile);
    }
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error.message);
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Test de connexion PostgreSQL pour SaaS Configurator Suite\n');
  
  // Demander les paramètres de connexion
  const connectionConfig = await getConnectionConfig();
  
  await testConnection(connectionConfig);
  
  // Demander si on veut créer les tables
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('\n❓ Voulez-vous créer les tables de configuration ? (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      await createConfigTables(connectionConfig);
    }
    rl.close();
  });
}

// Exécuter le script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testConnection, createConfigTables };
