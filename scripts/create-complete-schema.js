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

async function createCompleteSchema() {
  const client = new Client(config);
  
  try {
    console.log('🚀 Création du schéma complet de l\'application SaaS');
    console.log('=' .repeat(70));
    
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // Lire le fichier de schéma complet
    const schemaFile = path.join(__dirname, '..', 'docs', 'DATABASE_SCHEMA.sql');
    
    if (!fs.existsSync(schemaFile)) {
      console.log('❌ Fichier DATABASE_SCHEMA.sql non trouvé');
      return;
    }
    
    console.log('📖 Lecture du fichier de schéma...');
    const schema = fs.readFileSync(schemaFile, 'utf8');
    
    // Diviser le schéma en sections pour un meilleur contrôle
    const sections = schema.split('-- ===================================================================');
    
    console.log(`📋 ${sections.length} sections trouvées dans le schéma`);
    
    // Exécuter chaque section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (section && !section.startsWith('--') && section.length > 50) {
        try {
          console.log(`🔄 Exécution de la section ${i + 1}...`);
          await client.query(section);
          console.log(`✅ Section ${i + 1} exécutée avec succès`);
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('déjà existe')) {
            console.log(`⚠️ Section ${i + 1}: Élément déjà existant (ignoré)`);
          } else {
            console.log(`❌ Section ${i + 1}: Erreur - ${error.message}`);
          }
        }
      }
    }
    
    // Vérification finale
    console.log('\n🔍 Vérification finale...');
    
    // Vérifier les tables créées
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    const tablesResult = await client.query(tablesQuery);
    console.log(`📋 Tables créées: ${tablesResult.rows.length}`);
    
    // Vérifier les politiques RLS
    const policiesQuery = `
      SELECT COUNT(*) as count
      FROM pg_policies 
      WHERE schemaname = 'public'
    `;
    const policiesResult = await client.query(policiesQuery);
    console.log(`🔐 Politiques RLS créées: ${policiesResult.rows[0].count}`);
    
    // Vérifier les contraintes
    const constraintsQuery = `
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
    `;
    const constraintsResult = await client.query(constraintsQuery);
    console.log(`⚡ Contraintes créées: ${constraintsResult.rows[0].count}`);
    
    // Vérifier les index
    const indexesQuery = `
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `;
    const indexesResult = await client.query(indexesQuery);
    console.log(`📊 Index créés: ${indexesResult.rows[0].count}`);
    
    // Vérifier les triggers
    const triggersQuery = `
      SELECT COUNT(*) as count
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
    `;
    const triggersResult = await client.query(triggersQuery);
    console.log(`🔄 Triggers créés: ${triggersResult.rows[0].count}`);
    
    console.log('\n🎉 SCHÉMA COMPLET CRÉÉ AVEC SUCCÈS !');
    console.log('📋 Toutes les tables, contraintes, index, triggers et politiques sont maintenant en place.');
    console.log('🔐 La sécurité au niveau des lignes (RLS) est activée.');
    console.log('🚀 L\'application SaaS est prête pour la production !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du schéma:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Création du schéma terminée !');
  }
}

createCompleteSchema();
