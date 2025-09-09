// Service pour la gestion des performances en administration
export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
  totalRequests: number;
  networkTraffic: number;
  errorRate: number;
  uptime: number;
  lastUpdated: string;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

class AdminPerformanceService {
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

  // Récupérer les métriques de performance
  async getMetrics(): Promise<PerformanceMetrics> {
    try {
      return await this.makeRequest<PerformanceMetrics>('/performance/metrics');
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques de performance:', error);
      // Retourner des données par défaut en cas d'erreur
      return this.getDefaultMetrics();
    }
  }

  // Récupérer l'historique des performances
  async getPerformanceHistory(period: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<Array<{
    timestamp: string;
    pageLoadTime: number;
    apiResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    requestsPerSecond: number;
    errorRate: number;
  }>> {
    try {
      // Pour l'instant, générer des données simulées
      return this.generatePerformanceHistory(period);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  // Récupérer les alertes de performance
  async getAlerts(): Promise<PerformanceAlert[]> {
    try {
      // Pour l'instant, retourner des alertes simulées
      return this.getDefaultAlerts();
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  }

  // Marquer une alerte comme résolue
  async resolveAlert(alertId: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/performance/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  }

  // Données par défaut pour les métriques
  private getDefaultMetrics(): PerformanceMetrics {
    return {
      pageLoadTime: 245.8,
      apiResponseTime: 78.3,
      databaseQueryTime: 12.5,
      memoryUsage: 45.2,
      cpuUsage: 25.5,
      diskUsage: 60.8,
      activeConnections: 42,
      requestsPerSecond: 15.8,
      totalRequests: 15420,
      networkTraffic: 125.3,
      errorRate: 0.8,
      uptime: 99.9,
      lastUpdated: new Date().toISOString()
    };
  }

  // Générer l'historique des performances
  private generatePerformanceHistory(period: string): Array<{
    timestamp: string;
    pageLoadTime: number;
    apiResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    requestsPerSecond: number;
    errorRate: number;
  }> {
    const now = new Date();
    const dataPoints = this.getDataPointsForPeriod(period);
    const interval = this.getIntervalForPeriod(period);
    
    const history = [];
    
    for (let i = dataPoints; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * interval);
      
      history.push({
        timestamp: timestamp.toISOString(),
        pageLoadTime: Math.round((Math.random() * 200 + 150) * 10) / 10,
        apiResponseTime: Math.round((Math.random() * 50 + 30) * 10) / 10,
        memoryUsage: Math.round((Math.random() * 20 + 35) * 10) / 10,
        cpuUsage: Math.round((Math.random() * 15 + 20) * 10) / 10,
        requestsPerSecond: Math.round((Math.random() * 10 + 10) * 10) / 10,
        errorRate: Math.round((Math.random() * 2 + 0.5) * 10) / 10
      });
    }
    
    return history;
  }

  // Obtenir le nombre de points de données selon la période
  private getDataPointsForPeriod(period: string): number {
    switch (period) {
      case '1h':
        return 12; // 5 minutes par point
      case '24h':
        return 24; // 1 heure par point
      case '7d':
        return 28; // 6 heures par point
      case '30d':
        return 30; // 1 jour par point
      default:
        return 24;
    }
  }

  // Obtenir l'intervalle en millisecondes selon la période
  private getIntervalForPeriod(period: string): number {
    switch (period) {
      case '1h':
        return 5 * 60 * 1000; // 5 minutes
      case '24h':
        return 60 * 60 * 1000; // 1 heure
      case '7d':
        return 6 * 60 * 60 * 1000; // 6 heures
      case '30d':
        return 24 * 60 * 60 * 1000; // 1 jour
      default:
        return 60 * 60 * 1000;
    }
  }

  // Alertes par défaut
  private getDefaultAlerts(): PerformanceAlert[] {
    return [
      {
        id: '1',
        type: 'warning',
        message: 'Temps de réponse API élevé détecté (>100ms)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        resolved: false
      },
      {
        id: '2',
        type: 'info',
        message: 'Utilisation mémoire normale',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        resolved: true
      },
      {
        id: '3',
        type: 'error',
        message: 'Taux d\'erreur élevé détecté (>2%)',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        resolved: false
      }
    ];
  }

  // Obtenir la couleur du statut
  getStatusColor(value: number, thresholds: { warning: number; error: number }): string {
    if (value >= thresholds.error) {
      return 'text-red-500';
    } else if (value >= thresholds.warning) {
      return 'text-yellow-500';
    } else {
      return 'text-green-500';
    }
  }

  // Obtenir la couleur de l'alerte
  getAlertColor(type: string): string {
    switch (type) {
      case 'error':
        return 'text-red-500 bg-red-50 dark:bg-red-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
      case 'info':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-500/10';
    }
  }

  // Formater le temps
  formatTime(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    } else {
      return `${(ms / 1000).toFixed(1)}s`;
    }
  }

  // Formater le pourcentage
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  // Formater l'uptime
  formatUptime(uptime: number): string {
    return `${uptime.toFixed(1)}%`;
  }

  // Formater les requêtes par seconde
  formatRequestsPerSecond(rps: number): string {
    return `${rps.toFixed(1)} req/s`;
  }

  // Vérifier si une métrique est dans les seuils acceptables
  isMetricHealthy(value: number, thresholds: { warning: number; error: number }): boolean {
    return value < thresholds.warning;
  }

  // Obtenir le statut global des performances
  getOverallStatus(metrics: PerformanceMetrics): 'healthy' | 'warning' | 'error' {
    const thresholds = {
      pageLoadTime: { warning: 500, error: 1000 },
      apiResponseTime: { warning: 100, error: 200 },
      memoryUsage: { warning: 70, error: 85 },
      cpuUsage: { warning: 70, error: 85 },
      errorRate: { warning: 2, error: 5 }
    };

    let hasError = false;
    let hasWarning = false;

    if (metrics.pageLoadTime >= thresholds.pageLoadTime.error ||
        metrics.apiResponseTime >= thresholds.apiResponseTime.error ||
        metrics.memoryUsage >= thresholds.memoryUsage.error ||
        metrics.cpuUsage >= thresholds.cpuUsage.error ||
        metrics.errorRate >= thresholds.errorRate.error) {
      hasError = true;
    } else if (metrics.pageLoadTime >= thresholds.pageLoadTime.warning ||
               metrics.apiResponseTime >= thresholds.apiResponseTime.warning ||
               metrics.memoryUsage >= thresholds.memoryUsage.warning ||
               metrics.cpuUsage >= thresholds.cpuUsage.warning ||
               metrics.errorRate >= thresholds.errorRate.warning) {
      hasWarning = true;
    }

    if (hasError) return 'error';
    if (hasWarning) return 'warning';
    return 'healthy';
  }
}

export const adminPerformanceService = new AdminPerformanceService();
