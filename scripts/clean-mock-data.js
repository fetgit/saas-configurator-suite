const { Client } = require('pg');

// Configuration de connexion
const config = {
  host: '147.93.58.155',
  port: 5432,
  database: 'saas_configurator',
  user: 'vpshostinger',
  password: 'Fethi@2025!',
  ssl: false
};

async function cleanMockData() {
  const client = new Client(config);
  
  try {
    console.log('🧹 Nettoyage des données mockées (garde les connexions)');
    console.log('=' .repeat(70));
    
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // Tables à nettoyer (garder les configurations de connexion)
    const tablesToClean = [
      'users', 'subscriptions', 'invoices', 'posts', 'comments',
      'communities', 'community_memberships', 'support_tickets', 'ticket_messages',
      'audit_logs', 'security_events', 'api_keys', 'data_exports', 'attachments',
      'email_templates', 'email_campaigns', 'webhooks', 'webhook_deliveries',
      'backup_jobs', 'feature_flags', 'system_settings', 'user_events', 'mfa_devices',
      'subscription_plans'
    ];
    
    console.log('\n🗑️ Nettoyage des tables de données...');
    
    for (const table of tablesToClean) {
      try {
        // Compter avant suppression
        const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
        const countResult = await client.query(countQuery);
        const count = parseInt(countResult.rows[0].count);
        
        if (count > 0) {
          // Supprimer toutes les données
          await client.query(`DELETE FROM ${table}`);
          console.log(`   ✅ ${table}: ${count} enregistrement(s) supprimé(s)`);
        } else {
          console.log(`   📋 ${table}: Déjà vide`);
        }
        
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ❌ ${table}: Table n'existe pas`);
        } else {
          console.log(`   ❌ ${table}: Erreur - ${error.message}`);
        }
      }
    }
    
    // Nettoyer les configurations d'administration (garder seulement les connexions DB)
    console.log('\n🔧 Nettoyage des configurations d\'administration...');
    
    const adminTablesToClean = [
      'admin_chatbot_config', 'admin_system_config', 'admin_security_config',
      'admin_mailing_config', 'admin_appearance_config', 'admin_legal_config',
      'admin_community_config', 'admin_analytics_config'
    ];
    
    for (const table of adminTablesToClean) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
        const countResult = await client.query(countQuery);
        const count = parseInt(countResult.rows[0].count);
        
        if (count > 0) {
          await client.query(`DELETE FROM ${table}`);
          console.log(`   ✅ ${table}: ${count} configuration(s) supprimée(s)`);
        } else {
          console.log(`   📋 ${table}: Déjà vide`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${table}: Erreur - ${error.message}`);
      }
    }
    
    // Garder seulement la dernière configuration de base de données
    console.log('\n💾 Nettoyage de la configuration de base de données...');
    
    try {
      // Compter les configurations DB
      const countQuery = `SELECT COUNT(*) as count FROM admin_database_config`;
      const countResult = await client.query(countQuery);
      const count = parseInt(countResult.rows[0].count);
      
      if (count > 1) {
        // Garder seulement la plus récente
        const keepQuery = `
          DELETE FROM admin_database_config 
          WHERE id NOT IN (
            SELECT id FROM admin_database_config 
            ORDER BY created_at DESC 
            LIMIT 1
          )
        `;
        await client.query(keepQuery);
        console.log(`   ✅ admin_database_config: ${count - 1} configuration(s) supprimée(s), 1 gardée`);
      } else {
        console.log(`   📋 admin_database_config: ${count} configuration(s) (déjà optimisé)`);
      }
      
    } catch (error) {
      console.log(`   ❌ admin_database_config: Erreur - ${error.message}`);
    }
    
    // Réinitialiser les séquences d'auto-increment
    console.log('\n🔄 Réinitialisation des séquences...');
    
    const sequencesToReset = [
      'users_id_seq', 'subscriptions_id_seq', 'invoices_id_seq', 'posts_id_seq',
      'comments_id_seq', 'communities_id_seq', 'support_tickets_id_seq',
      'audit_logs_id_seq', 'security_events_id_seq', 'api_keys_id_seq'
    ];
    
    for (const sequence of sequencesToReset) {
      try {
        await client.query(`SELECT setval('${sequence}', 1, false)`);
        console.log(`   ✅ ${sequence}: Réinitialisée`);
      } catch (error) {
        // Ignorer les erreurs de séquences inexistantes
      }
    }
    
    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    
    let totalRecords = 0;
    let tablesWithData = 0;
    
    const allTables = [
      'users', 'subscriptions', 'invoices', 'posts', 'comments',
      'communities', 'support_tickets', 'audit_logs', 'security_events',
      'admin_database_config', 'admin_chatbot_config', 'admin_system_config',
      'admin_security_config', 'admin_mailing_config', 'admin_appearance_config',
      'admin_legal_config', 'admin_community_config', 'admin_analytics_config'
    ];
    
    for (const table of allTables) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
        const countResult = await client.query(countQuery);
        const count = parseInt(countResult.rows[0].count);
        
        if (count > 0) {
          totalRecords += count;
          tablesWithData++;
          console.log(`   📋 ${table}: ${count} enregistrement(s)`);
        }
      } catch (error) {
        // Ignorer les erreurs de tables inexistantes
      }
    }
    
    console.log('\n🎯 RÉSUMÉ DU NETTOYAGE');
    console.log('=' .repeat(70));
    console.log(`📊 Total d'enregistrements restants: ${totalRecords}`);
    console.log(`📋 Tables avec des données: ${tablesWithData}`);
    
    if (totalRecords <= 1) {
      console.log('\n✅ NETTOYAGE TERMINÉ AVEC SUCCÈS !');
      console.log('🗑️ Toutes les données mockées ont été supprimées.');
      console.log('💾 Seules les informations de connexion PostgreSQL sont conservées.');
      console.log('🚀 La base de données est maintenant propre et prête pour la production.');
    } else {
      console.log('\n⚠️ CERTAINES DONNÉES RESTENT');
      console.log('📋 Il reste des enregistrements à vérifier.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Nettoyage terminé !');
  }
}

cleanMockData();
