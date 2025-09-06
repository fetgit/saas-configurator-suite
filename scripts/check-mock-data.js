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

async function checkMockData() {
  const client = new Client(config);
  
  try {
    console.log('🔍 Vérification des données mockées dans PostgreSQL');
    console.log('=' .repeat(70));
    
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // Tables principales à vérifier
    const tablesToCheck = [
      'users', 'companies', 'subscriptions', 'invoices', 'posts', 'comments',
      'communities', 'support_tickets', 'audit_logs', 'security_events',
      'admin_database_config', 'admin_chatbot_config', 'admin_system_config',
      'admin_security_config', 'admin_mailing_config', 'admin_appearance_config',
      'admin_legal_config', 'admin_community_config', 'admin_analytics_config'
    ];
    
    console.log('\n📊 Vérification des données par table...');
    
    for (const table of tablesToCheck) {
      try {
        // Compter les enregistrements
        const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
        const countResult = await client.query(countQuery);
        const count = parseInt(countResult.rows[0].count);
        
        if (count > 0) {
          console.log(`📋 ${table}: ${count} enregistrement(s)`);
          
          // Afficher quelques exemples de données
          const sampleQuery = `SELECT * FROM ${table} LIMIT 3`;
          const sampleResult = await client.query(sampleQuery);
          
          if (sampleResult.rows.length > 0) {
            console.log(`   📄 Exemples de données:`);
            sampleResult.rows.forEach((row, index) => {
              console.log(`      ${index + 1}. ${JSON.stringify(row, null, 2).substring(0, 200)}...`);
            });
          }
        } else {
          console.log(`📋 ${table}: 0 enregistrement (vide)`);
        }
        
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ ${table}: Table n'existe pas`);
        } else {
          console.log(`❌ ${table}: Erreur - ${error.message}`);
        }
      }
    }
    
    // Vérifier spécifiquement les configurations d'administration
    console.log('\n🔧 Vérification des configurations d\'administration...');
    
    const adminTables = [
      'admin_database_config', 'admin_chatbot_config', 'admin_system_config',
      'admin_security_config', 'admin_mailing_config', 'admin_appearance_config',
      'admin_legal_config', 'admin_community_config', 'admin_analytics_config'
    ];
    
    for (const table of adminTables) {
      try {
        const query = `SELECT * FROM ${table}`;
        const result = await client.query(query);
        
        if (result.rows.length > 0) {
          console.log(`✅ ${table}: ${result.rows.length} configuration(s)`);
          result.rows.forEach((row, index) => {
            console.log(`   📄 Config ${index + 1}:`);
            Object.keys(row).forEach(key => {
              if (row[key] !== null && row[key] !== undefined) {
                const value = typeof row[key] === 'object' ? JSON.stringify(row[key]) : row[key];
                console.log(`      ${key}: ${value.toString().substring(0, 100)}...`);
              }
            });
          });
        } else {
          console.log(`📋 ${table}: Aucune configuration`);
        }
        
      } catch (error) {
        console.log(`❌ ${table}: Erreur - ${error.message}`);
      }
    }
    
    // Vérifier les données utilisateur mockées
    console.log('\n👥 Vérification des données utilisateur...');
    
    try {
      const usersQuery = `SELECT id, email, name, role, company, created_at FROM users LIMIT 5`;
      const usersResult = await client.query(usersQuery);
      
      if (usersResult.rows.length > 0) {
        console.log(`👤 Utilisateurs trouvés: ${usersResult.rows.length}`);
        usersResult.rows.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email}) - Rôle: ${user.role}`);
        });
      } else {
        console.log('👤 Aucun utilisateur trouvé');
      }
    } catch (error) {
      console.log(`❌ Erreur utilisateurs: ${error.message}`);
    }
    
    // Vérifier les données de communauté
    console.log('\n🌐 Vérification des données de communauté...');
    
    try {
      const communitiesQuery = `SELECT id, name, description, visibility, created_at FROM communities LIMIT 3`;
      const communitiesResult = await client.query(communitiesQuery);
      
      if (communitiesResult.rows.length > 0) {
        console.log(`🌐 Communautés trouvées: ${communitiesResult.rows.length}`);
        communitiesResult.rows.forEach((community, index) => {
          console.log(`   ${index + 1}. ${community.name} - Visibilité: ${community.visibility}`);
        });
      } else {
        console.log('🌐 Aucune communauté trouvée');
      }
    } catch (error) {
      console.log(`❌ Erreur communautés: ${error.message}`);
    }
    
    // Vérifier les posts
    console.log('\n📝 Vérification des posts...');
    
    try {
      const postsQuery = `SELECT id, title, content, author_id, visibility, created_at FROM posts LIMIT 3`;
      const postsResult = await client.query(postsQuery);
      
      if (postsResult.rows.length > 0) {
        console.log(`📝 Posts trouvés: ${postsResult.rows.length}`);
        postsResult.rows.forEach((post, index) => {
          console.log(`   ${index + 1}. ${post.title} - Auteur: ${post.author_id} - Visibilité: ${post.visibility}`);
        });
      } else {
        console.log('📝 Aucun post trouvé');
      }
    } catch (error) {
      console.log(`❌ Erreur posts: ${error.message}`);
    }
    
    // Résumé final
    console.log('\n🎯 RÉSUMÉ DES DONNÉES MOCKÉES');
    console.log('=' .repeat(70));
    
    let totalRecords = 0;
    let tablesWithData = 0;
    
    for (const table of tablesToCheck) {
      try {
        const countQuery = `SELECT COUNT(*) as count FROM ${table}`;
        const countResult = await client.query(countQuery);
        const count = parseInt(countResult.rows[0].count);
        
        if (count > 0) {
          totalRecords += count;
          tablesWithData++;
        }
      } catch (error) {
        // Ignorer les erreurs de tables inexistantes
      }
    }
    
    console.log(`📊 Total d'enregistrements: ${totalRecords}`);
    console.log(`📋 Tables avec des données: ${tablesWithData}/${tablesToCheck.length}`);
    
    if (totalRecords > 0) {
      console.log('\n✅ DES DONNÉES MOCKÉES SONT PRÉSENTES !');
      console.log('📋 La base de données contient des données de test.');
      console.log('🧪 Ces données permettent de tester l\'application.');
    } else {
      console.log('\n📋 AUCUNE DONNÉE MOCKÉE TROUVÉE');
      console.log('📋 La base de données est vide (tables créées mais pas de données).');
      console.log('💡 Vous pouvez ajouter des données de test si nécessaire.');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des données:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Vérification des données terminée !');
  }
}

checkMockData();
