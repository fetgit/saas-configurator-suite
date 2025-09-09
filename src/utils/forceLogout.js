// Script pour forcer une déconnexion complète
export const forceLogout = async () => {
  console.log('🚨 FORCE LOGOUT - Nettoyage complet');
  
  // 1. Supprimer tous les tokens du localStorage
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
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  // 2. Supprimer toutes les clés contenant 'auth', 'token', 'user', 'jwt'
  const allKeys = [...Object.keys(localStorage), ...Object.keys(sessionStorage)];
  allKeys.forEach(key => {
    if (key.toLowerCase().includes('auth') || 
        key.toLowerCase().includes('token') || 
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('jwt')) {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  });
  
  // 3. Nettoyer complètement le localStorage (dernière option)
  // localStorage.clear();
  // sessionStorage.clear();
  
  // 4. Rediriger vers la page de connexion
  window.location.href = '/login';
  
  console.log('✅ Force logout terminé');
};

// Script pour afficher tous les tokens stockés
export const debugAllTokens = () => {
  console.log('🔍 DEBUG ALL TOKENS:');
  
  // localStorage
  console.log('📦 localStorage:');
  Object.keys(localStorage).forEach(key => {
    const value = localStorage.getItem(key);
    if (value && (key.includes('auth') || key.includes('token') || key.includes('user') || key.includes('jwt'))) {
      console.log(`  ${key}: ${value.substring(0, 50)}...`);
    }
  });
  
  // sessionStorage
  console.log('📦 sessionStorage:');
  Object.keys(sessionStorage).forEach(key => {
    const value = sessionStorage.getItem(key);
    if (value && (key.includes('auth') || key.includes('token') || key.includes('user') || key.includes('jwt'))) {
      console.log(`  ${key}: ${value.substring(0, 50)}...`);
    }
  });
};
