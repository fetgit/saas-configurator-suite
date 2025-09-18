// ===================================================================
// GESTION DES SECRETS
// Configuration centralisée des secrets et variables d'environnement
// ===================================================================

// Interface pour les secrets de l'application
export interface AppSecrets {
  // Base de données
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  
  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  
  // Chiffrement
  encryption: {
    algorithm: string;
    key: string;
    iv: string;
  };
  
  // API Keys
  apiKeys: {
    chatbot: string;
    mailing: string;
    analytics: string;
  };
}

// Fonction pour charger les secrets depuis les variables d'environnement
export const loadSecrets = (): AppSecrets => {
  // En production, ces valeurs viendront des variables d'environnement
  // En développement, on utilise des valeurs par défaut sécurisées
  
  const isProduction = import.meta.env.PROD;
  
  if (isProduction) {
    // En production, toutes les valeurs doivent venir des variables d'environnement
    return {
      database: {
        host: import.meta.env.VITE_DB_HOST || '',
        port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
        database: import.meta.env.VITE_DB_NAME || '',
        username: import.meta.env.VITE_DB_USER || '',
        password: import.meta.env.VITE_DB_PASSWORD || '',
        ssl: import.meta.env.VITE_DB_SSL === 'true'
      },
      jwt: {
        secret: import.meta.env.VITE_JWT_SECRET || '',
        expiresIn: import.meta.env.VITE_JWT_EXPIRES_IN || '1h',
        refreshSecret: import.meta.env.VITE_JWT_REFRESH_SECRET || '',
        refreshExpiresIn: import.meta.env.VITE_JWT_REFRESH_EXPIRES_IN || '7d'
      },
      encryption: {
        algorithm: import.meta.env.VITE_ENCRYPTION_ALGORITHM || 'aes-256-gcm',
        key: import.meta.env.VITE_ENCRYPTION_KEY || '',
        iv: import.meta.env.VITE_ENCRYPTION_IV || ''
      },
      apiKeys: {
        chatbot: import.meta.env.VITE_CHATBOT_API_KEY || '',
        mailing: import.meta.env.VITE_MAILING_API_KEY || '',
        analytics: import.meta.env.VITE_ANALYTICS_API_KEY || ''
      }
    };
  } else {
    // En développement, on utilise des valeurs par défaut
    // ATTENTION: Ces valeurs ne doivent JAMAIS être utilisées en production
    return {
      database: {
        host: 'localhost',
        port: 5432,
        database: 'saas_configurator_dev',
        username: 'dev_user',
        password: 'dev_password_123',
        ssl: false
      },
      jwt: {
        secret: '247721d8292dff1f050e951a6184ec54d96e00295f2ce0861a31ae2304072e6842fac75b8678544d177578a64b56f514fdb8d0059bafcb1f91ddecdcd4f3867c',
        expiresIn: '1h',
        refreshSecret: '446266a28f45176a2a6245840a45014f0cc95baf7b3ecd61cf0864605febf4c37c78cfd596fe4a56049776d148cb55d3b66c631250a498d73ca2906430543799',
        refreshExpiresIn: '7d'
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        key: '2c9d3321b5e70676822617480fb7d24cdd25fe5b6777607397dba02c43be838b',
        iv: '7c04edb22d33d65246695a44ceb4ed0f'
      },
      apiKeys: {
        chatbot: 'dev_chatbot_key',
        mailing: 'dev_mailing_key',
        analytics: 'dev_analytics_key'
      }
    };
  }
};

// Instance globale des secrets
export const secrets = loadSecrets();

// Fonction pour valider que tous les secrets requis sont présents
export const validateSecrets = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  if (!secrets.database.host) missing.push('DB_HOST');
  if (!secrets.database.username) missing.push('DB_USER');
  if (!secrets.database.password) missing.push('DB_PASSWORD');
  if (!secrets.jwt.secret) missing.push('JWT_SECRET');
  if (!secrets.jwt.refreshSecret) missing.push('JWT_REFRESH_SECRET');
  if (!secrets.encryption.key) missing.push('ENCRYPTION_KEY');
  
  return {
    valid: missing.length === 0,
    missing
  };
};

// Fonction pour masquer les secrets dans les logs
export const maskSecret = (secret: string): string => {
  if (secret.length <= 4) return '*'.repeat(secret.length);
  return secret.substring(0, 2) + '*'.repeat(secret.length - 4) + secret.substring(secret.length - 2);
};

// Fonction pour logger les secrets de manière sécurisée
export const logSecrets = (): void => {
  console.log('🔐 Configuration des secrets:');
  console.log(`   Database: ${secrets.database.host}:${secrets.database.port}/${secrets.database.database}`);
  console.log(`   Database User: ${secrets.database.username}`);
  console.log(`   Database Password: ${maskSecret(secrets.database.password)}`);
  console.log(`   JWT Secret: ${maskSecret(secrets.jwt.secret)}`);
  console.log(`   Encryption Key: ${maskSecret(secrets.encryption.key)}`);
  console.log(`   Environment: ${import.meta.env.MODE || 'development'}`);
};
