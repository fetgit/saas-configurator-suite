const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de la base de données
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'saas_configurator',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function setupPricingDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Démarrage de la configuration de la base de données des tarifs...');
    
    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'create-pricing-tables.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Exécuter le script SQL
    console.log('📊 Création des tables de gestion des tarifs...');
    await client.query(sqlContent);
    
    console.log('✅ Tables de gestion des tarifs créées avec succès !');
    console.log('📋 Tables créées :');
    console.log('   - subscription_plans (plans d\'abonnement)');
    console.log('   - subscriptions (abonnements utilisateurs)');
    console.log('   - invoices (factures)');
    console.log('   - payment_methods (méthodes de paiement)');
    console.log('   - billing_settings (paramètres de facturation)');
    console.log('   - usage_metrics (métriques d\'utilisation)');
    console.log('   - discount_codes (codes de réduction)');
    console.log('   - discount_redemptions (utilisations des codes)');
    
    console.log('🔒 Politiques RLS configurées pour la sécurité');
    console.log('📈 Vues et fonctions utilitaires créées');
    console.log('💾 Plans par défaut insérés : Starter, Pro, Enterprise');
    
    // Vérifier que les tables ont été créées
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'subscription_plans', 'subscriptions', 'invoices', 
        'payment_methods', 'billing_settings', 'usage_metrics',
        'discount_codes', 'discount_redemptions'
      )
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tables vérifiées :');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });
    
    // Vérifier les plans par défaut
    const plansResult = await client.query(`
      SELECT name, tier, price_monthly, price_yearly, is_active 
      FROM subscription_plans 
      ORDER BY price_monthly;
    `);
    
    console.log('\n💰 Plans par défaut :');
    plansResult.rows.forEach(plan => {
      const monthlyPrice = (plan.price_monthly / 100).toFixed(2);
      const yearlyPrice = (plan.price_yearly / 100).toFixed(2);
      const status = plan.is_active ? '✅ Actif' : '❌ Inactif';
      console.log(`   ${status} ${plan.name} (${plan.tier}) - ${monthlyPrice}€/mois, ${yearlyPrice}€/an`);
    });
    
    // Vérifier les paramètres de facturation
    const settingsResult = await client.query(`
      SELECT key, value 
      FROM billing_settings 
      ORDER BY key;
    `);
    
    console.log('\n⚙️ Paramètres de facturation :');
    settingsResult.rows.forEach(setting => {
      console.log(`   ${setting.key}: ${setting.value}`);
    });
    
    console.log('\n🎉 Configuration terminée avec succès !');
    console.log('🔗 Vous pouvez maintenant accéder à /admin/pricing pour gérer les tarifs');
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error.message);
    console.error('Stack trace :', error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Exécuter le script
if (require.main === module) {
  setupPricingDatabase().catch(console.error);
}

module.exports = { setupPricingDatabase };
