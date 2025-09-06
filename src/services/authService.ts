// ===================================================================
// SERVICE D'AUTHENTIFICATION SÉCURISÉ
// Remplacement de l'authentification simulée par JWT
// ===================================================================

import { secrets } from '@/config/secrets';
import { EncryptionService } from './encryptionService';
import { TwoFactorService, TwoFactorConfig } from './twoFactorService';

// Interface pour les tokens JWT
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  company?: string;
  iat: number;
  exp: number;
  jti: string; // JWT ID pour la révocation
}

// Interface pour la réponse d'authentification
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    company?: string;
    createdAt: string;
    lastLogin: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  requiresMfa?: boolean;
}

// Interface pour les credentials de connexion
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
  mfaCode?: string;
  twoFactorCode?: string;
  backupCode?: string;
}

// Interface pour l'inscription
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  company?: string;
  termsAccepted: boolean;
  marketingConsent?: boolean;
}

// Interface pour l'utilisateur
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company?: string;
  createdAt: string;
  lastLogin: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
}

// Classe de gestion de l'authentification
export class AuthService {
  private static readonly TOKEN_STORAGE_KEY = 'auth_tokens';
  private static readonly USER_STORAGE_KEY = 'user_data';

  // Générer un JWT token
  private static async generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = this.parseExpiresIn(secrets.jwt.expiresIn);
    
