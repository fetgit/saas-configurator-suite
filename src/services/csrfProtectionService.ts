// ===================================================================
// SERVICE DE PROTECTION CSRF (Cross-Site Request Forgery)
// Génération et validation de tokens CSRF
// ===================================================================

import Cookies from 'js-cookie';
import { secrets } from '@/config/secrets';

// Interface pour les tokens CSRF
export interface CSRFToken {
  token: string;
  expiresAt: number;
  createdAt: number;
}

// Interface pour les options de token
export interface CSRFTokenOptions {
  expiresIn?: number; // en millisecondes
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

// Classe de protection CSRF
export class CSRFProtectionService {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly DEFAULT_EXPIRES_IN = 24 * 60 * 60 * 1000; // 24 heures
  private static readonly COOKIE_NAME = 'csrf-token';
  private static readonly HEADER_NAME = 'X-CSRF-Token';

  // Générer un token CSRF sécurisé
  static generateToken(): string {
    try {
      // Utiliser crypto.getRandomValues pour la génération sécurisée
      const array = new Uint8Array(this.TOKEN_LENGTH);
      crypto.getRandomValues(array);
      
      // Convertir en hexadécimal
      const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      
      return token;
    } catch (error) {
      console.error('Erreur lors de la génération du token CSRF:', error);
      // Fallback avec Math.random (moins sécurisé)
      return Array.from({ length: this.TOKEN_LENGTH }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
    }
  }

  // Créer un token CSRF avec expiration
  static createToken(options: CSRFTokenOptions = {}): CSRFToken {
    const now = Date.now();
    const expiresIn = options.expiresIn || this.DEFAULT_EXPIRES_IN;
    
    return {
      token: this.generateToken(),
      expiresAt: now + expiresIn,
      createdAt: now
    };
  }

  // Stocker le token CSRF dans un cookie
  static storeToken(token: CSRFToken, options: CSRFTokenOptions = {}): void {
    try {
      const cookieOptions = {
        expires: new Date(token.expiresAt),
        secure: options.secure ?? (location.protocol === 'https:'),
        sameSite: options.sameSite || 'strict',
        httpOnly: options.httpOnly || false
      };

      Cookies.set(this.COOKIE_NAME, token.token, cookieOptions);
    } catch (error) {
      console.error('Erreur lors du stockage du token CSRF:', error);
    }
  }

  // Récupérer le token CSRF depuis le cookie
  static getStoredToken(): string | null {
    try {
      return Cookies.get(this.COOKIE_NAME) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du token CSRF:', error);
      return null;
    }
  }

  // Valider un token CSRF
  static validateToken(providedToken: string): boolean {
    try {
      const storedToken = this.getStoredToken();
      
      if (!storedToken || !providedToken) {
        return false;
      }

      // Comparaison sécurisée des tokens
      return this.secureCompare(storedToken, providedToken);
    } catch (error) {
      console.error('Erreur lors de la validation du token CSRF:', error);
      return false;
    }
  }

  // Comparaison sécurisée des chaînes (timing attack resistant)
  private static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  // Supprimer le token CSRF
  static removeToken(): void {
    try {
      Cookies.remove(this.COOKIE_NAME);
    } catch (error) {
      console.error('Erreur lors de la suppression du token CSRF:', error);
    }
  }

  // Initialiser la protection CSRF pour une session
  static initializeProtection(options: CSRFTokenOptions = {}): string {
    try {
      const token = this.createToken(options);
      this.storeToken(token, options);
      return token.token;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la protection CSRF:', error);
      return '';
    }
  }

  // Obtenir le token CSRF pour les requêtes
  static getTokenForRequest(): string | null {
    return this.getStoredToken();
  }

  // Obtenir le nom du header CSRF
  static getHeaderName(): string {
    return this.HEADER_NAME;
  }

  // Vérifier si la protection CSRF est active
  static isProtectionActive(): boolean {
    return this.getStoredToken() !== null;
  }

  // Renouveler le token CSRF
  static refreshToken(options: CSRFTokenOptions = {}): string {
    try {
      this.removeToken();
      return this.initializeProtection(options);
    } catch (error) {
      console.error('Erreur lors du renouvellement du token CSRF:', error);
      return '';
    }
  }

  // Valider une requête avec token CSRF
  static validateRequest(requestToken: string | null): boolean {
    if (!requestToken) {
      return false;
    }

    return this.validateToken(requestToken);
  }

  // Générer un token pour les formulaires
  static generateFormToken(): string {
    const token = this.getStoredToken();
    if (!token) {
      return this.initializeProtection();
    }
    return token;
  }

  // Vérifier l'origine de la requête (protection supplémentaire)
  static validateOrigin(origin: string): boolean {
    try {
      const allowedOrigins = [
        window.location.origin,
        'http://localhost:8080',
        'http://localhost:8081',
        'https://localhost:8080',
        'https://localhost:8081'
      ];

      return allowedOrigins.includes(origin);
    } catch (error) {
      console.error('Erreur lors de la validation de l\'origine:', error);
      return false;
    }
  }

  // Vérifier le referer (protection supplémentaire)
  static validateReferer(referer: string): boolean {
    try {
      if (!referer) {
        return false;
      }

      const currentOrigin = window.location.origin;
      return referer.startsWith(currentOrigin);
    } catch (error) {
      console.error('Erreur lors de la validation du referer:', error);
      return false;
    }
  }

  // Protection complète pour une requête
  static validateRequestComplete(
    requestToken: string | null,
    origin?: string,
    referer?: string
  ): boolean {
    // Vérifier le token CSRF
    if (!this.validateRequest(requestToken)) {
      return false;
    }

    // Vérifier l'origine si fournie
    if (origin && !this.validateOrigin(origin)) {
      return false;
    }

    // Vérifier le referer si fourni
    if (referer && !this.validateReferer(referer)) {
      return false;
    }

    return true;
  }

  // Nettoyer les tokens expirés
  static cleanupExpiredTokens(): void {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return;
      }

      // En production, ceci serait géré côté serveur
      // Pour le moment, on supprime simplement le token
      this.removeToken();
    } catch (error) {
      console.error('Erreur lors du nettoyage des tokens expirés:', error);
    }
  }

  // Obtenir les statistiques de sécurité
  static getSecurityStats(): {
    isActive: boolean;
    hasToken: boolean;
    tokenLength: number;
    protectionLevel: 'basic' | 'enhanced' | 'maximum';
  } {
    const token = this.getStoredToken();
    const isActive = this.isProtectionActive();
    
    let protectionLevel: 'basic' | 'enhanced' | 'maximum' = 'basic';
    if (isActive) {
      protectionLevel = 'enhanced';
      if (location.protocol === 'https:') {
        protectionLevel = 'maximum';
      }
    }

    return {
      isActive,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      protectionLevel
    };
  }
}

// Fonction utilitaire pour l'export
export const csrfProtection = CSRFProtectionService;
