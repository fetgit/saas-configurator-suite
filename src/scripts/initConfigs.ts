// ===================================================================
// SCRIPT D'INITIALISATION DES CONFIGURATIONS
// Script pour initialiser toutes les configurations par défaut
// ===================================================================

import { initializeDefaultConfigs, resetAllConfigs } from '../services/defaultConfigs';

// Fonction pour initialiser les configurations au démarrage de l'application
export const initAppConfigs = () => {
  console.log('🚀 Initialisation des configurations de l\'application...');
  
  try {
    // Initialiser les configurations par défaut
    initializeDefaultConfigs();
    
    console.log('✅ Configurations initialisées avec succès !');
    
    // Afficher les configurations chargées
    const configTypes = ['database', 'chatbot', 'system', 'security', 'mailing', 'appearance', 'legal', 'community', 'analytics'];
    
    configTypes.forEach(configType => {
      const config = localStorage.getItem(`admin_${configType}_config`);
      if (config) {
        console.log(`📋 Configuration ${configType}: Chargée`);
      } else {
        console.log(`⚠️ Configuration ${configType}: Non trouvée`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des configurations:', error);
  }
};

// Fonction pour réinitialiser toutes les configurations
export const resetAppConfigs = () => {
  console.log('🔄 Réinitialisation de toutes les configurations...');
  
  try {
    resetAllConfigs();
    console.log('✅ Toutes les configurations ont été réinitialisées !');
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation des configurations:', error);
  }
};

// Fonction pour afficher le statut des configurations
export const showConfigStatus = () => {
  console.log('📊 Statut des configurations:');
  
  const configTypes = ['database', 'chatbot', 'system', 'security', 'mailing', 'appearance', 'legal', 'community', 'analytics'];
  
  configTypes.forEach(configType => {
    const config = localStorage.getItem(`admin_${configType}_config`);
    if (config) {
      try {
        const parsedConfig = JSON.parse(config);
        console.log(`✅ ${configType}: ${Object.keys(parsedConfig).length} propriétés`);
      } catch (error) {
        console.log(`❌ ${configType}: Erreur de parsing`);
      }
    } else {
      console.log(`⚠️ ${configType}: Non configuré`);
    }
  });
};

// Fonction pour exporter les configurations
export const exportConfigs = () => {
  console.log('📤 Export des configurations...');
  
  const configs: Record<string, any> = {};
  const configTypes = ['database', 'chatbot', 'system', 'security', 'mailing', 'appearance', 'legal', 'community', 'analytics'];
  
  configTypes.forEach(configType => {
    const config = localStorage.getItem(`admin_${configType}_config`);
    if (config) {
      try {
        configs[configType] = JSON.parse(config);
      } catch (error) {
        console.error(`Erreur lors de l'export de ${configType}:`, error);
      }
    }
  });
  
  const exportData = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    configs
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `saas-configurator-configs-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('✅ Configurations exportées !');
};

// Fonction pour importer les configurations
export const importConfigs = (file: File): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.configs) {
          Object.entries(data.configs).forEach(([configType, config]) => {
            localStorage.setItem(`admin_${configType}_config`, JSON.stringify(config));
          });
          
          console.log('✅ Configurations importées avec succès !');
          resolve(true);
        } else {
          console.error('❌ Format de fichier invalide');
          reject(new Error('Format de fichier invalide'));
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'import:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsText(file);
  });
};

// Exporter les fonctions pour utilisation dans l'application
export default {
  initAppConfigs,
  resetAppConfigs,
  showConfigStatus,
  exportConfigs,
  importConfigs
};
