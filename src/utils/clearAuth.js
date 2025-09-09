// Utilitaire pour nettoyer complètement l'authentification
export const clearAllAuth = () => {
  console.log('🧹 Nettoyage complet de l\'authentification...');
  
  // Supprimer tous les tokens possibles
  const keysToRemove = [
    'auth_tokens',
    'accessToken', 
    'refreshToken',
    'user_data',
    'user',
    'token',
    'jwt_token'
  ];
  
  keysToRemove.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Supprimé: ${key}`);
    }
  });
  
  // Supprimer aussi sessionStorage
  keysToRemove.forEach(key => {
    if (sessionStorage.getItem(key)) {
      sessionStorage.removeItem(key);
      console.log(`✅ Supprimé de sessionStorage: ${key}`);
    }
  });
  
  // Nettoyage agressif : supprimer toutes les clés qui contiennent 'auth', 'token', 'user'
  const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('jwt')) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      console.log(`🗑️ Supprimé (agressif): ${key}`);
    }
  });
  
  console.log('🎯 Authentification nettoyée complètement');
  console.log('📋 État localStorage:', Object.keys(localStorage));
  console.log('📋 État sessionStorage:', Object.keys(sessionStorage));
};

// Fonction pour afficher l'état actuel de l'authentification
export const debugAuthState = () => {
  console.log('🔍 État actuel de l\'authentification:');
  console.log('📦 localStorage:', Object.keys(localStorage).reduce((acc, key) => {
    if (key.includes('auth') || key.includes('token') || key.includes('user')) {
      acc[key] = localStorage.getItem(key)?.substring(0, 50) + '...';
    }
    return acc;
  }, {}));
  
  console.log('📦 sessionStorage:', Object.keys(sessionStorage).reduce((acc, key) => {
    if (key.includes('auth') || key.includes('token') || key.includes('user')) {
      acc[key] = sessionStorage.getItem(key)?.substring(0, 50) + '...';
    }
    return acc;
  }, {}));
};