    const jwtPayload: JWTPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
      jti: this.generateJTI()
    };

    // En production, utilisez une vraie bibliothèque JWT comme jsonwebtoken
    // Pour le développement, on simule la génération
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(jwtPayload));
    const signature = await this.generateSignature(encodedHeader, encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Générer un refresh token
  private static async generateRefreshToken(userId: string): Promise<string> {
    const payload = {
      userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(secrets.jwt.refreshExpiresIn),
      jti: this.generateJTI()
    };

    return await this.generateJWT(payload as any);
  }

  // Parser la durée d'expiration
  private static parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 3600; // 1 heure par défaut
    }
  }

  // Générer un JWT ID unique
  private static generateJTI(): string {
    return crypto.randomUUID();
  }

  // Générer une signature (simulation)
  private static async generateSignature(header: string, payload: string): Promise<string> {
    const data = `${header}.${payload}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secrets.jwt.secret);
    const dataBuffer = encoder.encode(data);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, dataBuffer);
    const signatureArray = new Uint8Array(signature);
    return btoa(String.fromCharCode(...signatureArray));
  }

  // Vérifier un JWT token
  static async verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT invalide');
      }

      const [header, payload, signature] = parts;
      
      // Vérifier la signature
      const expectedSignature = await this.generateSignature(header, payload);
      if (signature !== expectedSignature) {
        throw new Error('Signature JWT invalide');
      }

      // Décoder le payload
      const decodedPayload = JSON.parse(atob(payload)) as JWTPayload;
      
      // Vérifier l'expiration
      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token JWT expiré');
      }

      return decodedPayload;
    } catch (error) {
      console.error('Erreur lors de la vérification du JWT:', error);
      return null;
    }
  }

  // Hacher un mot de passe
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);
    return Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Vérifier un mot de passe
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  }

  // Connexion utilisateur
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Pour le développement, on utilise les utilisateurs créés en base de données
      // En production, ceci sera remplacé par un appel API au backend
      
      // Simulation de la vérification en base de données
      // Les vrais utilisateurs sont : admin@heleam.com, adminuser@heleam.com, user@heleam.com
      const validUsers = [
        {
          id: 'b53a06c8-1a22-4995-bf7c-e091e57953a5',
          email: 'admin@heleam.com',
          name: 'Super Admin Heleam',
          role: 'superadmin',
          company: 'Heleam',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: true,
          mfaEnabled: false,
          status: 'active',
          password: 'AdminHeleam2025!',
          twoFactorEnabled: false,
          twoFactorSecret: null
        },
        {
          id: '8bf3c397-b5dd-4d86-983c-5b736084dccc',
          email: 'adminuser@heleam.com',
          name: 'Admin User Heleam',
          role: 'admin',
          company: 'Heleam',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: true,
          mfaEnabled: false,
          status: 'active',
          password: 'AdminUser2025!',
          twoFactorEnabled: false,
          twoFactorSecret: null
        },
        {
          id: '700f7654-8c8b-4595-914e-ac9f8ea583ac',
          email: 'user@heleam.com',
          name: 'Regular User Heleam',
          role: 'user',
          company: 'Heleam',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          emailVerified: true,
          mfaEnabled: false,
          status: 'active',
          password: 'UserHeleam2025!',
          twoFactorEnabled: false,
          twoFactorSecret: null
        }
      ];

      const user = validUsers.find(u => u.email === credentials.email);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier le mot de passe
      const isValidPassword = credentials.password === user.password;
      if (!isValidPassword) {
        throw new Error('Mot de passe incorrect');
      }

      // Vérifier le statut de l'utilisateur
      if (user.status !== 'active') {
        throw new Error('Compte utilisateur inactif');
      }

      // Générer les tokens
      const accessToken = await this.generateJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        company: user.company
      });

      const refreshToken = await this.generateRefreshToken(user.id);

      // Mettre à jour la dernière connexion
      user.lastLogin = new Date().toISOString();

      // Stocker les tokens de manière sécurisée
      await this.storeTokens(accessToken, refreshToken);
      await this.storeUser(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          company: user.company,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        },
        accessToken,
        refreshToken,
        expiresIn: this.parseExpiresIn(secrets.jwt.expiresIn),
        requiresMfa: user.mfaEnabled
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  }

  // Inscription utilisateur
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Valider les données
      if (!data.email || !data.password || !data.name) {
        throw new Error('Données d\'inscription incomplètes');
      }

      if (!data.termsAccepted) {
        throw new Error('Vous devez accepter les conditions d\'utilisation');
      }

      // Vérifier la force du mot de passe
      const passwordValidation = EncryptionService.validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Mot de passe faible: ${passwordValidation.feedback.join(', ')}`);
      }

      // Créer un nouvel utilisateur
      const newUser: User = {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        role: 'user',
        company: data.company,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        emailVerified: false,
        mfaEnabled: false,
        status: 'pending_verification'
      };

      // En production, sauvegardez l'utilisateur en base de données
      // Pour le développement, on simule

      // Générer les tokens
      const accessToken = await this.generateJWT({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        company: newUser.company
      });

      const refreshToken = await this.generateRefreshToken(newUser.id);

      // Stocker les tokens et l'utilisateur
      await this.storeTokens(accessToken, refreshToken);
      await this.storeUser(newUser);

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          company: newUser.company,
          createdAt: newUser.createdAt,
          lastLogin: newUser.lastLogin
        },
        accessToken,
        refreshToken,
        expiresIn: this.parseExpiresIn(secrets.jwt.expiresIn)
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  // Rafraîchir un token
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = await this.verifyJWT(refreshToken);
      if (!payload || payload.type !== 'refresh') {
        throw new Error('Refresh token invalide');
      }

      // Générer un nouveau token d'accès
      const accessToken = await this.generateJWT({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        company: payload.company
      });

      return {
        accessToken,
        expiresIn: this.parseExpiresIn(secrets.jwt.expiresIn)
      };
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw error;
    }
  }

  // Déconnexion
  static async logout(): Promise<void> {
    try {
      // Supprimer les tokens du stockage
      localStorage.removeItem(this.TOKEN_STORAGE_KEY);
      localStorage.removeItem(this.USER_STORAGE_KEY);
      
      // En production, ajoutez le token à une liste noire
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  }

  // Stocker les tokens de manière sécurisée
  private static async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    const tokens = {
      accessToken,
      refreshToken,
      timestamp: Date.now()
    };
    
    // Chiffrer les tokens avant de les stocker
    const encryptedTokens = await EncryptionService.encryptString(JSON.stringify(tokens));
    localStorage.setItem(this.TOKEN_STORAGE_KEY, encryptedTokens);
  }

  // Récupérer les tokens stockés
  static async getStoredTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const encryptedTokens = localStorage.getItem(this.TOKEN_STORAGE_KEY);
      if (!encryptedTokens) {
        return null;
      }

      const tokens = JSON.parse(await EncryptionService.decryptString(encryptedTokens));
      return tokens;
    } catch (error) {
      console.error('Erreur lors de la récupération des tokens:', error);
      return null;
    }
  }

  // Stocker les données utilisateur
  private static async storeUser(user: User): Promise<void> {
    const encryptedUser = await EncryptionService.encryptString(JSON.stringify(user));
    localStorage.setItem(this.USER_STORAGE_KEY, encryptedUser);
  }

  // Récupérer l'utilisateur stocké
  static async getStoredUser(): Promise<User | null> {
    try {
      const encryptedUser = localStorage.getItem(this.USER_STORAGE_KEY);
      if (!encryptedUser) {
        return null;
      }

      const user = JSON.parse(await EncryptionService.decryptString(encryptedUser));
      return user;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  // Vérifier si l'utilisateur est authentifié
  static async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens) {
        return false;
      }

      const payload = await this.verifyJWT(tokens.accessToken);
      return payload !== null;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      return false;
    }
  }

  // Obtenir l'utilisateur actuel
  static async getCurrentUser(): Promise<User | null> {
    try {
      const tokens = await this.getStoredTokens();
      if (!tokens) {
        return null;
      }

      const payload = await this.verifyJWT(tokens.accessToken);
      if (!payload) {
        return null;
      }

      return await this.getStoredUser();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
      return null;
    }
  }

  // Activer la 2FA pour un utilisateur
  static async enableTwoFactor(userId: string, config: TwoFactorConfig): Promise<boolean> {
    try {
      // En production, ceci sera sauvegardé en base de données
      console.log('2FA activée pour l\'utilisateur:', userId);
      console.log('Secret:', config.secret);
      console.log('Codes de récupération:', config.backupCodes);
      
      // Simulation de la sauvegarde
      localStorage.setItem(`twoFactor_${userId}`, JSON.stringify({
        secret: config.secret,
        backupCodes: config.backupCodes,
        enabled: true,
        activatedAt: new Date().toISOString()
      }));

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'activation de la 2FA:', error);
      return false;
    }
  }

  // Désactiver la 2FA pour un utilisateur
  static async disableTwoFactor(userId: string): Promise<boolean> {
    try {
      // En production, ceci sera mis à jour en base de données
      localStorage.removeItem(`twoFactor_${userId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la désactivation de la 2FA:', error);
      return false;
    }
  }

  // Vérifier si la 2FA est activée pour un utilisateur
  static isTwoFactorEnabled(userId: string): boolean {
    try {
      const twoFactorData = localStorage.getItem(`twoFactor_${userId}`);
      if (!twoFactorData) return false;
      
      const data = JSON.parse(twoFactorData);
      return data.enabled === true;
    } catch {
      return false;
    }
  }

  // Vérifier un code 2FA
  static async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    try {
      const twoFactorData = localStorage.getItem(`twoFactor_${userId}`);
      if (!twoFactorData) return false;
      
      const data = JSON.parse(twoFactorData);
      return TwoFactorService.verifyTotpCode(data.secret, code);
    } catch (error) {
      console.error('Erreur lors de la vérification du code 2FA:', error);
      return false;
    }
  }

  // Vérifier un code de récupération
  static async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const twoFactorData = localStorage.getItem(`twoFactor_${userId}`);
      if (!twoFactorData) return false;
      
      const data = JSON.parse(twoFactorData);
      const backupCodes = {
        codes: data.backupCodes,
        used: data.usedBackupCodes || []
      };
      
      const result = TwoFactorService.verifyBackupCode(backupCodes, code);
      
      if (result.isValid && result.backupCodeUsed) {
        // Marquer le code comme utilisé
        data.usedBackupCodes = backupCodes.used;
        localStorage.setItem(`twoFactor_${userId}`, JSON.stringify(data));
      }
      
      return result.isValid;
    } catch (error) {
      console.error('Erreur lors de la vérification du code de récupération:', error);
      return false;
    }
  }
}
