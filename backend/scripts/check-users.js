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

async function checkUsers() {
  try {
    console.log('🔍 Vérification des utilisateurs...');
    
    const result = await pool.query(`
      SELECT id, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log(`\n📊 ${result.rows.length} utilisateur(s) trouvé(s):`);
    
    for (const user of result.rows) {
      console.log(`\n👤 Utilisateur:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Rôle: ${user.role}`);
      console.log(`   Actif: ✅ OUI (tous les utilisateurs sont actifs par défaut)`);
      console.log(`   Créé: ${user.created_at}`);
    }
    
    // Vérifier s'il y a des admins actifs
    const adminResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role IN ('admin', 'superadmin')
    `);
    
    console.log(`\n👑 Admins actifs: ${adminResult.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await pool.end();
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  checkUsers()
    .then(() => {
      console.log('\n✅ Vérification terminée !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erreur:', error);
      process.exit(1);
    });
}

module.exports = { checkUsers };
