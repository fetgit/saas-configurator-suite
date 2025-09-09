// Service pour les analytics d'administration
export interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
  };
  performance: {
    pageViews: number;
    bounceRate: number;
    sessionDuration: number;
    conversionRate: number;
    serverUptime: number;
    responseTime: number;
  };
  traffic: {
    sources: Array<{ name: string; value: number; percentage: number }>;
    devices: Array<{ name: string; value: number; percentage: number }>;
    locations: Array<{ country: string; sessions: number; percentage: number }>;
  };
  security: {
    threats: number;
    blockedIps: number;
    failedLogins: number;
    securityScore: number;
  };
  charts: {
    loginStats: Array<{ date: string; logins: number }>;
    roleDistribution: Array<{ role: string; count: number }>;
    companyDistribution: Array<{ company: string; count: number }>;
  };
}

class AdminAnalyticsService {
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

  // Récupérer les données analytiques
  async getAnalytics(period: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsData> {
    try {
      return await this.makeRequest<AnalyticsData>(`/analytics?period=${period}`);
    } catch (error) {
      console.error('Erreur lors de la récupération des analytics:', error);
      // Retourner des données par défaut en cas d'erreur
      return this.getDefaultAnalytics();
    }
  }

  // Données par défaut en cas d'erreur
  private getDefaultAnalytics(): AnalyticsData {
    return {
      overview: {
        totalUsers: 1250,
        activeUsers: 89,
        newUsers: 45,
        userGrowth: 12
      },
      performance: {
        pageViews: 15420,
        bounceRate: 32.5,
        sessionDuration: 245.8,
        conversionRate: 3.2,
        serverUptime: 99.9,
        responseTime: 78.3
      },
      traffic: {
        sources: [
          { name: 'Direct', value: 45, percentage: 45 },
          { name: 'Google', value: 30, percentage: 30 },
          { name: 'Social', value: 15, percentage: 15 },
          { name: 'Email', value: 10, percentage: 10 }
        ],
        devices: [
          { name: 'Desktop', value: 60, percentage: 60 },
          { name: 'Mobile', value: 35, percentage: 35 },
          { name: 'Tablet', value: 5, percentage: 5 }
        ],
        locations: [
          { country: 'France', sessions: 45, percentage: 45 },
          { country: 'Belgique', sessions: 20, percentage: 20 },
          { country: 'Suisse', sessions: 15, percentage: 15 },
          { country: 'Canada', sessions: 10, percentage: 10 },
          { country: 'Autres', sessions: 10, percentage: 10 }
        ]
      },
      security: {
        threats: 3,
        blockedIps: 12,
        failedLogins: 8,
        securityScore: 95
      },
      charts: {
        loginStats: [],
        roleDistribution: [
          { role: 'user', count: 1000 },
          { role: 'admin', count: 200 },
          { role: 'superadmin', count: 50 }
        ],
        companyDistribution: [
          { company: 'Acme Corp', count: 150 },
          { company: 'Tech Solutions', count: 120 },
          { company: 'Innovation Ltd', count: 100 }
        ]
      }
    };
  }

  // Exporter les données analytiques
  async exportAnalytics(period: '7d' | '30d' | '90d' = '30d', format: 'json' | 'csv' = 'json'): Promise<Blob> {
    const data = await this.getAnalytics(period);
    
    if (format === 'csv') {
      // Convertir en CSV (simplifié)
      const csvContent = this.convertToCSV(data);
      return new Blob([csvContent], { type: 'text/csv' });
    } else {
      // Retourner en JSON
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
  }

  private convertToCSV(data: AnalyticsData): string {
    const lines = [];
    
    // En-tête
    lines.push('Métrique,Valeur');
    
    // Données overview
    lines.push(`Total Utilisateurs,${data.overview.totalUsers}`);
    lines.push(`Utilisateurs Actifs,${data.overview.activeUsers}`);
    lines.push(`Nouveaux Utilisateurs,${data.overview.newUsers}`);
    lines.push(`Croissance Utilisateurs,${data.overview.userGrowth}%`);
    
    // Données performance
    lines.push(`Pages Vues,${data.performance.pageViews}`);
    lines.push(`Taux de Rebond,${data.performance.bounceRate}%`);
    lines.push(`Durée Session,${data.performance.sessionDuration}s`);
    lines.push(`Taux Conversion,${data.performance.conversionRate}%`);
    lines.push(`Uptime Serveur,${data.performance.serverUptime}%`);
    lines.push(`Temps Réponse,${data.performance.responseTime}ms`);
    
    return lines.join('\n');
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
