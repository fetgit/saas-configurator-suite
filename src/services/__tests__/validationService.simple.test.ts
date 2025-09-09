import { describe, it, expect } from 'vitest';
import { ValidationService } from '../validationService';

describe('ValidationService - Tests Simplifiés', () => {
  describe('validateEmail', () => {
    it('devrait valider un email correct', () => {
      const result = ValidationService.validateEmail('test@example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait rejeter un email invalide', () => {
      const result = ValidationService.validateEmail('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('devrait rejeter un email vide', () => {
      const result = ValidationService.validateEmail('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Ce champ est obligatoire');
    });
  });

  describe('validatePassword', () => {
    it('devrait valider un mot de passe fort', () => {
      const result = ValidationService.validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait rejeter un mot de passe trop court', () => {
      const result = ValidationService.validatePassword('123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum 8 caractères requis');
    });
  });

  describe('validateUrl', () => {
    it('devrait valider une URL correcte', () => {
      const result = ValidationService.validateUrl('https://example.com');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait rejeter une URL invalide', () => {
      const result = ValidationService.validateUrl('not-a-url');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Format d\'URL invalide');
    });
  });

  describe('validatePhone', () => {
    it('devrait valider un numéro de téléphone international', () => {
      const result = ValidationService.validatePhone('+33123456789');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('devrait rejeter un numéro de téléphone invalide', () => {
      const result = ValidationService.validatePhone('123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Minimum 10 caractères requis');
    });
  });
});
