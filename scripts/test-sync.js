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

async function testSync() {
  const client = new Client(config);
  
  try {
    console.log('🔄 Connexion à la base de données...');
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // Test d'insertion d'une configuration de base de données
    console.log('\n🔄 Test d\'insertion d\'une configuration de base de données...');
    const dbConfig = {
      db_type: 'postgresql',
      host: '147.93.58.155',
      port: 5432,
      database_name: 'saas_configurator',
      username: 'vpshostinger',
      password_encrypted: 'encrypted_password_here',
      ssl_enabled: false,
      ssl_verify_cert: true,
      charset: 'UTF8',
      schema_name: 'public',
      timezone: 'UTC',
      extensions: ['uuid-ossp', 'pg_trgm'],
      max_connections: 50,
      connection_timeout: 30,
      query_timeout: 60,
      is_active: true,
      test_status: 'success',
      test_message: 'Connexion testée avec succès'
    };
    
    const insertQuery = `
      INSERT INTO admin_database_config (
        db_type, host, port, database_name, username, password_encrypted,
        ssl_enabled, ssl_verify_cert, charset, schema_name, timezone,
        extensions, max_connections, connection_timeout, query_timeout,
        is_active, test_status, test_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        db_type = EXCLUDED.db_type,
        host = EXCLUDED.host,
        port = EXCLUDED.port,
        database_name = EXCLUDED.database_name,
        username = EXCLUDED.username,
        password_encrypted = EXCLUDED.password_encrypted,
        ssl_enabled = EXCLUDED.ssl_enabled,
        ssl_verify_cert = EXCLUDED.ssl_verify_cert,
        charset = EXCLUDED.charset,
        schema_name = EXCLUDED.schema_name,
        timezone = EXCLUDED.timezone,
        extensions = EXCLUDED.extensions,
        max_connections = EXCLUDED.max_connections,
        connection_timeout = EXCLUDED.connection_timeout,
        query_timeout = EXCLUDED.query_timeout,
        is_active = EXCLUDED.is_active,
        test_status = EXCLUDED.test_status,
        test_message = EXCLUDED.test_message,
        updated_at = NOW()
      RETURNING id, created_at, updated_at
    `;
    
    const insertParams = [
      dbConfig.db_type,
      dbConfig.host,
      dbConfig.port,
      dbConfig.database_name,
      dbConfig.username,
      dbConfig.password_encrypted,
      dbConfig.ssl_enabled,
      dbConfig.ssl_verify_cert,
      dbConfig.charset,
      dbConfig.schema_name,
      dbConfig.timezone,
      JSON.stringify(dbConfig.extensions),
      dbConfig.max_connections,
      dbConfig.connection_timeout,
      dbConfig.query_timeout,
      dbConfig.is_active,
      dbConfig.test_status,
      dbConfig.test_message
    ];
    
    const insertResult = await client.query(insertQuery, insertParams);
    console.log('✅ Configuration de base de données insérée:', insertResult.rows[0]);
    
    // Test de lecture des configurations
    console.log('\n🔄 Test de lecture des configurations...');
    const selectQuery = 'SELECT * FROM admin_database_config WHERE is_active = true ORDER BY updated_at DESC LIMIT 1';
    const selectResult = await client.query(selectQuery);
    
    if (selectResult.rows.length > 0) {
      console.log('✅ Configuration lue avec succès:');
      console.log('   - ID:', selectResult.rows[0].id);
      console.log('   - Type:', selectResult.rows[0].db_type);
      console.log('   - Host:', selectResult.rows[0].host);
      console.log('   - Port:', selectResult.rows[0].port);
      console.log('   - Database:', selectResult.rows[0].database_name);
      console.log('   - Username:', selectResult.rows[0].username);
      console.log('   - Extensions:', selectResult.rows[0].extensions);
      console.log('   - Test Status:', selectResult.rows[0].test_status);
      console.log('   - Créé le:', selectResult.rows[0].created_at);
      console.log('   - Mis à jour le:', selectResult.rows[0].updated_at);
    } else {
      console.log('ℹ️ Aucune configuration trouvée');
    }
    
    // Test d'insertion d'une configuration de chatbot
    console.log('\n🔄 Test d\'insertion d\'une configuration de chatbot...');
    const chatbotConfig = {
      enabled: true,
      api_key_encrypted: 'encrypted_api_key_here',
      welcome_message: 'Bonjour ! Comment puis-je vous aider ?',
      max_messages: 50,
      response_delay: 1000,
      language: 'fr',
      personality: 'helpful',
      context_memory: true,
      context_duration: 30,
      auto_respond: false,
      business_hours_only: false,
      business_hours: { start: '09:00', end: '18:00', timezone: 'Europe/Paris' },
      fallback_message: 'Je ne suis pas disponible pour le moment.',
      appearance: { position: 'bottom-right', theme: 'light', primary_color: '#3b82f6' },
      behavior: { greeting_delay: 5000, auto_open: false, persistent: true },
      analytics: { track_conversations: true, track_satisfaction: true }
    };
    
    const chatbotInsertQuery = `
      INSERT INTO admin_chatbot_config (
        enabled, api_key_encrypted, welcome_message, max_messages,
        response_delay, language, personality, context_memory,
        context_duration, auto_respond, business_hours_only,
        business_hours, fallback_message, appearance, behavior, analytics
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        enabled = EXCLUDED.enabled,
        api_key_encrypted = EXCLUDED.api_key_encrypted,
        welcome_message = EXCLUDED.welcome_message,
        max_messages = EXCLUDED.max_messages,
        response_delay = EXCLUDED.response_delay,
        language = EXCLUDED.language,
        personality = EXCLUDED.personality,
        context_memory = EXCLUDED.context_memory,
        context_duration = EXCLUDED.context_duration,
        auto_respond = EXCLUDED.auto_respond,
        business_hours_only = EXCLUDED.business_hours_only,
        business_hours = EXCLUDED.business_hours,
        fallback_message = EXCLUDED.fallback_message,
        appearance = EXCLUDED.appearance,
        behavior = EXCLUDED.behavior,
        analytics = EXCLUDED.analytics,
        updated_at = NOW()
      RETURNING id, created_at, updated_at
    `;
    
    const chatbotInsertParams = [
      chatbotConfig.enabled,
      chatbotConfig.api_key_encrypted,
      chatbotConfig.welcome_message,
      chatbotConfig.max_messages,
      chatbotConfig.response_delay,
      chatbotConfig.language,
      chatbotConfig.personality,
      chatbotConfig.context_memory,
      chatbotConfig.context_duration,
      chatbotConfig.auto_respond,
      chatbotConfig.business_hours_only,
      JSON.stringify(chatbotConfig.business_hours),
      chatbotConfig.fallback_message,
      JSON.stringify(chatbotConfig.appearance),
      JSON.stringify(chatbotConfig.behavior),
      JSON.stringify(chatbotConfig.analytics)
    ];
    
    const chatbotInsertResult = await client.query(chatbotInsertQuery, chatbotInsertParams);
    console.log('✅ Configuration de chatbot insérée:', chatbotInsertResult.rows[0]);
    
    // Test de lecture des configurations de chatbot
    console.log('\n🔄 Test de lecture des configurations de chatbot...');
    const chatbotSelectQuery = 'SELECT * FROM admin_chatbot_config WHERE enabled = true ORDER BY updated_at DESC LIMIT 1';
    const chatbotSelectResult = await client.query(chatbotSelectQuery);
    
    if (chatbotSelectResult.rows.length > 0) {
      console.log('✅ Configuration de chatbot lue avec succès:');
      console.log('   - ID:', chatbotSelectResult.rows[0].id);
      console.log('   - Enabled:', chatbotSelectResult.rows[0].enabled);
      console.log('   - Welcome Message:', chatbotSelectResult.rows[0].welcome_message);
      console.log('   - Language:', chatbotSelectResult.rows[0].language);
      console.log('   - Personality:', chatbotSelectResult.rows[0].personality);
      console.log('   - Business Hours:', chatbotSelectResult.rows[0].business_hours);
      console.log('   - Appearance:', chatbotSelectResult.rows[0].appearance);
      console.log('   - Behavior:', chatbotSelectResult.rows[0].behavior);
      console.log('   - Analytics:', chatbotSelectResult.rows[0].analytics);
    } else {
      console.log('ℹ️ Aucune configuration de chatbot trouvée');
    }
    
    // Test de comptage des configurations
    console.log('\n🔄 Test de comptage des configurations...');
    const countQuery = `
      SELECT 
        (SELECT COUNT(*) FROM admin_database_config) as db_configs,
        (SELECT COUNT(*) FROM admin_chatbot_config) as chatbot_configs,
        (SELECT COUNT(*) FROM admin_system_config) as system_configs,
        (SELECT COUNT(*) FROM admin_security_config) as security_configs,
        (SELECT COUNT(*) FROM admin_mailing_config) as mailing_configs,
        (SELECT COUNT(*) FROM admin_appearance_config) as appearance_configs,
        (SELECT COUNT(*) FROM admin_legal_config) as legal_configs,
        (SELECT COUNT(*) FROM admin_community_config) as community_configs,
        (SELECT COUNT(*) FROM admin_analytics_config) as analytics_configs
    `;
    
    const countResult = await client.query(countQuery);
    const counts = countResult.rows[0];
    
    console.log('📊 Nombre de configurations par type:');
    console.log('   - Base de données:', counts.db_configs);
    console.log('   - Chatbot:', counts.chatbot_configs);
    console.log('   - Système:', counts.system_configs);
    console.log('   - Sécurité:', counts.security_configs);
    console.log('   - Mailing:', counts.mailing_configs);
    console.log('   - Apparence:', counts.appearance_configs);
    console.log('   - Légal:', counts.legal_configs);
    console.log('   - Communauté:', counts.community_configs);
    console.log('   - Analytics:', counts.analytics_configs);
    
    console.log('\n🎉 Tous les tests de synchronisation sont passés avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Script terminé !');
  }
}

testSync();
