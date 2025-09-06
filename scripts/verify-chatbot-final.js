const fs = require('fs');
const path = require('path');

console.log('🤖 Vérification finale du nettoyage du chatbot IA');
console.log('=' .repeat(60));

// Vérifier ChatbotContext spécifiquement
const filePath = path.join(__dirname, '..', 'src/contexts/ChatbotContext.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('\n📋 Contenu de ChatbotContext.tsx:');
  console.log('=' .repeat(60));
  
  // Chercher des patterns spécifiques
  const patterns = [
    'totalConversations: 0',
    'totalMessages: 0',
    'averageSessionLength: 0',
    'topQuestions: []',
    'userSatisfaction: 0',
    'responseTime: 0'
  ];
  
  patterns.forEach(pattern => {
    if (content.includes(pattern)) {
      console.log(`✅ Trouvé: ${pattern}`);
    } else {
      console.log(`❌ Non trouvé: ${pattern}`);
    }
  });
  
  // Chercher des données mockées spécifiques
  const mockPatterns = [
    'totalConversations: 23',
    'totalMessages: 156',
    'averageSessionLength: 4.2',
    'userSatisfaction: 4.3',
    'responseTime: 1.2',
    'Comment puis-je réinitialiser mon mot de passe',
    'Quels sont vos tarifs',
    'Comment contacter le support',
    'Où trouver la documentation'
  ];
  
  console.log('\n🔍 Recherche de données mockées:');
  console.log('=' .repeat(60));
  
  let foundMockData = false;
  mockPatterns.forEach(pattern => {
    if (content.includes(pattern)) {
      console.log(`❌ Données mockées trouvées: ${pattern}`);
      foundMockData = true;
    }
  });
  
  if (!foundMockData) {
    console.log('✅ Aucune donnée mockée trouvée');
  }
  
  // Afficher les lignes autour des patterns trouvés
  console.log('\n📄 Contexte des patterns trouvés:');
  console.log('=' .repeat(60));
  
  const lines = content.split('\n');
  patterns.forEach(pattern => {
    const lineIndex = lines.findIndex(line => line.includes(pattern));
    if (lineIndex !== -1) {
      console.log(`\nPattern: ${pattern}`);
      console.log(`Ligne ${lineIndex + 1}: ${lines[lineIndex].trim()}`);
      if (lineIndex > 0) {
        console.log(`Ligne ${lineIndex}: ${lines[lineIndex - 1].trim()}`);
      }
      if (lineIndex < lines.length - 1) {
        console.log(`Ligne ${lineIndex + 2}: ${lines[lineIndex + 1].trim()}`);
      }
    }
  });
  
} catch (error) {
  console.log(`❌ Erreur: ${error.message}`);
}
