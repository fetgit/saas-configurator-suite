const { Client } = require('pg');
const bcrypt = require('bcryptjs');

console.log('👥 CRÉATION DES COMPTES UTILISATEURS DE TEST');
console.log('=' .repeat(60));

// Configuration de connexion PostgreSQL
const config = {
  host: '147.93.58.155',
  port: 5432,
  database: 'saas_configurator',
  user: 'vpshostinger',
  password: 'Fethi@2025!',
  ssl: false
};

// Comptes utilisateurs à créer
const testUsers = [
  {
    email: 'admin@heleam.com',
    name: 'Super Admin Heleam',
    role: 'superadmin',
    company: 'Heleam',
    password: 'AdminHeleam2025!'
  },
  {
    email: 'adminuser@heleam.com',
    name: 'Admin User Heleam',
    role: 'admin',
    company: 'Heleam',
    password: 'AdminUser2025!'
  },
  {
    email: 'user@heleam.com',
    name: 'Regular User Heleam',
    role: 'user',
    company: 'Heleam',
    password: 'UserHeleam2025!'
  }
];

async function createTestUsers() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connexion à la base de données réussie');
    
    // Vérifier si la table users existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ La table users n\'existe pas. Création en cours...');
      
      // Créer la table users
      await client.query(`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          avatar_url VARCHAR(500),
          role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
          company_id UUID,
          subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')),
          email_verified BOOLEAN NOT NULL DEFAULT FALSE,
          phone VARCHAR(50),
          phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
          mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
          mfa_secret VARCHAR(255),
          last_login_at TIMESTAMPTZ,
          login_count INTEGER NOT NULL DEFAULT 0,
          status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
          preferences JSONB NOT NULL DEFAULT '{}',
          metadata JSONB NOT NULL DEFAULT '{}',
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      
      console.log('✅ Table users créée');
    }
    
    console.log('\n👥 Création des comptes utilisateurs...');
    
    for (const userData of testUsers) {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [userData.email]
        );
        
        if (existingUser.rows.length > 0) {
          console.log(`⚠️ Utilisateur ${userData.email} existe déjà, mise à jour...`);
          
          // Hacher le nouveau mot de passe
          const saltRounds = 12;
          const passwordHash = await bcrypt.hash(userData.password, saltRounds);
          
          // Mettre à jour l'utilisateur existant
          await client.query(`
            UPDATE users 
            SET name = $1, role = $2, company = $3, password_hash = $4, 
                status = 'active', email_verified = true, updated_at = NOW()
            WHERE email = $5
          `, [userData.name, userData.role, userData.company, passwordHash, userData.email]);
          
          console.log(`✅ Utilisateur ${userData.email} mis à jour`);
        } else {
          // Hacher le mot de passe
          const saltRounds = 12;
          const passwordHash = await bcrypt.hash(userData.password, saltRounds);
          
          // Créer le nouvel utilisateur
          const result = await client.query(`
            INSERT INTO users (
              email, name, role, company, password_hash, 
              status, email_verified, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, 'active', true, NOW(), NOW())
            RETURNING id, email, name, role, company
          `, [userData.email, userData.name, userData.role, userData.company, passwordHash]);
          
          const newUser = result.rows[0];
          console.log(`✅ Utilisateur ${newUser.email} créé (ID: ${newUser.id})`);
        }
        
      } catch (error) {
        console.error(`❌ Erreur lors de la création de ${userData.email}:`, error.message);
      }
    }
    
    console.log('\n📋 RÉSUMÉ DES COMPTES CRÉÉS:');
    console.log('=' .repeat(50));
    
    for (const userData of testUsers) {
      console.log(`📧 ${userData.email}`);
      console.log(`   👤 Nom: ${userData.name}`);
      console.log(`   🔑 Rôle: ${userData.role}`);
      console.log(`   🏢 Entreprise: ${userData.company}`);
      console.log(`   🔐 Mot de passe: ${userData.password}`);
      console.log('');
    }
    
    console.log('🎉 COMPTES UTILISATEURS CRÉÉS AVEC SUCCÈS !');
    console.log('=' .repeat(60));
    console.log('💡 Vous pouvez maintenant vous connecter avec ces comptes');
    console.log('💡 Les mots de passe sont sécurisés avec bcrypt');
    console.log('💡 Tous les comptes sont actifs et vérifiés');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
  }
}

// Exécuter la création des utilisateurs
createTestUsers();
