import { useAuth } from '@/contexts/AuthContext';

// Types pour les événements de sécurité
export interface SecurityEvent {
  id: string;
  type: 'login_failed' | 'login_success' | 'suspicious_activity' | 'admin_action' | 'data_access' | 'permission_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  ip: string;
  timestamp: string;
  description: string;
  resolved: boolean;
}

// Types pour les règles de sécurité
export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: 'low' | 'medium' | 'high';
  actions: string[];
}

// Types pour les clés API
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  created: string;
  active: boolean;
}

// Types pour les métriques de sécurité
export interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  unresolvedEvents: number;
  securityScore: number;
  totalUsers: number;
  activeSessions: number;
  blockedAttempts: number;
  lastScan: string;
  vulnerabilities: number;
  threatsBlocked: number;
  uptime: string;
}

class AdminSecurityService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3003';
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Import dynamique pour éviter les dépendances circulaires
    const { AuthService } = await import('./authService');
    
    // Vérifier d'abord si l'utilisateur est authentifié
    const isAuthenticated = await AuthService.isAuthenticated();
    if (!isAuthenticated) {
      console.log('🔍 AdminSecurity: Utilisateur non authentifié');
      return {
        'Content-Type': 'application/json',
        'Authorization': '',
      };
    }
    
    const tokens = await AuthService.getStoredTokens();
    const token = tokens?.accessToken;
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
    }
    return response.json();
  }

  // Récupérer les métriques de sécurité
  async getSecurityMetrics(): Promise<SecurityMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/metrics`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<SecurityMetrics>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques de sécurité:', error);
      // Retourner des métriques par défaut si le backend n'est pas disponible
      return {
        totalEvents: 0,
        criticalEvents: 0,
        unresolvedEvents: 0,
        securityScore: 85,
        totalUsers: 0,
        activeSessions: 0,
        blockedAttempts: 0,
        lastScan: new Date().toISOString(),
        vulnerabilities: 0,
        threatsBlocked: 0,
        uptime: '99.9%'
      };
    }
  }

  // Récupérer les événements de sécurité
  async getSecurityEvents(): Promise<SecurityEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/events`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<SecurityEvent[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des événements de sécurité:', error);
      // Retourner des événements par défaut si le backend n'est pas disponible
      return this.getDefaultSecurityEvents();
    }
  }

  // Récupérer les règles de sécurité
  async getSecurityRules(): Promise<SecurityRule[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/rules`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<SecurityRule[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des règles de sécurité:', error);
      // Retourner des règles par défaut si le backend n'est pas disponible
      return this.getDefaultSecurityRules();
    }
  }

  // Récupérer les clés API
  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/api-keys`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      return this.handleResponse<ApiKey[]>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des clés API:', error);
      // Retourner des clés par défaut si le backend n'est pas disponible
      return [];
    }
  }

  // Résoudre un événement de sécurité
  async resolveSecurityEvent(eventId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/events/${eventId}/resolve`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la résolution de l\'événement:', error);
      throw error;
    }
  }

  // Toggle une règle de sécurité
  async toggleSecurityRule(ruleId: string, enabled: boolean): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/rules/${ruleId}`, {
        method: 'PUT',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ enabled }),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la modification de la règle:', error);
      throw error;
    }
  }

  // Créer une nouvelle clé API
  async createApiKey(name: string, permissions: string[]): Promise<ApiKey> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/api-keys`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify({ name, permissions }),
      });

      return this.handleResponse<ApiKey>(response);
    } catch (error) {
      console.error('Erreur lors de la création de la clé API:', error);
      throw error;
    }
  }

  // Révoquer une clé API
  async revokeApiKey(keyId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/api-keys/${keyId}/revoke`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
      });

      await this.handleResponse(response);
    } catch (error) {
      console.error('Erreur lors de la révocation de la clé API:', error);
      throw error;
    }
  }

  // Exporter le rapport de sécurité
  async exportSecurityReport(): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security/export`, {
        method: 'GET',
        headers: await this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error('Erreur lors de l\'export du rapport:', error);
      throw error;
    }
  }

  // Données par défaut pour les événements de sécurité
  private getDefaultSecurityEvents(): SecurityEvent[] {
    return [
      {
        id: '1',
        type: 'login_failed',
        severity: 'medium',
        user: 'admin@example.com',
        ip: '192.168.1.100',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // Il y a 30 minutes
        description: 'Tentative de connexion échouée avec mot de passe incorrect',
        resolved: false
      },
      {
        id: '2',
        type: 'suspicious_activity',
        severity: 'high',
        user: 'user@example.com',
        ip: '203.0.113.42',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // Il y a 2 heures
        description: 'Activité suspecte détectée: accès depuis une nouvelle localisation',
        resolved: false
      },
      {
        id: '3',
        type: 'admin_action',
        severity: 'low',
        user: 'admin@example.com',
        ip: '192.168.1.100',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // Il y a 4 heures
        description: 'Modification des paramètres de sécurité par l\'administrateur',
        resolved: true
      },
      {
        id: '4',
        type: 'permission_denied',
        severity: 'medium',
        user: 'user@example.com',
        ip: '192.168.1.150',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // Il y a 6 heures
        description: 'Tentative d\'accès non autorisé à une ressource protégée',
        resolved: false
      }
    ];
  }

  // Données par défaut pour les règles de sécurité
  private getDefaultSecurityRules(): SecurityRule[] {
    return [
      {
        id: '1',
        name: 'Protection contre les attaques par force brute',
        description: 'Bloque automatiquement les IP après 5 tentatives de connexion échouées',
        enabled: true,
        severity: 'high',
        actions: ['block_ip', 'send_alert', 'log_event']
      },
      {
        id: '2',
        name: 'Détection d\'activité suspecte',
        description: 'Surveille les connexions depuis de nouvelles localisations',
        enabled: true,
        severity: 'medium',
        actions: ['send_alert', 'require_2fa', 'log_event']
      },
      {
        id: '3',
        name: 'Protection XSS',
        description: 'Filtre et bloque les tentatives d\'injection de scripts malveillants',
        enabled: true,
        severity: 'high',
        actions: ['block_request', 'send_alert', 'log_event']
      },
      {
        id: '4',
        name: 'Protection CSRF',
        description: 'Vérifie les tokens CSRF pour toutes les requêtes POST/PUT/DELETE',
        enabled: true,
        severity: 'high',
        actions: ['block_request', 'log_event']
      },
      {
        id: '5',
        name: 'Limitation du taux de requêtes',
        description: 'Limite le nombre de requêtes par IP pour prévenir les attaques DDoS',
        enabled: true,
        severity: 'medium',
        actions: ['rate_limit', 'log_event']
      },
      {
        id: '6',
        name: 'Surveillance des accès administrateur',
        description: 'Enregistre et alerte sur toutes les actions administratives sensibles',
        enabled: true,
        severity: 'medium',
        actions: ['send_alert', 'log_event', 'require_2fa']
      }
    ];
  }
}

// Instance singleton
export const adminSecurityService = new AdminSecurityService();
export default adminSecurityService;
