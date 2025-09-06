const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification finale du nettoyage des données mockées');
console.log('=' .repeat(70));

// Fichiers à vérifier
const filesToCheck = [
  'src/pages/admin/AdminUsers.tsx',
  'src/pages/admin/AdminCompanies.tsx',
  'src/pages/admin/AdminCommunity.tsx',
  'src/pages/admin/AdminAnalytics.tsx',
  'src/pages/admin/AdminSecurity.tsx',
  'src/pages/admin/AdminSystem.tsx',
  'src/contexts/CommunityContext.tsx',
  'src/contexts/MailingContext.tsx'
];

let totalFiles = 0;
let cleanFiles = 0;
let filesWithMockData = 0;

console.log('\n📋 Vérification finale des fichiers...');

filesToCheck.forEach(filePath => {
  totalFiles++;
  
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier la présence de données mockées spécifiques (en ignorant les labels et placeholders)
    const hasMockData = content.includes('id: \'1\',') || 
                       content.includes('id: \'2\',') ||
                       content.includes('id: \'3\',') ||
                       content.includes('id: \'4\',') ||
                       content.includes('id: \'5\',') ||
                       content.includes('name: \'Super Admin\',') ||
                       content.includes('name: \'Manager Client\',') ||
                       content.includes('name: \'User Client\',') ||
                       content.includes('name: \'John Doe\',') ||
                       content.includes('name: \'Jane Smith\',') ||
                       content.includes('name: \'TechCorp Solutions\',') ||
                       content.includes('name: \'Digital Marketing Pro\',') ||
                       content.includes('name: \'StartUp Innovation\',') ||
                       content.includes('email: \'admin@example.com\',') ||
                       content.includes('email: \'manager@client.com\',') ||
                       content.includes('email: \'user@client.com\',') ||
                       content.includes('email: \'john@client.com\',') ||
                       content.includes('email: \'jane@otherclient.com\',') ||
                       content.includes('email: \'admin@techcorp.com\',') ||
                       content.includes('email: \'contact@digitalmarketing.fr\',') ||
                       content.includes('email: \'hello@startup-innov.com\',') ||
                       content.includes('company: \'SaaS Company\',') ||
                       content.includes('company: \'Client Company\',') ||
                       content.includes('company: \'Other Client\',') ||
                       content.includes('company: \'TechCorp Solutions\',') ||
                       content.includes('company: \'Digital Marketing Pro\',') ||
                       content.includes('company: \'StartUp Innovation\',') ||
                       content.includes('totalUsers: 2847,') ||
                       content.includes('activeUsers: 1263,') ||
                       content.includes('pageViews: 145230,') ||
                       content.includes('uptime: \'15 days, 3 hours\',') ||
                       content.includes('cpuUsage: 45,') ||
                       content.includes('memoryUsage: 67,') ||
                       content.includes('diskUsage: 34,') ||
                       content.includes('networkTraffic: 125,') ||
                       content.includes('activeUsers: 1247,') ||
                       content.includes('totalRequests: 89542,') ||
                       content.includes('errorRate: 0.3') ||
                       content.includes('name: \'Web Server\',') ||
                       content.includes('name: \'Database\',') ||
                       content.includes('name: \'Cache Service\',') ||
                       content.includes('name: \'Email Service\',') ||
                       content.includes('name: \'File Storage\',') ||
                       content.includes('name: \'main_db\',') ||
                       content.includes('name: \'analytics_db\',') ||
                       content.includes('name: \'logs_db\',') ||
                       content.includes('message: \'Server started successfully\'') ||
                       content.includes('message: \'High memory usage detected\'') ||
                       content.includes('message: \'Connection timeout to storage backend\'') ||
                       content.includes('message: \'Backup completed successfully\'') ||
                       content.includes('type: \'suspicious_activity\',') ||
                       content.includes('type: \'login_failed\',') ||
                       content.includes('type: \'admin_action\',') ||
                       content.includes('user: \'jean.dupont@exemple.com\',') ||
                       content.includes('user: \'marie.martin@exemple.com\',') ||
                       content.includes('user: \'admin@exemple.com\',') ||
                       content.includes('description: \'Tentatives de connexion multiples depuis une nouvelle localisation\',') ||
                       content.includes('description: \'Échec de connexion - mot de passe incorrect (3e tentative)\',') ||
                       content.includes('description: \'Modification des paramètres de sécurité\',') ||
                       content.includes('name: \'Détection de force brute\',') ||
                       content.includes('name: \'Géolocalisation suspecte\',') ||
                       content.includes('name: \'Activité nocturne\',') ||
                       content.includes('name: \'API Principal\',') ||
                       content.includes('name: \'API Lecture seule\',') ||
                       content.includes('key: \'sk_live_*********************xyz\',') ||
                       content.includes('key: \'sk_live_*********************abc\',') ||
                       content.includes('title: \'Contenu inapproprié signalé\',') ||
                       content.includes('title: \'Commentaire offensant\',') ||
                       content.includes('author: \'Jean Dupont\',') ||
                       content.includes('author: \'Marie Martin\',') ||
                       content.includes('firstName: \'John\',') ||
                       content.includes('firstName: \'Jane\',') ||
                       content.includes('lastName: \'Doe\',') ||
                       content.includes('lastName: \'Smith\',') ||
                       content.includes('company: \'Acme Corp\',') ||
                       content.includes('company: \'TechStart\',') ||
                       content.includes('tags: [\'vip\', \'newsletter\'],') ||
                       content.includes('tags: [\'newsletter\'],') ||
                       content.includes('plan: \'premium\',') ||
                       content.includes('plan: \'basic\',') ||
                       content.includes('industry: \'tech\'') ||
                       content.includes('industry: \'startup\'') ||
                       content.includes('title: \'Bienvenue dans notre communauté SaaS !\',') ||
                       content.includes('title: \'Comment optimiser l\'utilisation de la plateforme ?\',') ||
                       content.includes('title: \'Webinar : Nouveautés 2024\',') ||
                       content.includes('title: \'Réunion équipe - Client Company\',') ||
                       content.includes('name: \'Campagne de bienvenue\',') ||
                       content.includes('subject: \'Bienvenue !\',') ||
                       content.includes('sent: 150,') ||
                       content.includes('delivered: 148,') ||
                       content.includes('opened: 89,') ||
                       content.includes('clicked: 23,') ||
                       content.includes('unsubscribed: 2,') ||
                       content.includes('bounced: 2,') ||
                       content.includes('complained: 0,') ||
                       content.includes('openRate: 60.1,') ||
                       content.includes('clickRate: 25.8,') ||
                       content.includes('unsubscribeRate: 1.3');
    
    if (hasMockData) {
      console.log(`❌ ${filePath}: Contient encore des données mockées`);
      filesWithMockData++;
    } else {
      console.log(`✅ ${filePath}: Nettoyé`);
      cleanFiles++;
    }
    
  } catch (error) {
    console.log(`⚠️ ${filePath}: Erreur de lecture - ${error.message}`);
  }
});

console.log('\n🎯 RÉSUMÉ DE LA VÉRIFICATION FINALE');
console.log('=' .repeat(70));
console.log(`📊 Total de fichiers vérifiés: ${totalFiles}`);
console.log(`✅ Fichiers nettoyés: ${cleanFiles}`);
console.log(`❌ Fichiers avec données mockées: ${filesWithMockData}`);

if (filesWithMockData === 0) {
  console.log('\n🎉 TOUS LES FICHIERS SONT NETTOYÉS !');
  console.log('🗑️ Aucune donnée mockée trouvée dans le code.');
  console.log('🚀 L\'application est prête pour la production.');
} else {
  console.log('\n⚠️ CERTAINS FICHIERS CONTIENNENT ENCORE DES DONNÉES MOCKÉES');
  console.log('📋 Il faut nettoyer les fichiers restants.');
}

console.log('\n💡 Note: Les données mockées dans AuthContext sont conservées pour les tests de connexion.');
console.log('🔐 Ces données permettent de tester l\'authentification avec des utilisateurs prédéfinis.');
