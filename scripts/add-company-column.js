const { Client } = require('pg');

console.log('➕ AJOUT DE LA COLONNE COMPANY');
console.log('=' .repeat(40));

// Configuration de connexion PostgreSQL
const config = {
  host: '147.93.58.155',
  port: 5432,
  database: 'saas_configurator',
  user: 'vpshostinger',
  password: 'Fethi@2025!',
  ssl: false
};

async function addCompanyColumn() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Ajouter la colonne company
    console.log('\n➕ Ajout de la colonne company...');
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN company VARCHAR(255);
    `);
    console.log('✅ Colonne company ajoutée');
    
    console.log('\n🎉 COLONNE COMPANY AJOUTÉE AVEC SUCCÈS !');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Colonne company existe déjà');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  } finally {
    await client.end();
  }
}

// Exécuter l'ajout
addCompanyColumn();
