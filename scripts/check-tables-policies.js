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

async function checkTablesAndPolicies() {
  const client = new Client(config);
  
  try {
    console.log('🔍 Vérification complète des tables et politiques PostgreSQL');
    console.log('=' .repeat(70));
    
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // 1. Vérifier toutes les tables
    console.log('\n1️⃣ Vérification des tables...');
    const tablesQuery = `
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    const tablesResult = await client.query(tablesQuery);
    console.log(`📋 Tables trouvées (${tablesResult.rows.length}):`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name} (${row.table_type})`);
    });
    
    // 2. Vérifier les politiques RLS
    console.log('\n2️⃣ Vérification des politiques RLS...');
    const policiesQuery = `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;
    const policiesResult = await client.query(policiesQuery);
    console.log(`🔐 Politiques RLS trouvées (${policiesResult.rows.length}):`);
    if (policiesResult.rows.length > 0) {
      policiesResult.rows.forEach(row => {
        console.log(`   - ${row.tablename}: ${row.policyname} (${row.cmd})`);
      });
    } else {
      console.log('   ⚠️ Aucune politique RLS trouvée');
    }
    
    // 3. Vérifier les contraintes
    console.log('\n3️⃣ Vérification des contraintes...');
    const constraintsQuery = `
      SELECT tc.table_name, tc.constraint_name, tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_type
    `;
    const constraintsResult = await client.query(constraintsQuery);
    console.log(`⚡ Contraintes trouvées (${constraintsResult.rows.length}):`);
    constraintsResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}: ${row.constraint_name} (${row.constraint_type})`);
    });
    
    // 4. Vérifier les index
    console.log('\n4️⃣ Vérification des index...');
    const indexesQuery = `
      SELECT schemaname, tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `;
    const indexesResult = await client.query(indexesQuery);
    console.log(`📊 Index trouvés (${indexesResult.rows.length}):`);
    indexesResult.rows.forEach(row => {
      console.log(`   - ${row.tablename}: ${row.indexname}`);
    });
    
    // 5. Vérifier les triggers
    console.log('\n5️⃣ Vérification des triggers...');
    const triggersQuery = `
      SELECT event_object_table, trigger_name, action_timing, event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `;
    const triggersResult = await client.query(triggersQuery);
    console.log(`🔄 Triggers trouvés (${triggersResult.rows.length}):`);
    triggersResult.rows.forEach(row => {
      console.log(`   - ${row.event_object_table}: ${row.trigger_name} (${row.action_timing} ${row.event_manipulation})`);
    });
    
    // 6. Vérifier les fonctions
    console.log('\n6️⃣ Vérification des fonctions...');
    const functionsQuery = `
      SELECT routine_name, routine_type, data_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      ORDER BY routine_name
    `;
    const functionsResult = await client.query(functionsQuery);
    console.log(`🔧 Fonctions trouvées (${functionsResult.rows.length}):`);
    functionsResult.rows.forEach(row => {
      console.log(`   - ${row.routine_name} (${row.routine_type})`);
    });
    
    // 7. Vérifier les extensions
    console.log('\n7️⃣ Vérification des extensions...');
    const extensionsQuery = `
      SELECT extname, extversion
      FROM pg_extension
      ORDER BY extname
    `;
    const extensionsResult = await client.query(extensionsQuery);
    console.log(`🧩 Extensions installées (${extensionsResult.rows.length}):`);
    extensionsResult.rows.forEach(row => {
      console.log(`   - ${row.extname} v${row.extversion}`);
    });
    
    // 8. Comparaison avec le schéma attendu
    console.log('\n8️⃣ Comparaison avec le schéma attendu...');
    const expectedTables = [
      'users', 'companies', 'subscriptions', 'invoices', 'payments',
      'support_tickets', 'data_exports', 'api_keys', 'audit_logs',
      'security_events', 'posts', 'comments', 'reactions', 'communities',
      'admin_database_config', 'admin_chatbot_config', 'admin_system_config',
      'admin_security_config', 'admin_mailing_config', 'admin_appearance_config',
      'admin_legal_config', 'admin_community_config', 'admin_analytics_config',
      'admin_configurations'
    ];
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !existingTables.includes(table));
    const extraTables = existingTables.filter(table => !expectedTables.includes(table));
    
    console.log(`📋 Tables attendues: ${expectedTables.length}`);
    console.log(`📋 Tables trouvées: ${existingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log(`❌ Tables manquantes (${missingTables.length}):`);
      missingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
    } else {
      console.log('✅ Toutes les tables attendues sont présentes');
    }
    
    if (extraTables.length > 0) {
      console.log(`➕ Tables supplémentaires (${extraTables.length}):`);
      extraTables.forEach(table => {
        console.log(`   - ${table}`);
      });
    }
    
    // 9. Résumé final
    console.log('\n🎉 RÉSUMÉ DE LA VÉRIFICATION');
    console.log('=' .repeat(70));
    console.log(`✅ Tables: ${tablesResult.rows.length} trouvées`);
    console.log(`✅ Contraintes: ${constraintsResult.rows.length} trouvées`);
    console.log(`✅ Index: ${indexesResult.rows.length} trouvés`);
    console.log(`✅ Triggers: ${triggersResult.rows.length} trouvés`);
    console.log(`✅ Fonctions: ${functionsResult.rows.length} trouvées`);
    console.log(`✅ Extensions: ${extensionsResult.rows.length} installées`);
    console.log(`🔐 Politiques RLS: ${policiesResult.rows.length} trouvées`);
    
    if (missingTables.length === 0) {
      console.log('\n🚀 TOUTES LES TABLES ET STRUCTURES SONT CRÉÉES !');
      console.log('📋 La base de données est complète et prête à l\'emploi.');
    } else {
      console.log('\n⚠️ CERTAINES TABLES MANQUENT');
      console.log('📋 Il faut créer les tables manquantes pour une base complète.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Vérification terminée !');
  }
}

checkTablesAndPolicies();
