// Utilitaire pour décoder un token JWT côté frontend
export const decodeToken = (token) => {
  try {
    // Décoder le token JWT (sans vérification de signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token JWT invalide - format incorrect');
    }
    
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('🔍 Analyse du token JWT:');
    console.log('📋 Header:', header);
    console.log('📋 Payload:', payload);
    
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      console.log('⏰ Date d\'expiration:', expDate.toISOString());
      console.log('⏰ Maintenant:', now.toISOString());
      console.log('⏰ Token expiré?', now > expDate);
    }
    
    return { header, payload };
  } catch (error) {
    console.error('❌ Erreur de décodage du token:', error.message);
    return null;
  }
};

// Fonction pour afficher le token complet
export const debugToken = (token) => {
  console.log('🎫 Token complet:', token);
  console.log('📏 Longueur:', token.length);
  console.log('🔍 Début:', token.substring(0, 50) + '...');
  console.log('🔍 Fin:', '...' + token.substring(token.length - 50));
  
  return decodeToken(token);
};
