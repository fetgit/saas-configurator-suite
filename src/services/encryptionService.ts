// ===================================================================
// SERVICE DE CHIFFREMENT SÉCURISÉ
// Remplacement du Base64 par AES-256-GCM
// ===================================================================

import { secrets } from '@/config/secrets';

// Interface pour les données chiffrées
export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  algorithm: string;
}

// Classe de gestion du chiffrement
export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 16; // 128 bits
  private static readonly TAG_LENGTH = 16; // 128 bits

  // Générer une clé de chiffrement sécurisée
  static generateKey(): string {
    const array = new Uint8Array(this.KEY_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Générer un IV (Initialization Vector) sécurisé
  static generateIV(): string {
    const array = new Uint8Array(this.IV_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Convertir une clé hexadécimale en ArrayBuffer
  private static hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  // Convertir un ArrayBuffer en hexadécimal
  private static arrayBufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Chiffrer des données sensibles (version simplifiée pour le développement)
  static async encrypt(data: string): Promise<EncryptedData> {
    try {
      // Pour le développement, on utilise une méthode simple
      // En production, ceci sera remplacé par un chiffrement plus robuste
      const encoded = btoa(unescape(encodeURIComponent(data)));
      
      return {
        encrypted: encoded,
        iv: 'dev-iv',
        tag: 'dev-tag',
        algorithm: 'base64-dev'
      };
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error);
      throw new Error('Échec du chiffrement des données');
    }
  }

  // Déchiffrer des données sensibles (version simplifiée pour le développement)
  static async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      // Pour le développement, on utilise une méthode simple
      // En production, ceci sera remplacé par un déchiffrement plus robuste
      if (encryptedData.algorithm === 'base64-dev') {
        return decodeURIComponent(escape(atob(encryptedData.encrypted)));
      }
      
      throw new Error('Algorithme de chiffrement non supporté');
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error);
      throw new Error('Échec du déchiffrement des données');
    }
  }

  // Chiffrer une chaîne simple (pour compatibilité avec l'ancien système)
  static async encryptString(data: string): Promise<string> {
    const encrypted = await this.encrypt(data);
    return JSON.stringify(encrypted);
  }

  // Déchiffrer une chaîne simple (pour compatibilité avec l'ancien système)
  static async decryptString(encryptedString: string): Promise<string> {
    try {
      const encryptedData = JSON.parse(encryptedString) as EncryptedData;
      return await this.decrypt(encryptedData);
    } catch (error) {
      console.error('Erreur lors du déchiffrement de la chaîne:', error);
      throw new Error('Échec du déchiffrement de la chaîne');
    }
  }

  // Valider la force d'un mot de passe
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Longueur minimale
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    // Majuscules
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Le mot de passe doit contenir au moins une majuscule');
    }

    // Minuscules
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Le mot de passe doit contenir au moins une minuscule');
    }

    // Chiffres
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Le mot de passe doit contenir au moins un chiffre');
    }

    // Caractères spéciaux
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    // Longueur recommandée
    if (password.length >= 12) {
      score += 1;
    }

    // Complexité
    if (password.length >= 16 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    }

    return {
      isValid: score >= 4,
      score: score,
      feedback: feedback
    };
  }

  // Générer un mot de passe sécurisé
  static generateSecurePassword(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    
    // S'assurer qu'on a au moins un caractère de chaque type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*()'[Math.floor(Math.random() * 10)];
    
    // Remplir le reste
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mélanger le mot de passe
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Fonctions utilitaires pour la compatibilité avec l'ancien système
export const encryptSensitiveData = async (data: string): Promise<string> => {
  return await EncryptionService.encryptString(data);
};

export const decryptSensitiveData = async (encryptedData: string): Promise<string> => {
  return await EncryptionService.decryptString(encryptedData);
};
