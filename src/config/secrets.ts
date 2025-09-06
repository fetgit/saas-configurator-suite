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
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // En production, toutes les valeurs doivent venir des variables d'environnement
    return {
      database: {
        host: process.env.DB_HOST || '',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || '',
        username: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        ssl: process.env.DB_SSL === 'true'
      },
      jwt: {
        secret: process.env.JWT_SECRET || '',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        refreshSecret: process.env.JWT_REFRESH_SECRET || '',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      },
      encryption: {
        algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
        key: process.env.ENCRYPTION_KEY || '',
        iv: process.env.ENCRYPTION_IV || ''
      },
      apiKeys: {
        chatbot: process.env.CHATBOT_API_KEY || '',
        mailing: process.env.MAILING_API_KEY || '',
        analytics: process.env.ANALYTICS_API_KEY || ''
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
        secret: 'dev_jwt_secret_key_12345',
        expiresIn: '1h',
        refreshSecret: 'dev_refresh_secret_key_12345',
        refreshExpiresIn: '7d'
      },
      encryption: {
        algorithm: 'aes-256-gcm',
        key: 'dev_encryption_key_32_chars_12345',
        iv: 'dev_iv_16_chars_12'
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
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
};
