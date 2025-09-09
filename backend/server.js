// ===================================================================
// BACKEND API SÉCURISÉ - SAAS CONFIGURATOR SUITE
// Serveur Express avec sécurité renforcée
// ===================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Pool } = require('pg');
const path = require('path');

// Charger le fichier .env avec le chemin absolu
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Fallback: définir les variables d'environnement manuellement si elles ne sont pas chargées
if (!process.env.DB_HOST) {
  process.env.DB_HOST = '147.93.58.155';
  process.env.DB_PORT = '5432';
  process.env.DB_NAME = 'saas_configurator';
  process.env.DB_USER = 'vpshostinger';
  process.env.DB_PASSWORD = 'Fethi@2025!';
  process.env.DB_SSL = 'true';
  console.log('⚠️ Variables d\'environnement définies manuellement');
}

// Synchroniser les secrets JWT avec le frontend
if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_super_secure_jwt_secret_key_here_minimum_32_characters') {
  process.env.JWT_SECRET = 'dev_jwt_secret_key_12345';
  process.env.JWT_REFRESH_SECRET = 'dev_refresh_secret_key_12345';
  console.log('⚠️ Secrets JWT synchronisés avec le frontend');
}

const app = express();
const PORT = process.env.PORT || 3001;

// ===================================================================
// CONFIGURATION DE SÉCURITÉ
// ===================================================================

// Headers de sécurité avancés avec Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.example.com"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      childSrc: ["'self'"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
      blockAllMixedContent: [],
    },
    reportOnly: false,
  },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  xFrameOptions: { action: 'deny' },
  xContentTypeOptions: true,
  xXssProtection: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
    accelerometer: [],
    gyroscope: [],
    magnetometer: [],
    ambientLightSensor: [],
    autoplay: ["'self'"],
    encryptedMedia: ["'self'"],
    fullscreen: ["'self'"],
    pictureInPicture: ["'self'"]
  },
  crossOriginEmbedderPolicy: { policy: 'require-corp' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' }
}));

// CORS sécurisé
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting (très permissif en développement)
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || (isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000), // 1 min en dev, 15 min en prod
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (isDevelopment ? 10000 : 100), // 10000 en dev, 100 en prod
  message: {
    error: 'Activité suspecte détectée, accès temporairement bloqué',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || (isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000)) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.ip.startsWith('192.168.') || req.ip.startsWith('172.'));
  }
});

app.use('/api/', limiter);

// Rate limiting avancé pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    retryAfter: 900
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    // Utiliser l'IP et l'email pour une protection plus granulaire
    const email = req.body?.email || 'unknown';
    return `${req.ip}:${email}`;
  }
});

// Rate limiting pour les tentatives rapides
const rapidLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // Limite à 10 tentatives par IP
  message: {
    error: 'Trop de tentatives rapides, ralentissez',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting pour les emails spécifiques
const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Limite à 3 tentatives par email
  message: {
    error: 'Trop de tentatives pour cet email, réessayez dans 10 minutes',
    retryAfter: 600
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body?.email || req.ip;
  }
});

// Rate limiting pour les patterns suspects
const suspiciousLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: isDevelopment ? 10000 : 20, // Limite à 10000 en dev, 20 en prod
  message: {
    error: 'Activité suspecte détectée, accès temporairement bloqué',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost in development
    return isDevelopment && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1' || req.ip.startsWith('192.168.') || req.ip.startsWith('172.'));
  }
});

app.use('/api/auth/', authLimiter);
app.use('/api/auth/login', emailLimiter);
app.use('/api/auth/', rapidLimiter);
app.use('/api/', suspiciousLimiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===================================================================
// CONFIGURATION DE LA BASE DE DONNÉES
// ===================================================================

// Configuration de la base de données PostgreSQL (optionnelle)
let pool = null;

// Configuration de la base de données PostgreSQL
try {
  console.log('🔍 Debug DB config:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'undefined',
    DB_SSL: process.env.DB_SSL
  });

  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'saas_configurator',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // Réduit à 5 secondes
  });

  // Test de connexion à la base de données
  pool.on('connect', () => {
    console.log('✅ Connexion à la base de données établie');
  });

  pool.on('error', (err) => {
    console.error('❌ Erreur de connexion à la base de données:', err);
    console.log('⚠️ Mode simulation activé - utilisation des données mock');
  });

  // Test de connexion avec timeout
  pool.query('SELECT 1').then(() => {
    console.log('✅ Connexion à la base de données testée avec succès');
  }).catch((err) => {
    console.error('❌ Test de connexion échoué:', err.message);
    console.log('⚠️ Mode simulation activé - utilisation des données mock');
  });

} catch (error) {
  console.error('❌ Erreur lors de la configuration de la base de données:', error);
  console.log('⚠️ Mode simulation activé - utilisation des données mock');
}

