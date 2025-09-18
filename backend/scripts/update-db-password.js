#!/usr/bin/env node

// ===================================================================
// SCRIPT DE MISE À JOUR DU MOT DE PASSE BASE DE DONNÉES
// Permet de changer le mot de passe de la base de données de manière sécurisée
// ===================================================================

const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
function loadConfigEnv() {
  const configPath = path.join(__dirname, '..', 'config.env');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf8');
    const lines = configContent.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key.trim()] = value.trim();
        }
      }
    }
  }
}

loadConfigEnv();

// Configuration de connexion avec l'ancien mot de passe
const oldPool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: 'Fethi@2025!', // Ancien mot de passe
  ssl: process.env.DB_SSL === 'true' ? { 
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  } : false,
});

// Nouveau mot de passe sécurisé
const newPassword = 'Fethi@2025!SecureDB';

async function updateDatabasePassword() {
  let client;
  
  try {
    console.log('🔐 Connexion à la base de données avec l\'ancien mot de passe...');
    client = await oldPool.connect();
    
    console.log('✅ Connexion réussie !');
    console.log('🔄 Mise à jour du mot de passe utilisateur...');
    
    // Mettre à jour le mot de passe de l'utilisateur
    await client.query('ALTER USER vpshostinger PASSWORD $1', [newPassword]);
    
    console.log('✅ Mot de passe utilisateur mis à jour avec succès !');
    
    // Tester la nouvelle connexion
    console.log('🧪 Test de la nouvelle connexion...');
    
    const newPool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: newPassword,
      ssl: process.env.DB_SSL === 'true' ? { 
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      } : false,
    });
    
    const newClient = await newPool.connect();
    console.log('✅ Nouvelle connexion réussie !');
    
    // Test d'une requête simple
    const result = await newClient.query('SELECT version()');
    console.log('✅ Test de requête réussi !');
    console.log('📊 Version PostgreSQL:', result.rows[0].version);
    
    newClient.release();
    await newPool.end();
    
    console.log('\n🎉 Mise à jour du mot de passe terminée avec succès !');
    console.log('📝 Le nouveau mot de passe est maintenant actif dans la base de données.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du mot de passe:', error.message);
    
    if (error.code === '28P01') {
      console.error('\n💡 Solutions possibles:');
      console.error('1. Vérifiez que l\'ancien mot de passe est correct');
      console.error('2. Vérifiez que l\'utilisateur a les permissions ALTER USER');
      console.error('3. Contactez l\'administrateur de la base de données');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await oldPool.end();
  }
}

// Fonction pour générer un mot de passe sécurisé
function generateSecurePassword() {
  const length = 16;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // S'assurer qu'il y a au moins un caractère de chaque type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Majuscule
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minuscule
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Chiffre
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Symbole
  
  // Remplir le reste
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Mélanger le mot de passe
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Exécution
if (process.argv.includes('--generate')) {
  const securePassword = generateSecurePassword();
  console.log('🔐 Mot de passe sécurisé généré:');
  console.log(securePassword);
  console.log('\n💡 Utilisez ce mot de passe pour remplacer la variable newPassword dans ce script.');
} else {
  updateDatabasePassword();
}
