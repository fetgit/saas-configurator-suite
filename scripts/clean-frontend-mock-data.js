// Script pour nettoyer les données mockées du frontend
// Ce script génère du code à exécuter dans la console du navigateur

console.log('🧹 Script de nettoyage des données mockées du frontend');
console.log('=' .repeat(70));
console.log('');
console.log('📋 Instructions :');
console.log('1. Ouvrez votre application dans le navigateur');
console.log('2. Ouvrez la console développeur (F12)');
console.log('3. Copiez et collez le code ci-dessous dans la console');
console.log('4. Appuyez sur Entrée pour exécuter');
console.log('');
console.log('🔧 Code à exécuter dans la console du navigateur :');
console.log('=' .repeat(70));

const cleanScript = `
// Nettoyage des données mockées du localStorage
console.log('🧹 Nettoyage des données mockées du localStorage...');

// Liste des clés à supprimer (garder les connexions DB)
const keysToRemove = [
  'admin_chatbot_config',
  'admin_system_config', 
  'admin_security_config',
  'admin_mailing_config',
  'admin_appearance_config',
  'admin_legal_config',
  'admin_community_config',
  'admin_analytics_config',
  'user', // Utilisateur connecté
  'community_data',
  'mailing_data',
  'media_data',
  'legal_data',
  'chatbot_data'
];

let removedCount = 0;
let keptCount = 0;

// Supprimer les données mockées
keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log('✅ Supprimé:', key);
    removedCount++;
  } else {
    console.log('📋 Déjà absent:', key);
  }
});

// Garder seulement la configuration de base de données
const dbConfig = localStorage.getItem('admin_database_config');
if (dbConfig) {
  console.log('💾 Conservé: admin_database_config (connexion PostgreSQL)');
  keptCount++;
}

// Nettoyage des données de session
sessionStorage.clear();
console.log('🗑️ SessionStorage nettoyé');

// Résumé
console.log('');
console.log('🎯 RÉSUMÉ DU NETTOYAGE FRONTEND');
console.log('=' .repeat(50));
console.log('✅ Données supprimées:', removedCount);
console.log('💾 Données conservées:', keptCount);
console.log('🗑️ SessionStorage: Nettoyé');
console.log('');
console.log('🚀 Le frontend est maintenant propre !');
console.log('💾 Seules les informations de connexion PostgreSQL sont conservées.');
`;

console.log(cleanScript);
console.log('');
console.log('📝 Note : Ce script garde uniquement la configuration de base de données PostgreSQL.');
console.log('🗑️ Toutes les autres données mockées seront supprimées du localStorage.');
console.log('');
console.log('⚠️ Attention : Après exécution, vous devrez vous reconnecter à l\'application.');
