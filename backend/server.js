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
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ===================================================================
// CONFIGURATION DE SÉCURITÉ
// ===================================================================

// Headers de sécurité avec Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS sécurisé
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite par IP
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes.',
    retryAfter: 900
  },
  skipSuccessfulRequests: true
});

app.use('/api/auth/', authLimiter);

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===================================================================
// CONFIGURATION DE LA BASE DE DONNÉES
// ===================================================================

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'saas_configurator',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion à la base de données
pool.on('connect', () => {
  console.log('✅ Connexion à la base de données établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion à la base de données:', err);
});

// ===================================================================
// MIDDLEWARE D'AUTHENTIFICATION
// ===================================================================

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token d\'accès requis' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
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
  console.log(`🌐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
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
