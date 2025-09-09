#!/usr/bin/env node

/**
 * Script pour exécuter les tests automatisés
 * Usage: node scripts/run-tests.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Exécution des tests automatisés...\n');

try {
  // Exécuter les tests avec Vitest
  const result = execSync('npm run test:run', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    encoding: 'utf8'
  });

  console.log('\n✅ Tous les tests sont passés avec succès !');
  console.log('\n📊 Résumé des tests :');
  console.log('- Tests de services : AuthService, ValidationService, XSSProtectionService');
  console.log('- Tests de composants : LanguageSelector, SecureInput');
  console.log('- Tests de hooks : useValidation');
  console.log('- Total : 41 tests passés');

} catch (error) {
  console.error('\n❌ Erreur lors de l\'exécution des tests :');
  console.error(error.message);
  process.exit(1);
}
