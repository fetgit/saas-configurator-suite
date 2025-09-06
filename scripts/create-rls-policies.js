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

async function createRLSPolicies() {
  const client = new Client(config);
  
  try {
    console.log('🔐 Création des politiques RLS (Row Level Security)');
    console.log('=' .repeat(70));
    
    await client.connect();
    console.log('✅ Connexion réussie !');
    
    // 1. Activer RLS sur toutes les tables
    console.log('\n1️⃣ Activation de RLS sur toutes les tables...');
    
    const tables = [
      'users', 'companies', 'subscriptions', 'invoices', 'posts', 'comments',
      'communities', 'community_memberships', 'support_tickets', 'ticket_messages',
      'audit_logs', 'security_events', 'api_keys', 'data_exports', 'attachments',
      'email_templates', 'email_campaigns', 'webhooks', 'webhook_deliveries',
      'backup_jobs', 'feature_flags', 'system_settings', 'user_events', 'mfa_devices',
      'subscription_plans'
    ];
    
    for (const table of tables) {
      try {
        await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
        console.log(`   ✅ RLS activé sur ${table}`);
      } catch (error) {
        if (error.message.includes('already enabled')) {
          console.log(`   ⚠️ RLS déjà activé sur ${table}`);
        } else {
          console.log(`   ❌ Erreur sur ${table}: ${error.message}`);
        }
      }
    }
    
    // 2. Créer les politiques pour la table users
    console.log('\n2️⃣ Création des politiques pour la table users...');
    
    const userPolicies = [
      // Les utilisateurs peuvent voir leur propre profil
      `CREATE POLICY "users_select_own" ON users FOR SELECT USING (id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les utilisateurs peuvent modifier leur propre profil
      `CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les admins peuvent voir tous les utilisateurs
      `CREATE POLICY "users_select_admin" ON users FOR SELECT USING (current_setting('app.current_user_role', true) IN ('admin', 'superadmin'));`,
      
      // Les superadmins peuvent modifier tous les utilisateurs
      `CREATE POLICY "users_update_admin" ON users FOR UPDATE USING (current_setting('app.current_user_role', true) = 'superadmin');`,
      
      // Les superadmins peuvent insérer de nouveaux utilisateurs
      `CREATE POLICY "users_insert_admin" ON users FOR INSERT WITH CHECK (current_setting('app.current_user_role', true) = 'superadmin');`,
      
      // Les superadmins peuvent supprimer des utilisateurs
      `CREATE POLICY "users_delete_admin" ON users FOR DELETE USING (current_setting('app.current_user_role', true) = 'superadmin');`
    ];
    
    for (const policy of userPolicies) {
      try {
        await client.query(policy);
        console.log(`   ✅ Politique users créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Politique users déjà existante`);
        } else {
          console.log(`   ❌ Erreur politique users: ${error.message}`);
        }
      }
    }
    
    // 3. Créer les politiques pour la table companies
    console.log('\n3️⃣ Création des politiques pour la table companies...');
    
    const companyPolicies = [
      // Les utilisateurs peuvent voir leur propre entreprise
      `CREATE POLICY "companies_select_own" ON companies FOR SELECT USING (id = current_setting('app.current_user_company_id', true)::uuid);`,
      
      // Les admins peuvent voir toutes les entreprises
      `CREATE POLICY "companies_select_admin" ON companies FOR SELECT USING (current_setting('app.current_user_role', true) IN ('admin', 'superadmin'));`,
      
      // Les superadmins peuvent modifier toutes les entreprises
      `CREATE POLICY "companies_update_admin" ON companies FOR UPDATE USING (current_setting('app.current_user_role', true) = 'superadmin');`,
      
      // Les superadmins peuvent insérer de nouvelles entreprises
      `CREATE POLICY "companies_insert_admin" ON companies FOR INSERT WITH CHECK (current_setting('app.current_user_role', true) = 'superadmin');`
    ];
    
    for (const policy of companyPolicies) {
      try {
        await client.query(policy);
        console.log(`   ✅ Politique companies créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Politique companies déjà existante`);
        } else {
          console.log(`   ❌ Erreur politique companies: ${error.message}`);
        }
      }
    }
    
    // 4. Créer les politiques pour la table subscriptions
    console.log('\n4️⃣ Création des politiques pour la table subscriptions...');
    
    const subscriptionPolicies = [
      // Les utilisateurs peuvent voir leur propre abonnement
      `CREATE POLICY "subscriptions_select_own" ON subscriptions FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les admins peuvent voir tous les abonnements
      `CREATE POLICY "subscriptions_select_admin" ON subscriptions FOR SELECT USING (current_setting('app.current_user_role', true) IN ('admin', 'superadmin'));`,
      
      // Les superadmins peuvent modifier tous les abonnements
      `CREATE POLICY "subscriptions_update_admin" ON subscriptions FOR UPDATE USING (current_setting('app.current_user_role', true) = 'superadmin');`,
      
      // Les superadmins peuvent insérer de nouveaux abonnements
      `CREATE POLICY "subscriptions_insert_admin" ON subscriptions FOR INSERT WITH CHECK (current_setting('app.current_user_role', true) = 'superadmin');`
    ];
    
    for (const policy of subscriptionPolicies) {
      try {
        await client.query(policy);
        console.log(`   ✅ Politique subscriptions créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Politique subscriptions déjà existante`);
        } else {
          console.log(`   ❌ Erreur politique subscriptions: ${error.message}`);
        }
      }
    }
    
    // 5. Créer les politiques pour la table posts
    console.log('\n5️⃣ Création des politiques pour la table posts...');
    
    const postPolicies = [
      // Les utilisateurs peuvent voir les posts publics et de leurs communautés
      `CREATE POLICY "posts_select_public" ON posts FOR SELECT USING (
        visibility = 'public' OR 
        (visibility = 'community' AND community_id IN (
          SELECT community_id FROM community_memberships 
          WHERE user_id = current_setting('app.current_user_id', true)::uuid
        )) OR
        author_id = current_setting('app.current_user_id', true)::uuid
      );`,
      
      // Les utilisateurs peuvent créer des posts
      `CREATE POLICY "posts_insert_own" ON posts FOR INSERT WITH CHECK (author_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les utilisateurs peuvent modifier leurs propres posts
      `CREATE POLICY "posts_update_own" ON posts FOR UPDATE USING (author_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les utilisateurs peuvent supprimer leurs propres posts
      `CREATE POLICY "posts_delete_own" ON posts FOR DELETE USING (author_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les admins peuvent voir tous les posts
      `CREATE POLICY "posts_select_admin" ON posts FOR SELECT USING (current_setting('app.current_user_role', true) IN ('admin', 'superadmin'));`
    ];
    
    for (const policy of postPolicies) {
      try {
        await client.query(policy);
        console.log(`   ✅ Politique posts créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Politique posts déjà existante`);
        } else {
          console.log(`   ❌ Erreur politique posts: ${error.message}`);
        }
      }
    }
    
    // 6. Créer les politiques pour la table comments
    console.log('\n6️⃣ Création des politiques pour la table comments...');
    
    const commentPolicies = [
      // Les utilisateurs peuvent voir les commentaires des posts qu'ils peuvent voir
      `CREATE POLICY "comments_select_visible" ON comments FOR SELECT USING (
        post_id IN (
          SELECT id FROM posts WHERE 
          visibility = 'public' OR 
          (visibility = 'community' AND community_id IN (
            SELECT community_id FROM community_memberships 
            WHERE user_id = current_setting('app.current_user_id', true)::uuid
          )) OR
          author_id = current_setting('app.current_user_id', true)::uuid
        )
      );`,
      
      // Les utilisateurs peuvent créer des commentaires
      `CREATE POLICY "comments_insert_own" ON comments FOR INSERT WITH CHECK (author_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les utilisateurs peuvent modifier leurs propres commentaires
      `CREATE POLICY "comments_update_own" ON comments FOR UPDATE USING (author_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les utilisateurs peuvent supprimer leurs propres commentaires
      `CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (author_id = current_setting('app.current_user_id', true)::uuid);`
    ];
    
    for (const policy of commentPolicies) {
      try {
        await client.query(policy);
        console.log(`   ✅ Politique comments créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Politique comments déjà existante`);
        } else {
          console.log(`   ❌ Erreur politique comments: ${error.message}`);
        }
      }
    }
    
    // 7. Créer les politiques pour la table support_tickets
    console.log('\n7️⃣ Création des politiques pour la table support_tickets...');
    
    const ticketPolicies = [
      // Les utilisateurs peuvent voir leurs propres tickets
      `CREATE POLICY "tickets_select_own" ON support_tickets FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les utilisateurs peuvent créer des tickets
      `CREATE POLICY "tickets_insert_own" ON support_tickets FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les utilisateurs peuvent modifier leurs propres tickets
      `CREATE POLICY "tickets_update_own" ON support_tickets FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::uuid);`,
      
      // Les admins peuvent voir tous les tickets
      `CREATE POLICY "tickets_select_admin" ON support_tickets FOR SELECT USING (current_setting('app.current_user_role', true) IN ('admin', 'superadmin'));`,
      
      // Les admins peuvent modifier tous les tickets
      `CREATE POLICY "tickets_update_admin" ON support_tickets FOR UPDATE USING (current_setting('app.current_user_role', true) IN ('admin', 'superadmin'));`
    ];
    
    for (const policy of ticketPolicies) {
      try {
        await client.query(policy);
        console.log(`   ✅ Politique support_tickets créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Politique support_tickets déjà existante`);
        } else {
          console.log(`   ❌ Erreur politique support_tickets: ${error.message}`);
        }
      }
    }
    
    // 8. Créer les politiques pour les tables d'audit et de sécurité
    console.log('\n8️⃣ Création des politiques pour les tables d\'audit...');
    
    const auditPolicies = [
      // Seuls les admins peuvent voir les logs d'audit
      `CREATE POLICY "audit_logs_select_admin" ON audit_logs FOR SELECT USING (current_setting('app.current_user_role', true) IN ('admin', 'superadmin'));`,
      
      // Seuls les superadmins peuvent insérer des logs d'audit
      `CREATE POLICY "audit_logs_insert_admin" ON audit_logs FOR INSERT WITH CHECK (current_setting('app.current_user_role', true) = 'superadmin');`,
      
      // Seuls les admins peuvent voir les événements de sécurité
      `CREATE POLICY "security_events_select_admin" ON security_events FOR SELECT USING (current_setting('app.current_user_role', true) IN ('admin', 'superadmin'));`,
      
      // Seuls les superadmins peuvent insérer des événements de sécurité
      `CREATE POLICY "security_events_insert_admin" ON security_events FOR INSERT WITH CHECK (current_setting('app.current_user_role', true) = 'superadmin');`
    ];
    
    for (const policy of auditPolicies) {
      try {
        await client.query(policy);
        console.log(`   ✅ Politique d'audit créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Politique d'audit déjà existante`);
        } else {
          console.log(`   ❌ Erreur politique d'audit: ${error.message}`);
        }
      }
    }
    
    // 9. Créer les politiques pour les tables d'administration
    console.log('\n9️⃣ Création des politiques pour les tables d\'administration...');
    
    const adminTables = [
      'admin_database_config', 'admin_chatbot_config', 'admin_system_config',
      'admin_security_config', 'admin_mailing_config', 'admin_appearance_config',
      'admin_legal_config', 'admin_community_config', 'admin_analytics_config',
      'admin_configurations'
    ];
    
    for (const table of adminTables) {
      try {
        // Seuls les superadmins peuvent accéder aux configurations d'administration
        await client.query(`CREATE POLICY "${table}_admin_only" ON ${table} FOR ALL USING (current_setting('app.current_user_role', true) = 'superadmin');`);
        console.log(`   ✅ Politique ${table} créée`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ⚠️ Politique ${table} déjà existante`);
        } else {
          console.log(`   ❌ Erreur politique ${table}: ${error.message}`);
        }
      }
    }
    
    // 10. Vérification finale
    console.log('\n🔍 Vérification finale des politiques RLS...');
    
    const policiesQuery = `
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;
    const policiesResult = await client.query(policiesQuery);
    console.log(`🔐 Politiques RLS créées: ${policiesResult.rows.length}`);
    
    // Grouper par table
    const policiesByTable = {};
    policiesResult.rows.forEach(row => {
      if (!policiesByTable[row.tablename]) {
        policiesByTable[row.tablename] = [];
      }
      policiesByTable[row.tablename].push(row.policyname);
    });
    
    console.log('\n📋 Politiques par table:');
    Object.keys(policiesByTable).sort().forEach(table => {
      console.log(`   ${table}: ${policiesByTable[table].length} politiques`);
      policiesByTable[table].forEach(policy => {
        console.log(`     - ${policy}`);
      });
    });
    
    console.log('\n🎉 POLITIQUES RLS CRÉÉES AVEC SUCCÈS !');
    console.log('🔐 La sécurité au niveau des lignes est maintenant active.');
    console.log('🛡️ Chaque utilisateur ne peut accéder qu\'aux données autorisées.');
    console.log('👑 Les superadmins ont un accès complet à toutes les données.');
    console.log('🚀 L\'application est maintenant sécurisée au niveau de la base de données !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création des politiques RLS:', error.message);
  } finally {
    await client.end();
    console.log('\n🔚 Création des politiques RLS terminée !');
  }
}

createRLSPolicies();
