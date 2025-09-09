import { describe, it, expect } from 'vitest';
import { XSSProtectionService } from '../xssProtectionService';

describe('XSSProtectionService - Tests Simplifiés', () => {
  describe('sanitizeHtml', () => {
    it('devrait nettoyer les balises script', () => {
      const html = '<script>alert("XSS")</script><p>Hello</p>';
      const result = XSSProtectionService.sanitizeHtml(html);
      expect(result).not.toContain('<script>');
      expect(result).toContain('<p>Hello</p>');
    });

    it('devrait préserver le HTML sûr', () => {
      const html = '<p>Hello <strong>World</strong></p>';
      const result = XSSProtectionService.sanitizeHtml(html);
      expect(result).toContain('<p>Hello <strong>World</strong></p>');
    });

    it('devrait gérer les entrées vides', () => {
      const result = XSSProtectionService.sanitizeHtml('');
      expect(result).toBe('');
    });
  });

  describe('escapeHtml', () => {
    it('devrait échapper les caractères HTML', () => {
      const text = '<script>alert("XSS")</script>';
      const result = XSSProtectionService.escapeHtml(text);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('devrait préserver le texte normal', () => {
      const text = 'Hello World';
      const result = XSSProtectionService.escapeHtml(text);
      expect(result).toBe('Hello World');
    });
  });

  describe('validateAndSanitize', () => {
    it('devrait valider une entrée sûre', () => {
      const input = 'Hello World';
      const result = XSSProtectionService.validateAndSanitize(input);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('Hello World');
    });

    it('devrait détecter les tentatives XSS dans les attributs', () => {
      const input = '<img src="x" onerror="alert(\'XSS\')">';
      const result = XSSProtectionService.validateAndSanitize(input);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('devrait valider une URL HTTPS valide', () => {
      const validUrl = 'https://example.com';
      const result = XSSProtectionService.validateUrl(validUrl);
      expect(result.isValid).toBe(true);
    });

    it('devrait rejeter une URL malveillante', () => {
      const maliciousUrl = 'javascript:alert("XSS")';
      const result = XSSProtectionService.validateUrl(maliciousUrl);
      expect(result.isValid).toBe(false);
    });
  });

  describe('detectSQLInjection', () => {
    it('devrait détecter une injection SQL basique', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const result = XSSProtectionService.detectSQLInjection(maliciousInput);
      expect(result).toBe(true);
    });

    it('devrait ne pas détecter de problème dans un texte normal', () => {
      const normalInput = "Hello World";
      const result = XSSProtectionService.detectSQLInjection(normalInput);
      expect(result).toBe(false);
    });
  });
});
