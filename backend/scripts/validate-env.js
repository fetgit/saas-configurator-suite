#!/usr/bin/env node

// ===================================================================
// SCRIPT DE VALIDATION DES VARIABLES D'ENVIRONNEMENT
// Vérifie que toutes les variables critiques sont définies et sécurisées
// ===================================================================

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement depuis config.env
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

// Charger la configuration
loadConfigEnv();

// Variables critiques requises
const REQUIRED_VARS = [
  'DB_HOST',
  'DB_PORT', 
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
  'ENCRYPTION_IV'
];

// Variables avec des valeurs par défaut dangereuses
const DANGEROUS_DEFAULTS = [
  'dev_jwt_secret_key_12345',
  'dev_refresh_secret_key_12345',
  'dev_encryption_key_32_characters',
  'dev_iv_16_chars',
  'password',
  'admin',
  'test'
];

function validateEnvironment() {
  console.log('🔍 Validation des variables d\'environnement...\n');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Vérifier les variables requises
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    
    if (!value) {
      console.error(`❌ ERREUR: Variable ${varName} manquante`);
      hasErrors = true;
      continue;
    }
    
    // Vérifier les valeurs dangereuses
    if (DANGEROUS_DEFAULTS.includes(value)) {
      console.error(`❌ ERREUR: Variable ${varName} utilise une valeur par défaut dangereuse`);
      hasErrors = true;
      continue;
    }
    
    // Vérifications spécifiques
    if (varName.includes('SECRET') || varName.includes('KEY')) {
      if (value.length < 32) {
        console.error(`❌ ERREUR: Variable ${varName} trop courte (minimum 32 caractères)`);
        hasErrors = true;
        continue;
      }
      
      // Vérifier la complexité
      if (!/[a-f0-9]{32,}/i.test(value) && !/^sk_|^pk_|^whsec_/.test(value)) {
        console.warn(`⚠️  ATTENTION: Variable ${varName} pourrait être plus complexe`);
        hasWarnings = true;
      }
    }
    
    if (varName === 'DB_PASSWORD') {
      if (value.length < 12) {
        console.error(`❌ ERREUR: Mot de passe base de données trop court (minimum 12 caractères)`);
        hasErrors = true;
        continue;
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
        console.warn(`⚠️  ATTENTION: Mot de passe base de données pourrait être plus complexe`);
        hasWarnings = true;
      }
    }
    
    console.log(`✅ ${varName}: OK`);
  }
  
  // Vérifier NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ NODE_ENV: Production');
    
    // Vérifications supplémentaires pour la production
    if (process.env.CORS_ORIGIN === 'http://localhost:8080') {
      console.error('❌ ERREUR: CORS_ORIGIN pointe vers localhost en production');
      hasErrors = true;
    }
    
    if (process.env.DB_SSL !== 'true') {
      console.error('❌ ERREUR: DB_SSL doit être activé en production');
      hasErrors = true;
    }
  } else {
    console.log('ℹ️  NODE_ENV: Développement');
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.error('❌ VALIDATION ÉCHOUÉE - Variables d\'environnement non sécurisées');
    console.error('\n📋 Actions requises:');
    console.error('1. Définissez toutes les variables manquantes');
    console.error('2. Remplacez les valeurs par défaut par des secrets forts');
    console.error('3. Utilisez des mots de passe complexes');
    console.error('4. Activez SSL en production');
    process.exit(1);
  } else if (hasWarnings) {
    console.warn('⚠️  VALIDATION RÉUSSIE AVEC ATTENTIONS');
    console.warn('\n📋 Recommandations:');
    console.warn('1. Renforcez la complexité des secrets');
    console.warn('2. Utilisez des mots de passe plus complexes');
  } else {
    console.log('✅ VALIDATION RÉUSSIE - Variables d\'environnement sécurisées');
  }
  
  console.log('\n🔐 Score de sécurité: ' + (hasErrors ? '0/10' : hasWarnings ? '7/10' : '10/10'));
}

// Fonction pour générer des secrets sécurisés
function generateSecureSecrets() {
  console.log('\n🔧 Génération de secrets sécurisés:');
  console.log('JWT_SECRET=' + crypto.randomBytes(64).toString('hex'));
  console.log('JWT_REFRESH_SECRET=' + crypto.randomBytes(64).toString('hex'));
  console.log('ENCRYPTION_KEY=' + crypto.randomBytes(32).toString('hex'));
  console.log('ENCRYPTION_IV=' + crypto.randomBytes(16).toString('hex'));
  console.log('\n💡 Copiez ces valeurs dans votre fichier .env');
}

// Exécution
if (process.argv.includes('--generate')) {
  generateSecureSecrets();
} else {
  validateEnvironment();
}
