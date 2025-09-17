/**
 * Utilitaire pour nettoyer les URLs blob invalides du localStorage
 */

export const cleanupBlobUrls = () => {
  try {
    const appearanceConfig = localStorage.getItem('appearanceConfig');
    if (appearanceConfig) {
      const config = JSON.parse(appearanceConfig);
      let hasChanges = false;

      // Nettoyer les URLs blob dans branding
      if (config.branding) {
        if (config.branding.logoUrl && config.branding.logoUrl.startsWith('blob:')) {
          config.branding.logoUrl = '';
          config.branding.logoId = undefined;
          hasChanges = true;
        }
        if (config.branding.faviconUrl && config.branding.faviconUrl.startsWith('blob:')) {
          config.branding.faviconUrl = '';
          config.branding.faviconId = undefined;
          hasChanges = true;
        }
      }

      // Nettoyer les URLs blob dans heroConfig
      if (config.heroConfig && config.heroConfig.backgroundImage && config.heroConfig.backgroundImage.startsWith('blob:')) {
        config.heroConfig.backgroundImage = '';
        config.heroConfig.backgroundImageId = undefined;
        hasChanges = true;
      }

      // Sauvegarder si des changements ont été faits
      if (hasChanges) {
        localStorage.setItem('appearanceConfig', JSON.stringify(config));
        console.log('🧹 URLs blob invalides nettoyées du localStorage');
        return true;
      }
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage des URLs blob:', error);
  }
  
  return false;
};

/**
 * Fonction pour nettoyer toutes les URLs blob du localStorage
 */
export const cleanupAllBlobUrls = () => {
  const keys = Object.keys(localStorage);
  let cleanedCount = 0;

  keys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value && value.includes('blob:')) {
        // Essayer de parser comme JSON
        const parsed = JSON.parse(value);
        const cleaned = JSON.stringify(parsed).replace(/blob:[^"]*/g, '');
        localStorage.setItem(key, cleaned);
        cleanedCount++;
      }
    } catch {
      // Ignorer les valeurs qui ne sont pas du JSON
    }
  });

  if (cleanedCount > 0) {
    console.log(`🧹 ${cleanedCount} entrées avec URLs blob nettoyées`);
  }

  return cleanedCount;
};
