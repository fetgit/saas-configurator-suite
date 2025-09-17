// Utilitaire pour forcer le rechargement de la configuration d'apparence
export const forceConfigReload = () => {
  // Vider le cache localStorage
  localStorage.removeItem('appearanceConfig');
  
  // Vider le cache du navigateur pour cette page
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
  
  // Forcer le rechargement de la page
  window.location.reload();
};

// Fonction pour nettoyer le localStorage et recharger
export const clearAppearanceCache = () => {
  console.log('🧹 Nettoyage du cache d\'apparence...');
  
  // Supprimer toutes les clés liées à l'apparence
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('appearance') || key.includes('config'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Supprimé: ${key}`);
  });
  
  console.log('✅ Cache d\'apparence nettoyé');
};
