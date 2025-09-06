const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification simple et directe');
console.log('=' .repeat(50));

// Vérifier MailingContext spécifiquement
const filePath = path.join(__dirname, '..', 'src/contexts/MailingContext.tsx');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('\n📋 Contenu de MailingContext.tsx:');
  console.log('=' .repeat(50));
  
  // Chercher des patterns spécifiques
  const patterns = [
    'setContacts([])',
    'setCampaigns([])',
    'const [contacts, setContacts] = useState<Contact[]>([])',
    'const [campaigns, setCampaigns] = useState<Campaign[]>([])',
    '// Contacts de démonstration',
    '// Campagnes de démonstration'
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
    'john.doe@example.com',
    'jane.smith@example.com',
    'Acme Corp',
    'TechStart',
    'Campagne de bienvenue',
    'Bienvenue !',
    'sent: 150',
    'delivered: 148',
    'opened: 89',
    'clicked: 23',
    'unsubscribed: 2',
    'bounced: 2',
    'openRate: 60.1',
    'clickRate: 25.8',
    'unsubscribeRate: 1.3'
  ];
  
  console.log('\n🔍 Recherche de données mockées:');
  console.log('=' .repeat(50));
  
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
  console.log('=' .repeat(50));
  
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
