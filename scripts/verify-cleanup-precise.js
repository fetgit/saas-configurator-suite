const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification précise du nettoyage des données mockées');
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

console.log('\n📋 Vérification précise des fichiers...');

filesToCheck.forEach(filePath => {
  totalFiles++;
  
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier la présence de données mockées spécifiques
    const hasMockData = content.includes('Super Admin') || 
                       content.includes('Manager Client') ||
                       content.includes('User Client') ||
                       content.includes('John Doe') ||
                       content.includes('Jane Smith') ||
                       content.includes('TechCorp Solutions') ||
                       content.includes('Digital Marketing Pro') ||
                       content.includes('StartUp Innovation') ||
                       content.includes('Jean Dupont') ||
                       content.includes('Marie Martin') ||
                       content.includes('Pierre Leroy') ||
                       content.includes('jean.dupont@exemple.com') ||
                       content.includes('marie.martin@exemple.com') ||
                       content.includes('admin@exemple.com') ||
                       content.includes('john.doe@example.com') ||
                       content.includes('jane.smith@example.com') ||
                       content.includes('Bienvenue dans notre communauté') ||
                       content.includes('Comment optimiser l\'utilisation') ||
                       content.includes('Webinar : Nouveautés 2024') ||
                       content.includes('Réunion équipe - Client Company') ||
                       content.includes('Campagne de bienvenue') ||
                       content.includes('totalUsers: 2847') ||
                       content.includes('activeUsers: 1263') ||
                       content.includes('pageViews: 145230') ||
                       content.includes('uptime: \'15 days, 3 hours\'') ||
                       content.includes('cpuUsage: 45') ||
                       content.includes('memoryUsage: 67') ||
                       content.includes('Web Server') ||
                       content.includes('Database') ||
                       content.includes('Cache Service') ||
                       content.includes('Email Service') ||
                       content.includes('File Storage') ||
                       content.includes('main_db') ||
                       content.includes('analytics_db') ||
                       content.includes('logs_db') ||
                       content.includes('Server started successfully') ||
                       content.includes('High memory usage detected') ||
                       content.includes('Connection timeout to storage backend') ||
                       content.includes('Backup completed successfully') ||
                       content.includes('suspicious_activity') ||
                       content.includes('login_failed') ||
                       content.includes('admin_action') ||
                       content.includes('Détection de force brute') ||
                       content.includes('Géolocalisation suspecte') ||
                       content.includes('Activité nocturne') ||
                       content.includes('API Principal') ||
                       content.includes('API Lecture seule') ||
                       content.includes('sk_live_*********************') ||
                       content.includes('Contenu inapproprié signalé') ||
                       content.includes('Commentaire offensant') ||
                       content.includes('Acme Corp') ||
                       content.includes('TechStart') ||
                       content.includes('vip') ||
                       content.includes('newsletter') ||
                       content.includes('premium') ||
                       content.includes('basic') ||
                       content.includes('tech') ||
                       content.includes('startup');
    
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

console.log('\n🎯 RÉSUMÉ DE LA VÉRIFICATION PRÉCISE');
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
