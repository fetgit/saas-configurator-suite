// Service pour la gestion du système en administration
export interface SystemMetrics {
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkTraffic: number;
  activeUsers: number;
  totalRequests: number;
  errorRate: number;
}

export interface SystemService {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  lastCheck: string;
  uptime: string;
  responseTime: string;
}

class AdminSystemService {
  private baseUrl = 'http://localhost:3001/api/admin';

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Import dynamique pour éviter les dépendances circulaires
    const { AuthService } = await import('./authService');
    const tokens = await AuthService.getStoredTokens();
    const token = tokens?.accessToken;
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return response.json();
  }

  // Récupérer les métriques système
  async getMetrics(): Promise<SystemMetrics> {
    try {
      return await this.makeRequest<SystemMetrics>('/system/metrics');
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques système:', error);
      // Retourner des données par défaut en cas d'erreur
      return this.getDefaultMetrics();
    }
  }

  // Récupérer les services
  async getServices(): Promise<SystemService[]> {
    try {
      return await this.makeRequest<SystemService[]>('/system/services');
    } catch (error) {
      console.error('Erreur lors de la récupération des services:', error);
      // Retourner des données par défaut en cas d'erreur
      return this.getDefaultServices();
    }
  }

  // Redémarrer un service
  async restartService(serviceId: string): Promise<{ message: string; serviceId: string; timestamp: string }> {
    return this.makeRequest<{ message: string; serviceId: string; timestamp: string }>(`/system/services/${serviceId}/restart`, {
      method: 'POST',
    });
  }

  // Données par défaut pour les métriques
  private getDefaultMetrics(): SystemMetrics {
    return {
      uptime: 86400, // 24 heures en secondes
      cpuUsage: 25.5,
      memoryUsage: 45.2,
      diskUsage: 60.8,
      networkTraffic: 125.3,
      activeUsers: 42,
      totalRequests: 15420,
      errorRate: 0.8
    };
  }

  // Données par défaut pour les services
  private getDefaultServices(): SystemService[] {
    return [
      {
        id: 'web-server',
        name: 'Serveur Web',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        uptime: '99.9%',
        responseTime: '45ms'
      },
      {
        id: 'database',
        name: 'Base de données',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        uptime: '99.8%',
        responseTime: '12ms'
      },
      {
        id: 'redis',
        name: 'Cache Redis',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        uptime: '99.9%',
        responseTime: '2ms'
      },
      {
        id: 'email-service',
        name: 'Service Email',
        status: 'warning',
        lastCheck: new Date().toISOString(),
        uptime: '98.5%',
        responseTime: '120ms'
      }
    ];
  }

  // Formater le temps d'uptime
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}j ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Obtenir la couleur du statut
  getStatusColor(status: string): string {
    switch (status) {
      case 'healthy':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  // Obtenir l'icône du statut
  getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return '?';
    }
  }
}

export const adminSystemService = new AdminSystemService();
