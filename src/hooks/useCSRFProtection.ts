import { useState, useEffect, useCallback } from 'react';
import { CSRFProtectionService, CSRFTokenOptions } from '@/services/csrfProtectionService';

// Interface pour les options du hook
export interface UseCSRFProtectionOptions extends CSRFTokenOptions {
  autoInitialize?: boolean;
  refreshInterval?: number; // en millisecondes
}

// Interface pour le retour du hook
export interface UseCSRFProtectionReturn {
  token: string | null;
  isActive: boolean;
  initialize: () => string;
  refresh: () => string;
  validate: (requestToken: string | null) => boolean;
  remove: () => void;
  getHeaderName: () => string;
  getTokenForRequest: () => string | null;
  securityStats: {
    isActive: boolean;
    hasToken: boolean;
    tokenLength: number;
    protectionLevel: 'basic' | 'enhanced' | 'maximum';
  };
}

// Hook pour la protection CSRF
export const useCSRFProtection = (
  options: UseCSRFProtectionOptions = {}
): UseCSRFProtectionReturn => {
  const {
    autoInitialize = true,
    refreshInterval,
    ...csrfOptions
  } = options;

  const [token, setToken] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // Initialiser la protection CSRF
  const initialize = useCallback((): string => {
    try {
      const newToken = CSRFProtectionService.initializeProtection(csrfOptions);
      setToken(newToken);
      setIsActive(true);
      return newToken;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation CSRF:', error);
      setToken(null);
      setIsActive(false);
      return '';
    }
  }, [csrfOptions]);

  // Rafraîchir le token
  const refresh = useCallback((): string => {
    try {
      const newToken = CSRFProtectionService.refreshToken(csrfOptions);
      setToken(newToken);
      setIsActive(true);
      return newToken;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement CSRF:', error);
      setToken(null);
      setIsActive(false);
      return '';
    }
  }, [csrfOptions]);

  // Valider un token
  const validate = useCallback((requestToken: string | null): boolean => {
    return CSRFProtectionService.validateRequest(requestToken);
  }, []);

  // Supprimer le token
  const remove = useCallback((): void => {
    CSRFProtectionService.removeToken();
    setToken(null);
    setIsActive(false);
  }, []);

  // Obtenir le nom du header
  const getHeaderName = useCallback((): string => {
    return CSRFProtectionService.getHeaderName();
  }, []);

  // Obtenir le token pour les requêtes
  const getTokenForRequest = useCallback((): string | null => {
    return CSRFProtectionService.getTokenForRequest();
  }, []);

  // Obtenir les statistiques de sécurité
  const securityStats = CSRFProtectionService.getSecurityStats();

  // Initialisation automatique
  useEffect(() => {
    if (autoInitialize) {
      const existingToken = CSRFProtectionService.getStoredToken();
      if (existingToken) {
        setToken(existingToken);
        setIsActive(true);
      } else {
        initialize();
      }
    }
  }, [autoInitialize, initialize]);

  // Rafraîchissement automatique
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        refresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, refresh]);

  // Nettoyage à la déconnexion
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Ne pas supprimer le token à la fermeture de la page
      // pour maintenir la session
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    token,
    isActive,
    initialize,
    refresh,
    validate,
    remove,
    getHeaderName,
    getTokenForRequest,
    securityStats
  };
};
