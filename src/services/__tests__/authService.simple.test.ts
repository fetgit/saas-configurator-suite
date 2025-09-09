import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../authService';

describe('AuthService - Tests Simplifiés', () => {
  beforeEach(() => {
    // Nettoyer le stockage avant chaque test
    sessionStorage.clear();
  });

  afterEach(() => {
    // Nettoyer le stockage après chaque test
    sessionStorage.clear();
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur et nettoyer le stockage', async () => {
      // Simuler une session active
      sessionStorage.setItem('auth_token', 'mock-token');
      sessionStorage.setItem('refresh_token', 'mock-refresh-token');

      await AuthService.logout();

      // Vérifier que les tokens ont été supprimés
      const tokens = await AuthService.getStoredTokens();
      expect(tokens).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('devrait retourner null si non connecté', async () => {
      const user = await AuthService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner false si aucun token n\'existe', async () => {
      const result = await AuthService.isAuthenticated();
      expect(result).toBe(false);
    });
  });

  describe('getStoredUser', () => {
    it('devrait retourner null si aucun utilisateur n\'est stocké', async () => {
      const user = await AuthService.getStoredUser();
      expect(user).toBeNull();
    });
  });
});
