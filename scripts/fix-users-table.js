const { Client } = require('pg');

console.log('🔧 CORRECTION DE LA TABLE USERS');
console.log('=' .repeat(50));

// Configuration de connexion PostgreSQL
const config = {
  host: '147.93.58.155',
  port: 5432,
  database: 'saas_configurator',
  user: 'vpshostinger',
  password: 'Fethi@2025!',
  ssl: false
};

async function fixUsersTable() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier la structure actuelle de la table users
    console.log('\n🔍 Vérification de la structure de la table users...');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);
    
    console.log('📋 Colonnes actuelles:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Vérifier si password_hash existe
    const hasPasswordHash = columns.rows.some(col => col.column_name === 'password_hash');
    
    if (!hasPasswordHash) {
      console.log('\n➕ Ajout de la colonne password_hash...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN password_hash VARCHAR(255);
      `);
      console.log('✅ Colonne password_hash ajoutée');
    } else {
      console.log('✅ Colonne password_hash existe déjà');
    }
    
    // Vérifier si company_id existe, sinon ajouter company
    const hasCompanyId = columns.rows.some(col => col.column_name === 'company_id');
    const hasCompany = columns.rows.some(col => col.column_name === 'company');
    
    if (!hasCompany && !hasCompanyId) {
      console.log('\n➕ Ajout de la colonne company...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN company VARCHAR(255);
      `);
      console.log('✅ Colonne company ajoutée');
    } else {
      console.log('✅ Colonne company/company_id existe déjà');
    }
    
    // Vérifier si status existe
    const hasStatus = columns.rows.some(col => col.column_name === 'status');
    
    if (!hasStatus) {
      console.log('\n➕ Ajout de la colonne status...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification'));
      `);
      console.log('✅ Colonne status ajoutée');
    } else {
      console.log('✅ Colonne status existe déjà');
    }
    
    // Vérifier si email_verified existe
    const hasEmailVerified = columns.rows.some(col => col.column_name === 'email_verified');
    
    if (!hasEmailVerified) {
      console.log('\n➕ Ajout de la colonne email_verified...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN email_verified BOOLEAN DEFAULT false;
      `);
      console.log('✅ Colonne email_verified ajoutée');
    } else {
      console.log('✅ Colonne email_verified existe déjà');
    }
    
    // Vérifier si mfa_enabled existe
    const hasMfaEnabled = columns.rows.some(col => col.column_name === 'mfa_enabled');
    
    if (!hasMfaEnabled) {
      console.log('\n➕ Ajout de la colonne mfa_enabled...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN mfa_enabled BOOLEAN DEFAULT false;
      `);
      console.log('✅ Colonne mfa_enabled ajoutée');
    } else {
      console.log('✅ Colonne mfa_enabled existe déjà');
    }
    
    // Vérifier si last_login_at existe
    const hasLastLoginAt = columns.rows.some(col => col.column_name === 'last_login_at');
    
    if (!hasLastLoginAt) {
      console.log('\n➕ Ajout de la colonne last_login_at...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN last_login_at TIMESTAMPTZ;
      `);
      console.log('✅ Colonne last_login_at ajoutée');
    } else {
      console.log('✅ Colonne last_login_at existe déjà');
    }
    
    // Vérifier si login_count existe
    const hasLoginCount = columns.rows.some(col => col.column_name === 'login_count');
    
    if (!hasLoginCount) {
      console.log('\n➕ Ajout de la colonne login_count...');
      await client.query(`
        ALTER TABLE users 
        ADD COLUMN login_count INTEGER DEFAULT 0;
      `);
      console.log('✅ Colonne login_count ajoutée');
    } else {
      console.log('✅ Colonne login_count existe déjà');
    }
    
    console.log('\n🎉 TABLE USERS CORRIGÉE AVEC SUCCÈS !');
    console.log('=' .repeat(50));
    console.log('✅ Toutes les colonnes nécessaires sont présentes');
    console.log('✅ La table est prête pour l\'authentification JWT');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

// Exécuter la correction
fixUsersTable();
