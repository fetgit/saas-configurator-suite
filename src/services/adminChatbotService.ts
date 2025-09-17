// Service pour la gestion du chatbot en administration
export interface ChatbotStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  satisfactionRate: number;
  topIntents: Array<{
    intent: string;
    count: number;
    percentage: number;
  }>;
  recentConversations: Array<{
    id: number;
    user: string;
    message: string;
    timestamp: string;
    status: 'resolved' | 'pending' | 'escalated';
  }>;
}

export interface ChatbotConfig {
  enabled: boolean;
  welcomeMessage: string;
  fallbackMessage: string;
  maxRetries: number;
  responseTimeout: number;
  autoEscalation: boolean;
  escalationThreshold: number;
  languages: string[];
  intents: Array<{
    name: string;
    patterns: string[];
    responses: string[];
    confidence: number;
  }>;
}

class AdminChatbotService {
  private baseUrl = 'http://localhost:3003/api/admin';

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

  // Récupérer les statistiques du chatbot
  async getStats(): Promise<ChatbotStats> {
    try {
      return await this.makeRequest<ChatbotStats>('/chatbot/stats');
    } catch (error) {
      console.error('Erreur lors de la récupération des stats chatbot:', error);
      // Retourner des données par défaut en cas d'erreur
      return this.getDefaultStats();
    }
  }

  // Récupérer la configuration du chatbot
  async getConfig(): Promise<ChatbotConfig> {
    try {
      // Pour l'instant, retourner une configuration par défaut
      // Dans une vraie implémentation, cela viendrait de l'API
      return this.getDefaultConfig();
    } catch (error) {
      console.error('Erreur lors de la récupération de la config chatbot:', error);
      return this.getDefaultConfig();
    }
  }

  // Mettre à jour la configuration du chatbot
  async updateConfig(config: Partial<ChatbotConfig>): Promise<{ message: string; config: ChatbotConfig; timestamp: string }> {
    return this.makeRequest<{ message: string; config: ChatbotConfig; timestamp: string }>('/chatbot/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // Données par défaut pour les statistiques
  private getDefaultStats(): ChatbotStats {
    return {
      totalConversations: 1250,
      activeConversations: 35,
      totalMessages: 4850,
      averageResponseTime: 1.8,
      satisfactionRate: 87.5,
      topIntents: [
        { intent: 'greeting', count: 150, percentage: 25 },
        { intent: 'support', count: 120, percentage: 20 },
        { intent: 'billing', count: 90, percentage: 15 },
        { intent: 'technical', count: 80, percentage: 13 },
        { intent: 'other', count: 160, percentage: 27 }
      ],
      recentConversations: [
        {
          id: 1,
          user: 'user@example.com',
          message: 'Bonjour, j\'ai un problème avec mon compte',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'resolved'
        },
        {
          id: 2,
          user: 'client@company.com',
          message: 'Comment puis-je changer mon plan ?',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          status: 'pending'
        },
        {
          id: 3,
          user: 'support@business.com',
          message: 'Problème technique urgent',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          status: 'escalated'
        }
      ]
    };
  }

  // Configuration par défaut
  private getDefaultConfig(): ChatbotConfig {
    return {
      enabled: true,
      welcomeMessage: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
      fallbackMessage: 'Je ne comprends pas votre demande. Pouvez-vous reformuler ?',
      maxRetries: 3,
      responseTimeout: 30,
      autoEscalation: true,
      escalationThreshold: 0.3,
      languages: ['fr', 'en'],
      intents: [
        {
          name: 'greeting',
          patterns: ['bonjour', 'salut', 'hello', 'hi'],
          responses: ['Bonjour ! Comment puis-je vous aider ?', 'Salut ! Que puis-je faire pour vous ?'],
          confidence: 0.9
        },
        {
          name: 'support',
          patterns: ['aide', 'problème', 'bug', 'erreur', 'help'],
          responses: ['Je vais vous aider à résoudre ce problème.', 'Pouvez-vous me donner plus de détails ?'],
          confidence: 0.8
        },
        {
          name: 'billing',
          patterns: ['facture', 'paiement', 'abonnement', 'tarif', 'prix'],
          responses: ['Je peux vous aider avec vos questions de facturation.', 'Quel est votre problème de paiement ?'],
          confidence: 0.85
        }
      ]
    };
  }

  // Obtenir la couleur du statut
  getStatusColor(status: string): string {
    switch (status) {
      case 'resolved':
        return 'text-green-500';
      case 'pending':
        return 'text-yellow-500';
      case 'escalated':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  // Obtenir l'icône du statut
  getStatusIcon(status: string): string {
    switch (status) {
      case 'resolved':
        return '✓';
      case 'pending':
        return '⏳';
      case 'escalated':
        return '⚠';
      default:
        return '?';
    }
  }

  // Formater le temps de réponse
  formatResponseTime(seconds: number): string {
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    } else {
      return `${seconds.toFixed(1)}s`;
    }
  }

  // Calculer le taux de satisfaction
  calculateSatisfactionRate(satisfied: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((satisfied / total) * 100 * 10) / 10;
  }
}

export const adminChatbotService = new AdminChatbotService();
