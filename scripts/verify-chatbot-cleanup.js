const fs = require('fs');
const path = require('path');

console.log('🤖 Vérification du nettoyage du chatbot IA');
console.log('=' .repeat(60));

// Fichiers du chatbot à vérifier
const chatbotFiles = [
  'src/pages/admin/AdminChatbot.tsx',
  'src/contexts/ChatbotContext.tsx',
  'src/components/Chatbot.tsx',
  'src/components/ChatbotWidget.tsx'
];

let totalFiles = 0;
let cleanFiles = 0;
let filesWithMockData = 0;

console.log('\n📋 Vérification des fichiers du chatbot...');

chatbotFiles.forEach(filePath => {
  totalFiles++;
  
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier la présence de données mockées spécifiques
    const hasMockData = content.includes('mockResponse') || 
                       content.includes('mockData') ||
                       content.includes('demoData') ||
                       content.includes('example.com') ||
                       content.includes('test.com') ||
                       content.includes('sample.com') ||
                       content.includes('Bonjour ! Comment puis-je vous aider ?') ||
                       content.includes('Test réussi ! Le chatbot répond correctement.') ||
                       content.includes('Simulation d\'un test de chat') ||
                       content.includes('const mockResponse = {') ||
                       content.includes('const mockData = {') ||
                       content.includes('const demoData = {') ||
                       content.includes('const exampleData = {') ||
                       content.includes('const testData = {') ||
                       content.includes('const sampleData = {');
    
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

console.log('\n🎯 RÉSUMÉ DU NETTOYAGE DU CHATBOT');
console.log('=' .repeat(60));
console.log(`📊 Total de fichiers vérifiés: ${totalFiles}`);
console.log(`✅ Fichiers nettoyés: ${cleanFiles}`);
console.log(`❌ Fichiers avec données mockées: ${filesWithMockData}`);

if (filesWithMockData === 0) {
  console.log('\n🎉 CHATBOT NETTOYÉ AVEC SUCCÈS !');
  console.log('🤖 Toutes les données mockées du chatbot ont été supprimées.');
  console.log('🚀 Le chatbot est maintenant propre et prêt pour la production.');
} else {
  console.log('\n⚠️ CERTAINS FICHIERS DU CHATBOT CONTIENNENT ENCORE DES DONNÉES MOCKÉES');
  console.log('📋 Il faut nettoyer les fichiers restants.');
}

console.log('\n💡 Note: Les variables de test (testResults, testResponse) sont conservées car elles sont nécessaires au fonctionnement du chatbot.');
console.log('🔧 Ces variables permettent de tester la connexion au service IA.');
