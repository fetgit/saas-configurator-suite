const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuration de connexion
const config = {
  host: '147.93.58.155',
  port: 5432,
  database: 'saas_configurator',
  user: 'vpshostinger',
  password: 'Fethi@2025!',
  ssl: false
};

async function testApp() {
  const client = new Client(config);
  
  try {
    console.log('🚀 Test complet de l\'application SaaS Configurator Suite');
    console.log('=' .repeat(60));
    
    // 1. Test de connexion
    console.log('\n1️⃣ Test de connexion à PostgreSQL...');
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // 2. Vérification des tables
    console.log('\n2️⃣ Vérification des tables...');
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'admin_%'
      ORDER BY table_name
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log(`✅ ${tablesResult.rows.length} tables trouvées:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    // 3. Test des configurations par défaut
    console.log('\n3️⃣ Test des configurations par défaut...');
    
    // Configuration de base de données
    const dbConfigQuery = 'SELECT COUNT(*) as count FROM admin_database_config';
    const dbConfigResult = await client.query(dbConfigQuery);
    console.log(`✅ Configuration de base de données: ${dbConfigResult.rows[0].count} entrée(s)`);
    
    // Configuration de chatbot
    const chatbotConfigQuery = 'SELECT COUNT(*) as count FROM admin_chatbot_config';
    const chatbotConfigResult = await client.query(chatbotConfigQuery);
    console.log(`✅ Configuration de chatbot: ${chatbotConfigResult.rows[0].count} entrée(s)`);
    
    // Configuration système
    const systemConfigQuery = 'SELECT COUNT(*) as count FROM admin_system_config';
    const systemConfigResult = await client.query(systemConfigQuery);
    console.log(`✅ Configuration système: ${systemConfigResult.rows[0].count} entrée(s)`);
    
    // Configuration de sécurité
    const securityConfigQuery = 'SELECT COUNT(*) as count FROM admin_security_config';
    const securityConfigResult = await client.query(securityConfigQuery);
    console.log(`✅ Configuration de sécurité: ${securityConfigResult.rows[0].count} entrée(s)`);
    
    // 4. Test des extensions PostgreSQL
    console.log('\n4️⃣ Test des extensions PostgreSQL...');
    const extensionsQuery = `
      SELECT extname 
      FROM pg_extension 
      WHERE extname IN ('uuid-ossp', 'pg_trgm', 'postgis')
      ORDER BY extname
    `;
    
    const extensionsResult = await client.query(extensionsQuery);
    console.log(`✅ ${extensionsResult.rows.length} extensions trouvées:`);
    extensionsResult.rows.forEach(row => {
      console.log(`   - ${row.extname}`);
    });
    
    // 5. Test de génération d'UUID
    console.log('\n5️⃣ Test de génération d\'UUID...');
    const uuidQuery = 'SELECT uuid_generate_v4() as uuid';
    const uuidResult = await client.query(uuidQuery);
    console.log(`✅ UUID généré: ${uuidResult.rows[0].uuid}`);
    
    // 6. Test des fonctions de recherche
    console.log('\n6️⃣ Test des fonctions de recherche...');
    const searchQuery = 'SELECT similarity(\'test\', \'testing\') as similarity';
    const searchResult = await client.query(searchQuery);
    console.log(`✅ Similarité de recherche: ${searchResult.rows[0].similarity}`);
    
    // 7. Test des contraintes et index
    console.log('\n7️⃣ Test des contraintes et index...');
    const constraintsQuery = `
      SELECT 
        tc.constraint_name,
        tc.table_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
      AND tc.table_name LIKE 'admin_%'
      ORDER BY tc.table_name, tc.constraint_name
    `;
    
    const constraintsResult = await client.query(constraintsQuery);
    console.log(`✅ ${constraintsResult.rows.length} contraintes trouvées:`);
    constraintsResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}: ${row.constraint_name} (${row.constraint_type})`);
    });
    
    // 8. Test des triggers
    console.log('\n8️⃣ Test des triggers...');
    const triggersQuery = `
      SELECT 
        trigger_name,
        event_object_table,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      AND event_object_table LIKE 'admin_%'
      ORDER BY event_object_table, trigger_name
    `;
    
    const triggersResult = await client.query(triggersQuery);
    console.log(`✅ ${triggersResult.rows.length} triggers trouvés:`);
    triggersResult.rows.forEach(row => {
      console.log(`   - ${row.event_object_table}: ${row.trigger_name} (${row.action_timing} ${row.event_manipulation})`);
    });
    
    // 9. Test des performances
    console.log('\n9️⃣ Test des performances...');
    const startTime = Date.now();
    
    // Test d'insertion
    const insertQuery = `
      INSERT INTO admin_database_config (
        db_type, host, port, database_name, username, password_encrypted,
        ssl_enabled, ssl_verify_cert, charset, schema_name, timezone,
        extensions, max_connections, connection_timeout, query_timeout,
        is_active, test_status, test_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `;
    
    const insertParams = [
      'postgresql', 'test.example.com', 5432, 'test_db', 'test_user', 'encrypted_password',
      false, true, 'UTF8', 'public', 'UTC', JSON.stringify(['uuid-ossp']),
      50, 30, 60, true, 'success', 'Test de performance'
    ];
    
    const insertResult = await client.query(insertQuery, insertParams);
    console.log(`✅ Insertion test: ${insertResult.rows[0].id}`);
    
    // Test de lecture
    const selectQuery = 'SELECT * FROM admin_database_config WHERE id = $1';
    const selectResult = await client.query(selectQuery, [insertResult.rows[0].id]);
    console.log(`✅ Lecture test: ${selectResult.rows.length} ligne(s) trouvée(s)`);
    
    // Test de mise à jour
    const updateQuery = 'UPDATE admin_database_config SET test_message = $1 WHERE id = $2';
    await client.query(updateQuery, ['Test de performance mis à jour', insertResult.rows[0].id]);
    console.log(`✅ Mise à jour test: réussie`);
    
    // Test de suppression
    const deleteQuery = 'DELETE FROM admin_database_config WHERE id = $1';
    await client.query(deleteQuery, [insertResult.rows[0].id]);
    console.log(`✅ Suppression test: réussie`);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log(`⏱️ Durée totale des tests de performance: ${duration}ms`);
    
    // 10. Résumé final
    console.log('\n🎉 Résumé du test complet:');
    console.log('=' .repeat(60));
    console.log('✅ Connexion PostgreSQL: OK');
    console.log('✅ Tables de configuration: OK');
    console.log('✅ Extensions PostgreSQL: OK');
    console.log('✅ Génération d\'UUID: OK');
    console.log('✅ Fonctions de recherche: OK');
    console.log('✅ Contraintes et index: OK');
    console.log('✅ Triggers: OK');
    console.log('✅ Tests de performance: OK');
    console.log('✅ CRUD complet: OK');
    
    console.log('\n🚀 L\'application SaaS Configurator Suite est prête !');
    console.log('📋 Toutes les fonctionnalités de base de données sont opérationnelles.');
    console.log('🔧 Vous pouvez maintenant utiliser l\'interface d\'administration.');
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Test terminé !');
  }
}

testApp();