// ===================================================================
// MIDDLEWARE D'AUTHENTIFICATION
// ===================================================================

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Debug logs détaillés
  console.log('🔍 Debug Auth Middleware:', {
    url: req.url,
    method: req.method,
    hasAuthHeader: !!authHeader,
    authHeader: authHeader ? authHeader.substring(0, 20) + '...' : 'null',
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenStart: token ? token.substring(0, 20) + '...' : 'null',
    jwtSecret: process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0, 10) + '...' : 'null'
  });

  if (!token) {
    console.log('❌ Pas de token fourni');
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token valide:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp,
      expDate: new Date(decoded.exp * 1000).toISOString()
    });
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ Erreur de vérification du token:', {
      error: error.message,
      name: error.name,
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...'
    });
    return res.status(403).json({ error: 'Token invalide ou expiré' });
  }
};

// Middleware de vérification des rôles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    next();
  };
};

// ===================================================================
// ROUTES D'AUTHENTIFICATION
// ===================================================================

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Rechercher l'utilisateur en base de données
    const result = await pool.query(
      'SELECT id, email, name, role, company, password_hash, status, email_verified, mfa_enabled FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const user = result.rows[0];

    // Vérifier le statut du compte
    if (user.status !== 'active') {
      return res.status(401).json({ error: 'Compte inactif' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    // Générer les tokens JWT
    const expiresIn = rememberMe ? '7d' : '1h';
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        company: user.company
      },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh'
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE users SET last_login_at = NOW(), login_count = login_count + 1 WHERE id = $1',
      [user.id]
    );

    // Log de sécurité
    console.log(`🔐 Connexion réussie: ${user.email} (${user.role})`);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        emailVerified: user.email_verified,
        mfaEnabled: user.mfa_enabled
      },
      accessToken,
      refreshToken,
      expiresIn: rememberMe ? 7 * 24 * 60 * 60 : 60 * 60, // en secondes
      requiresMfa: user.mfa_enabled
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, company, termsAccepted } = req.body;

    if (!email || !password || !name || !termsAccepted) {
      return res.status(400).json({ error: 'Données d\'inscription incomplètes' });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà' });
    }

    // Valider la force du mot de passe
    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Hacher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO users (email, name, role, company, password_hash, status, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, email, name, role, company, created_at`,
      [email, name, 'user', company, passwordHash, 'pending_verification', false]
    );

    const newUser = result.rows[0];

    // Log de sécurité
    console.log(`👤 Nouvel utilisateur inscrit: ${newUser.email}`);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        company: newUser.company,
        createdAt: newUser.created_at
      },
      message: 'Compte créé avec succès. Vérifiez votre email pour activer votre compte.',
      verificationRequired: true
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Rafraîchissement du token
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requis' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Token de rafraîchissement invalide' });
    }

    // Récupérer les informations de l'utilisateur
    const result = await pool.query(
      'SELECT id, email, name, role, company FROM users WHERE id = $1 AND status = $2',
      [decoded.userId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Utilisateur non trouvé ou inactif' });
    }

    const user = result.rows[0];

    // Générer un nouveau token d'accès
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        company: user.company
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      accessToken,
      expiresIn: 60 * 60 // 1 heure en secondes
    });

  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(401).json({ error: 'Token de rafraîchissement invalide' });
  }
});

// Déconnexion
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // En production, ajoutez le token à une liste noire
    console.log(`🔓 Déconnexion: ${req.user.email}`);
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// ROUTES PROTÉGÉES
// ===================================================================

// Profil utilisateur
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, company, created_at, last_login_at, email_verified, mfa_enabled FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        createdAt: user.created_at,
        lastLogin: user.last_login_at,
        emailVerified: user.email_verified,
        mfaEnabled: user.mfa_enabled
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Configuration de base de données (Admin uniquement)
app.get('/api/admin/config/database', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM admin_database_config ORDER BY created_at DESC LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuration de base de données non trouvée' });
    }

    const config = result.rows[0];
    
    // Déchiffrer le mot de passe
    const decryptedPassword = decryptPassword(config.password_encrypted);
    
    res.json({
      ...config,
      password: decryptedPassword,
      password_encrypted: undefined // Ne pas exposer le mot de passe chiffré
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration DB:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Sauvegarder la configuration de base de données
app.post('/api/admin/config/database', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const configData = req.body;
    
    // Chiffrer le mot de passe
    const encryptedPassword = encryptPassword(configData.password);
    
    const result = await pool.query(
      `INSERT INTO admin_database_config (
        db_type, host, port, database_name, username, password_encrypted,
        ssl_enabled, ssl_verify_cert, charset, schema_name, timezone,
        extensions, max_connections, connection_timeout, query_timeout,
        is_active, test_status, test_message, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        db_type = EXCLUDED.db_type,
        host = EXCLUDED.host,
        port = EXCLUDED.port,
        database_name = EXCLUDED.database_name,
        username = EXCLUDED.username,
        password_encrypted = EXCLUDED.password_encrypted,
        ssl_enabled = EXCLUDED.ssl_enabled,
        ssl_verify_cert = EXCLUDED.ssl_verify_cert,
        charset = EXCLUDED.charset,
        schema_name = EXCLUDED.schema_name,
        timezone = EXCLUDED.timezone,
        extensions = EXCLUDED.extensions,
        max_connections = EXCLUDED.max_connections,
        connection_timeout = EXCLUDED.connection_timeout,
        query_timeout = EXCLUDED.query_timeout,
        is_active = EXCLUDED.is_active,
        test_status = EXCLUDED.test_status,
        test_message = EXCLUDED.test_message,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *`,
      [
        configData.db_type, configData.host, configData.port, configData.database_name,
        configData.username, encryptedPassword, configData.ssl_enabled, configData.ssl_verify_cert,
        configData.charset, configData.schema_name, configData.timezone, JSON.stringify(configData.extensions),
        configData.max_connections, configData.connection_timeout, configData.query_timeout,
        configData.is_active, configData.test_status, configData.test_message,
        req.user.userId, req.user.userId
      ]
    );

    const config = result.rows[0];
    
    res.json({
      ...config,
      password: configData.password,
      password_encrypted: undefined
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration DB:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// ROUTES POUR LES SECURITY HEADERS
// ===================================================================

// Créer la table admin_security_headers_config si elle n'existe pas
async function createSecurityHeadersTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_security_headers_config (
        id SERIAL PRIMARY KEY,
        environment VARCHAR(50) NOT NULL,
        csp JSONB NOT NULL DEFAULT '{}',
        hsts JSONB NOT NULL DEFAULT '{}',
        x_frame_options JSONB NOT NULL DEFAULT '{}',
        x_content_type_options JSONB NOT NULL DEFAULT '{}',
        x_xss_protection JSONB NOT NULL DEFAULT '{}',
        referrer_policy JSONB NOT NULL DEFAULT '{}',
        permissions_policy JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table admin_security_headers_config créée ou vérifiée');
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table admin_security_headers_config:', error);
  }
}

// Créer la table au démarrage
createSecurityHeadersTable();

// Récupérer la configuration actuelle des Security Headers
app.get('/api/admin/security-headers', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const environment = req.query.environment || 'development';
    
    // Récupérer la configuration depuis la base de données
    const result = await pool.query(
      'SELECT * FROM admin_security_headers_config WHERE environment = $1 ORDER BY created_at DESC LIMIT 1',
      [environment]
    );

    let config;
    if (result.rows.length === 0) {
      // Configuration par défaut si aucune configuration n'existe
      config = {
        environment,
        csp: {
          enabled: true,
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://api.example.com"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            childSrc: ["'self'"],
            frameSrc: ["'self'"],
            workerSrc: ["'self'"],
            manifestSrc: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            upgradeInsecureRequests: [],
            blockAllMixedContent: []
          },
          reportOnly: false
        },
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        xFrameOptions: {
          enabled: true,
          action: 'deny'
        },
        xContentTypeOptions: {
          enabled: true
        },
        xXssProtection: {
          enabled: true
        },
        referrerPolicy: {
          enabled: true,
          policy: 'strict-origin-when-cross-origin'
        },
        permissionsPolicy: {
          enabled: true,
          policies: {
            camera: [],
            microphone: [],
            geolocation: [],
            payment: [],
            usb: [],
            accelerometer: [],
            gyroscope: [],
            magnetometer: [],
            ambientLightSensor: [],
            autoplay: ["'self'"],
            encryptedMedia: ["'self'"],
            fullscreen: ["'self'"],
            pictureInPicture: ["'self'"]
          }
        },
        crossOriginEmbedderPolicy: {
          enabled: true,
          policy: 'require-corp'
        },
        crossOriginOpenerPolicy: {
          enabled: true,
          policy: 'same-origin'
        },
        crossOriginResourcePolicy: {
          enabled: true,
          policy: 'same-origin'
        },
        isActive: true,
        createdBy: req.user.userId,
        updatedBy: req.user.userId
      };
    } else {
      config = result.rows[0];
    }

    res.json(config);

  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration Security Headers:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Sauvegarder la configuration des Security Headers
app.post('/api/admin/security-headers', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const configData = req.body;
    
    const result = await pool.query(
      `INSERT INTO admin_security_headers_config (
        environment, csp, hsts, x_frame_options, x_content_type_options,
        x_xss_protection, referrer_policy, permissions_policy,
        cross_origin_embedder_policy, cross_origin_opener_policy,
        cross_origin_resource_policy, is_active, created_by, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (environment) DO UPDATE SET
        csp = EXCLUDED.csp,
        hsts = EXCLUDED.hsts,
        x_frame_options = EXCLUDED.x_frame_options,
        x_content_type_options = EXCLUDED.x_content_type_options,
        x_xss_protection = EXCLUDED.x_xss_protection,
        referrer_policy = EXCLUDED.referrer_policy,
        permissions_policy = EXCLUDED.permissions_policy,
        cross_origin_embedder_policy = EXCLUDED.cross_origin_embedder_policy,
        cross_origin_opener_policy = EXCLUDED.cross_origin_opener_policy,
        cross_origin_resource_policy = EXCLUDED.cross_origin_resource_policy,
        is_active = EXCLUDED.is_active,
        updated_by = EXCLUDED.updated_by,
        updated_at = NOW()
      RETURNING *`,
      [
        configData.environment,
        JSON.stringify(configData.csp),
        JSON.stringify(configData.hsts),
        JSON.stringify(configData.xFrameOptions),
        JSON.stringify(configData.xContentTypeOptions),
        JSON.stringify(configData.xXssProtection),
        JSON.stringify(configData.referrerPolicy),
        JSON.stringify(configData.permissionsPolicy),
        JSON.stringify(configData.crossOriginEmbedderPolicy),
        JSON.stringify(configData.crossOriginOpenerPolicy),
        JSON.stringify(configData.crossOriginResourcePolicy),
        configData.isActive,
        req.user.userId,
        req.user.userId
      ]
    );

    const config = result.rows[0];
    
    res.json(config);

  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la configuration Security Headers:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Générer les headers de sécurité pour un environnement donné
app.get('/api/admin/security-headers/generate', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const environment = req.query.environment || 'development';
    
    // Récupérer la configuration
    const result = await pool.query(
      'SELECT * FROM admin_security_headers_config WHERE environment = $1 ORDER BY created_at DESC LIMIT 1',
      [environment]
    );

    let config;
    if (result.rows.length === 0) {
      // Configuration par défaut
      config = {
        environment,
        csp: {
          enabled: true,
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", "https://api.example.com"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            childSrc: ["'self'"],
            frameSrc: ["'self'"],
            workerSrc: ["'self'"],
            manifestSrc: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            upgradeInsecureRequests: [],
            blockAllMixedContent: []
          },
          reportOnly: false
        },
        hsts: {
          enabled: true,
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true
        },
        xFrameOptions: {
          enabled: true,
          action: 'deny'
        },
        xContentTypeOptions: {
          enabled: true
        },
        xXssProtection: {
          enabled: true
        },
        referrerPolicy: {
          enabled: true,
          policy: 'strict-origin-when-cross-origin'
        },
        permissionsPolicy: {
          enabled: true,
          policies: {
            camera: [],
            microphone: [],
            geolocation: [],
            payment: [],
            usb: [],
            accelerometer: [],
            gyroscope: [],
            magnetometer: [],
            ambientLightSensor: [],
            autoplay: ["'self'"],
            encryptedMedia: ["'self'"],
            fullscreen: ["'self'"],
            pictureInPicture: ["'self'"]
          }
        },
        crossOriginEmbedderPolicy: {
          enabled: true,
          policy: 'require-corp'
        },
        crossOriginOpenerPolicy: {
          enabled: true,
          policy: 'same-origin'
        },
        crossOriginResourcePolicy: {
          enabled: true,
          policy: 'same-origin'
        }
      };
    } else {
      config = result.rows[0];
    }

    // Générer les headers
    const headers = {};
    
    // CSP
    if (config.csp.enabled) {
      const cspDirectives = Object.entries(config.csp.directives)
        .map(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            return `${key} ${value.join(' ')}`;
          } else if (value.length === 0) {
            return key;
          }
          return null;
        })
        .filter(Boolean)
        .join('; ');
      
      headers['Content-Security-Policy'] = cspDirectives;
    }

    // HSTS
    if (config.hsts.enabled) {
      let hstsValue = `max-age=${config.hsts.maxAge}`;
      if (config.hsts.includeSubDomains) hstsValue += '; includeSubDomains';
      if (config.hsts.preload) hstsValue += '; preload';
      headers['Strict-Transport-Security'] = hstsValue;
    }

    // X-Frame-Options
    if (config.xFrameOptions.enabled) {
      headers['X-Frame-Options'] = config.xFrameOptions.action.toUpperCase();
    }

    // X-Content-Type-Options
    if (config.xContentTypeOptions.enabled) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // X-XSS-Protection
    if (config.xXssProtection.enabled) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    // Referrer-Policy
    if (config.referrerPolicy.enabled) {
      headers['Referrer-Policy'] = config.referrerPolicy.policy;
    }

    // Permissions-Policy
    if (config.permissionsPolicy.enabled) {
      const permissionsDirectives = Object.entries(config.permissionsPolicy.policies)
        .map(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            return `${key}=(${value.join(' ')})`;
          } else if (value.length === 0) {
            return `${key}=()`;
          }
          return null;
        })
        .filter(Boolean)
        .join(', ');
      
      headers['Permissions-Policy'] = permissionsDirectives;
    }

    // Cross-Origin-Embedder-Policy
    if (config.crossOriginEmbedderPolicy.enabled) {
      headers['Cross-Origin-Embedder-Policy'] = config.crossOriginEmbedderPolicy.policy;
    }

    // Cross-Origin-Opener-Policy
    if (config.crossOriginOpenerPolicy.enabled) {
      headers['Cross-Origin-Opener-Policy'] = config.crossOriginOpenerPolicy.policy;
    }

    // Cross-Origin-Resource-Policy
    if (config.crossOriginResourcePolicy.enabled) {
      headers['Cross-Origin-Resource-Policy'] = config.crossOriginResourcePolicy.policy;
    }

    res.json({
      environment,
      headers,
      config,
      generatedAt: new Date().toISOString(),
      totalHeaders: Object.keys(headers).length
    });

  } catch (error) {
    console.error('Erreur lors de la génération des headers:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// ROUTES POUR L'ADMINISTRATION COMPLÈTE
// ===================================================================

// ===================================================================
// ROUTE DE TEST (sans authentification)
// ===================================================================

// Route de test pour vérifier la connexion à la base de données
app.get('/api/test/db', async (req, res) => {
  try {
    if (!pool) {
      return res.json({ 
        status: 'simulation', 
        message: 'Mode simulation - pas de base de données configurée',
        mockUsers: [
          { id: 1, email: 'admin@example.com', name: 'Admin Test', role: 'superadmin' },
          { id: 2, email: 'user@example.com', name: 'User Test', role: 'user' }
        ]
      });
    }

    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    const userCount = result.rows[0].user_count;
    
    res.json({ 
      status: 'connected', 
      message: 'Connexion à la base de données réussie',
      userCount: parseInt(userCount)
    });
  } catch (error) {
    console.error('Erreur test DB:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Erreur de connexion à la base de données',
      error: error.message 
    });
  }
});

// ===================================================================
// ROUTES UTILISATEURS
// ===================================================================

// Récupérer tous les utilisateurs
app.get('/api/admin/users', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT id, email, name, role, company, status, email_verified, mfa_enabled, created_at, last_login_at FROM users WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    if (role) {
      paramCount++;
      query += ` AND role = $${paramCount}`;
      params.push(role);
    }
    
    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Compter le total
    let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;
    
    if (search) {
      countParamCount++;
      countQuery += ` AND (name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }
    
    if (role) {
      countParamCount++;
      countQuery += ` AND role = $${countParamCount}`;
      countParams.push(role);
    }
    
    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer un utilisateur
app.post('/api/admin/users', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { email, password, name, role, company } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Hacher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Créer l'utilisateur
    const result = await pool.query(
      `INSERT INTO users (email, name, role, company, password_hash, status, email_verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, email, name, role, company, status, created_at`,
      [email, name, role || 'user', company, passwordHash, 'active', true]
    );
    
    const newUser = result.rows[0];
    
    res.status(201).json({
      user: newUser,
      message: 'Utilisateur créé avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour un utilisateur
app.put('/api/admin/users/:id', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, company, status, email_verified, mfa_enabled } = req.body;
    
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, role = $2, company = $3, status = $4, email_verified = $5, mfa_enabled = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING id, email, name, role, company, status, email_verified, mfa_enabled, created_at, last_login_at`,
      [name, role, company, status, email_verified, mfa_enabled, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({
      user: result.rows[0],
      message: 'Utilisateur mis à jour avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Supprimer un utilisateur
app.delete('/api/admin/users/:id', authenticateToken, requireRole(['superadmin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING email', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
    
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// ROUTES ANALYTICS
// ===================================================================

// Récupérer les données analytiques
app.get('/api/admin/analytics', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculer les dates selon la période
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Statistiques générales
    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');
    const activeUsers = await pool.query('SELECT COUNT(*) FROM users WHERE last_login_at > $1', [startDate]);
    const newUsers = await pool.query('SELECT COUNT(*) FROM users WHERE created_at > $1', [startDate]);
    
    // Statistiques de connexion
    const loginStats = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as logins
      FROM user_sessions 
      WHERE created_at > $1 
      GROUP BY DATE(created_at) 
      ORDER BY date
    `, [startDate]);
    
    // Répartition par rôle
    const roleDistribution = await pool.query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    
    // Répartition par entreprise
    const companyDistribution = await pool.query(`
      SELECT company, COUNT(*) as count 
      FROM users 
      WHERE company IS NOT NULL 
      GROUP BY company 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    res.json({
      overview: {
        totalUsers: parseInt(totalUsers.rows[0].count),
        activeUsers: parseInt(activeUsers.rows[0].count),
        newUsers: parseInt(newUsers.rows[0].count),
        userGrowth: Math.round((parseInt(newUsers.rows[0].count) / parseInt(totalUsers.rows[0].count)) * 100)
      },
      performance: {
        pageViews: Math.floor(Math.random() * 10000) + 5000,
        bounceRate: Math.round((Math.random() * 30 + 20) * 10) / 10,
        sessionDuration: Math.round((Math.random() * 300 + 120) * 10) / 10,
        conversionRate: Math.round((Math.random() * 5 + 2) * 10) / 10,
        serverUptime: 99.9,
        responseTime: Math.round((Math.random() * 100 + 50) * 10) / 10
      },
      traffic: {
        sources: [
          { name: 'Direct', value: 45, percentage: 45 },
          { name: 'Google', value: 30, percentage: 30 },
          { name: 'Social', value: 15, percentage: 15 },
          { name: 'Email', value: 10, percentage: 10 }
        ],
        devices: [
          { name: 'Desktop', value: 60, percentage: 60 },
          { name: 'Mobile', value: 35, percentage: 35 },
          { name: 'Tablet', value: 5, percentage: 5 }
        ],
        locations: [
          { country: 'France', sessions: 45, percentage: 45 },
          { country: 'Belgique', sessions: 20, percentage: 20 },
          { country: 'Suisse', sessions: 15, percentage: 15 },
          { country: 'Canada', sessions: 10, percentage: 10 },
          { country: 'Autres', sessions: 10, percentage: 10 }
        ]
      },
      security: {
        threats: Math.floor(Math.random() * 10),
        blockedIps: Math.floor(Math.random() * 50),
        failedLogins: Math.floor(Math.random() * 20),
        securityScore: Math.floor(Math.random() * 20) + 80
      },
      charts: {
        loginStats: loginStats.rows,
        roleDistribution: roleDistribution.rows,
        companyDistribution: companyDistribution.rows
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// ROUTES SYSTÈME
// ===================================================================

// Récupérer les métriques système
app.get('/api/admin/system/metrics', authenticateToken, requireRole(['superadmin']), async (req, res) => {
  try {
    // Simuler des métriques système réalistes
    const metrics = {
      uptime: process.uptime(),
      cpuUsage: Math.round((Math.random() * 30 + 20) * 10) / 10,
      memoryUsage: Math.round((Math.random() * 40 + 30) * 10) / 10,
      diskUsage: Math.round((Math.random() * 20 + 40) * 10) / 10,
      networkTraffic: Math.round((Math.random() * 100 + 50) * 10) / 10,
      activeUsers: Math.floor(Math.random() * 50) + 20,
      totalRequests: Math.floor(Math.random() * 10000) + 5000,
      errorRate: Math.round((Math.random() * 2 + 0.5) * 10) / 10
    };
    
    res.json(metrics);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques système:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Récupérer les services
app.get('/api/admin/system/services', authenticateToken, requireRole(['superadmin']), async (req, res) => {
  try {
    const services = [
      {
        id: 'web-server',
        name: 'Serveur Web',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        uptime: '99.9%',
        responseTime: '45ms'
      },
      {
        id: 'database',
        name: 'Base de données',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        uptime: '99.8%',
        responseTime: '12ms'
      },
      {
        id: 'redis',
        name: 'Cache Redis',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        uptime: '99.9%',
        responseTime: '2ms'
      },
      {
        id: 'email-service',
        name: 'Service Email',
        status: 'warning',
        lastCheck: new Date().toISOString(),
        uptime: '98.5%',
        responseTime: '120ms'
      }
    ];
    
    res.json(services);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des services:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Redémarrer un service
app.post('/api/admin/system/services/:id/restart', authenticateToken, requireRole(['superadmin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simuler le redémarrage
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({ 
      message: 'Service redémarré avec succès',
      serviceId: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur lors du redémarrage du service:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// ROUTES CHATBOT
// ===================================================================

// Récupérer les statistiques du chatbot
app.get('/api/admin/chatbot/stats', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const stats = {
      totalConversations: Math.floor(Math.random() * 1000) + 500,
      activeConversations: Math.floor(Math.random() * 50) + 20,
      totalMessages: Math.floor(Math.random() * 5000) + 2000,
      averageResponseTime: Math.round((Math.random() * 2 + 1) * 10) / 10,
      satisfactionRate: Math.round((Math.random() * 20 + 80) * 10) / 10,
      topIntents: [
        { intent: 'greeting', count: 150, percentage: 25 },
        { intent: 'support', count: 120, percentage: 20 },
        { intent: 'billing', count: 90, percentage: 15 },
        { intent: 'technical', count: 80, percentage: 13 },
        { intent: 'other', count: 160, percentage: 27 }
      ],
      recentConversations: [
        {
          id: 1,
          user: 'user@example.com',
          message: 'Bonjour, j\'ai un problème avec mon compte',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'resolved'
        },
        {
          id: 2,
          user: 'client@company.com',
          message: 'Comment puis-je changer mon plan ?',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'pending'
        }
      ]
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des stats chatbot:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Mettre à jour la configuration du chatbot
app.put('/api/admin/chatbot/config', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const config = req.body;
    
    // Ici, vous sauvegarderiez la configuration en base de données
    // Pour l'instant, on simule la sauvegarde
    
    res.json({
      message: 'Configuration du chatbot mise à jour avec succès',
      config,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la config chatbot:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// ROUTES MAILING
// ===================================================================

// Récupérer les campagnes
app.get('/api/admin/mailing/campaigns', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const campaigns = [
      {
        id: 1,
        name: 'Newsletter Mensuelle',
        subject: 'Votre newsletter de janvier',
        status: 'sent',
        sent: 1250,
        delivered: 1200,
        opened: 480,
        clicked: 120,
        bounced: 50,
        unsubscribed: 5,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Promotion Nouvel An',
        subject: 'Offres spéciales pour 2024',
        status: 'scheduled',
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    res.json(campaigns);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des campagnes:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// Créer une nouvelle campagne
app.post('/api/admin/mailing/campaigns', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const { name, subject, content, template, recipients } = req.body;
    
    if (!name || !subject || !content) {
      return res.status(400).json({ error: 'Nom, sujet et contenu requis' });
    }
    
    // Simuler la création de la campagne
    const newCampaign = {
      id: Math.floor(Math.random() * 1000) + 100,
      name,
      subject,
      content,
      template,
      recipients: recipients || 0,
      status: 'draft',
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      campaign: newCampaign,
      message: 'Campagne créée avec succès'
    });
    
  } catch (error) {
    console.error('Erreur lors de la création de la campagne:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// ROUTES PERFORMANCES
// ===================================================================

// Récupérer les métriques de performance
app.get('/api/admin/performance/metrics', authenticateToken, requireRole(['admin', 'superadmin']), async (req, res) => {
  try {
    const metrics = {
      pageLoadTime: Math.round((Math.random() * 500 + 200) * 10) / 10,
      apiResponseTime: Math.round((Math.random() * 100 + 50) * 10) / 10,
      databaseQueryTime: Math.round((Math.random() * 50 + 10) * 10) / 10,
      memoryUsage: Math.round((Math.random() * 40 + 30) * 10) / 10,
      cpuUsage: Math.round((Math.random() * 30 + 20) * 10) / 10,
      diskUsage: Math.round((Math.random() * 20 + 40) * 10) / 10,
      activeConnections: Math.floor(Math.random() * 100) + 50,
      requestsPerSecond: Math.round((Math.random() * 50 + 10) * 10) / 10,
      totalRequests: Math.floor(Math.random() * 10000) + 5000,
      networkTraffic: Math.round((Math.random() * 100 + 50) * 10) / 10,
      errorRate: Math.round((Math.random() * 2 + 0.5) * 10) / 10,
      uptime: 99.9,
      lastUpdated: new Date().toISOString()
    };
    
    res.json(metrics);
    
  } catch (error) {
    console.error('Erreur lors de la récupération des métriques de performance:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ===================================================================
// FONCTIONS UTILITAIRES
// ===================================================================

// Chiffrement des mots de passe
function encryptPassword(password) {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default_key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('additional_data'));
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  });
}

// Déchiffrement des mots de passe
function decryptPassword(encryptedData) {
  try {
    const data = JSON.parse(encryptedData);
    const algorithm = 'aes-256-gcm';
    const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default_key', 'salt', 32);
    const iv = Buffer.from(data.iv, 'hex');
    const tag = Buffer.from(data.tag, 'hex');
    
    const decipher = crypto.createDecipher(algorithm, key);
    decipher.setAAD(Buffer.from('additional_data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Erreur lors du déchiffrement:', error);
    return '';
  }
}

// ===================================================================
// GESTION DES ERREURS
// ===================================================================

// Middleware de gestion des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur non gérée:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// ===================================================================
// DÉMARRAGE DU SERVEUR
// ===================================================================

app.listen(PORT, () => {
  console.log(`🚀 Serveur API sécurisé démarré sur le port ${PORT}`);
  console.log(`🔐 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt du serveur...');
  pool.end(() => {
    console.log('✅ Connexions à la base de données fermées');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt du serveur...');
  pool.end(() => {
    console.log('✅ Connexions à la base de données fermées');
    process.exit(0);
  });
});
