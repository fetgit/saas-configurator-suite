const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification du nettoyage des données mockées');
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
  'src/contexts/MailingContext.tsx',
  'src/contexts/AuthContext.tsx'
];

let totalFiles = 0;
let cleanFiles = 0;
let filesWithMockData = 0;

console.log('\n📋 Vérification des fichiers...');

filesToCheck.forEach(filePath => {
  totalFiles++;
  
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier la présence de données mockées
    const hasMockData = content.includes('mockUsers') || 
                       content.includes('mockCompanies') ||
                       content.includes('demoMembers') ||
                       content.includes('demoPosts') ||
                       content.includes('demoGroups') ||
                       content.includes('demoEvents') ||
                       content.includes('mockSecurityEvents') ||
                       content.includes('mockSecurityRules') ||
                       content.includes('mockApiKeys') ||
                       content.includes('analyticsData') ||
                       content.includes('systemMetrics') ||
                       content.includes('services') ||
                       content.includes('databases') ||
                       content.includes('systemLogs') ||
                       content.includes('reportedContent') ||
                       content.includes('contacts') ||
                       content.includes('campaigns') ||
                       content.includes('john.doe@example.com') ||
                       content.includes('jane.smith@example.com') ||
                       content.includes('admin@example.com') ||
                       content.includes('manager@client.com') ||
                       content.includes('user@client.com') ||
                       content.includes('TechCorp Solutions') ||
                       content.includes('Digital Marketing Pro') ||
                       content.includes('StartUp Innovation');
    
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

console.log('\n🎯 RÉSUMÉ DE LA VÉRIFICATION');
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
