// ===================================================================
// SERVICE D'AUTHENTIFICATION À DEUX FACTEURS (2FA)
// Implémentation TOTP (Time-based One-Time Password)
// ===================================================================

import { authenticator, totp } from 'otplib';
import QRCode from 'qrcode';
import { secrets } from '@/config/secrets';

// Interface pour la configuration 2FA
export interface TwoFactorConfig {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// Interface pour la vérification 2FA
export interface TwoFactorVerification {
  isValid: boolean;
  backupCodeUsed?: boolean;
}

// Interface pour les codes de récupération
export interface BackupCodes {
  codes: string[];
  used: string[];
}

// Classe de gestion de la 2FA
export class TwoFactorService {
  private static readonly ISSUER = 'SaaS Configurator Suite';
  private static readonly ALGORITHM = 'sha1';
  private static readonly DIGITS = 6;
  private static readonly PERIOD = 30;
  private static readonly WINDOW = 2; // Tolérance de ±2 périodes

  // Générer une nouvelle configuration 2FA pour un utilisateur
  static async generateTwoFactorConfig(userEmail: string, userName: string): Promise<TwoFactorConfig> {
    try {
      // Générer un secret unique
      const secret = authenticator.generateSecret();

      // Créer l'URL OTPAuth pour le QR code
      const otpAuthUrl = authenticator.keyuri(userEmail, this.ISSUER, secret);

      // Générer le QR code
      const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

      // Générer les codes de récupération
      const backupCodes = this.generateBackupCodes();

      return {
        secret,
        qrCodeUrl,
        backupCodes
      };
    } catch (error) {
      console.error('Erreur lors de la génération de la configuration 2FA:', error);
      throw new Error('Échec de la génération de la configuration 2FA');
    }
  }

  // Vérifier un code TOTP
  static verifyTotpCode(secret: string, token: string): boolean {
    try {
      const verified = authenticator.verify({
        token,
        secret,
        window: this.WINDOW
      });

      return verified;
    } catch (error) {
      console.error('Erreur lors de la vérification du code TOTP:', error);
      return false;
    }
  }

  // Vérifier un code de récupération
  static verifyBackupCode(backupCodes: BackupCodes, code: string): TwoFactorVerification {
    try {
      // Vérifier si le code est valide et non utilisé
      const isValidCode = backupCodes.codes.includes(code);
      const isNotUsed = !backupCodes.used.includes(code);

      if (isValidCode && isNotUsed) {
        // Marquer le code comme utilisé
        backupCodes.used.push(code);
        return {
          isValid: true,
          backupCodeUsed: true
        };
      }

      return {
        isValid: false
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du code de récupération:', error);
      return {
        isValid: false
      };
    }
  }

  // Générer des codes de récupération
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    const codeLength = 8;
    const numberOfCodes = 10;

    for (let i = 0; i < numberOfCodes; i++) {
      let code = '';
      for (let j = 0; j < codeLength; j++) {
        // Générer un caractère alphanumérique
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(code);
    }

    return codes;
  }

  // Générer un nouveau code TOTP (pour affichage)
  static generateCurrentTotp(secret: string): string {
    try {
      return authenticator.generate(secret);
    } catch (error) {
      console.error('Erreur lors de la génération du code TOTP:', error);
      return '';
    }
  }

  // Vérifier si la 2FA est activée pour un utilisateur
  static isTwoFactorEnabled(userTwoFactorSecret: string | null): boolean {
    return userTwoFactorSecret !== null && userTwoFactorSecret.length > 0;
  }

  // Désactiver la 2FA (supprimer le secret)
  static disableTwoFactor(): string | null {
    return null;
  }

  // Valider la force d'un secret
  static validateSecretStrength(secret: string): boolean {
    // Un secret base32 valide doit avoir au moins 16 caractères
    return secret.length >= 16 && /^[A-Z2-7]+$/.test(secret);
  }

  // Obtenir les informations de temps restant pour le code actuel
  static getTimeRemaining(): number {
    const now = Math.floor(Date.now() / 1000);
    return this.PERIOD - (now % this.PERIOD);
  }

  // Formater les codes de récupération pour l'affichage
  static formatBackupCodes(codes: string[]): string[] {
    return codes.map((code, index) => {
      // Formater en groupes de 4 caractères
      const formatted = code.match(/.{1,4}/g)?.join('-') || code;
      return `${index + 1}. ${formatted}`;
    });
  }
}

// Fonction utilitaire pour l'export
export const twoFactorService = TwoFactorService;
