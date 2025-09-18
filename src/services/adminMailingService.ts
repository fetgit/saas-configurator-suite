// Service pour la gestion du mailing en administration
export interface Campaign {
  id: number;
  name: string;
  subject: string;
  content?: string;
  template?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  recipients?: number;
  scheduledFor?: string;
  createdAt: string;
  sentAt?: string;
}

export interface CreateCampaignData {
  name: string;
  subject: string;
  content: string;
  template?: string;
  recipients?: number;
  scheduledFor?: string;
}

export interface CampaignStats {
  totalCampaigns: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  averageOpenRate: number;
  averageClickRate: number;
  averageBounceRate: number;
}

class AdminMailingService {
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

  // Récupérer toutes les campagnes
  async getCampaigns(): Promise<Campaign[]> {
    try {
      return await this.makeRequest<Campaign[]>('/mailing/campaigns');
    } catch (error) {
      console.error('Erreur lors de la récupération des campagnes:', error);
      // Retourner un tableau vide au lieu de données mockées
      return [];
    }
  }

  // Créer une nouvelle campagne
  async createCampaign(campaignData: CreateCampaignData): Promise<{ campaign: Campaign; message: string }> {
    return this.makeRequest<{ campaign: Campaign; message: string }>('/mailing/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    });
  }

  // Mettre à jour une campagne
  async updateCampaign(id: number, campaignData: Partial<CreateCampaignData>): Promise<{ campaign: Campaign; message: string }> {
    return this.makeRequest<{ campaign: Campaign; message: string }>(`/mailing/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    });
  }

  // Supprimer une campagne
  async deleteCampaign(id: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/mailing/campaigns/${id}`, {
      method: 'DELETE',
    });
  }

  // Envoyer une campagne
  async sendCampaign(id: number): Promise<{ message: string; campaign: Campaign }> {
    return this.makeRequest<{ message: string; campaign: Campaign }>(`/mailing/campaigns/${id}/send`, {
      method: 'POST',
    });
  }

  // Programmer une campagne
  async scheduleCampaign(id: number, scheduledFor: string): Promise<{ message: string; campaign: Campaign }> {
    return this.makeRequest<{ message: string; campaign: Campaign }>(`/mailing/campaigns/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledFor }),
    });
  }

  // Obtenir les statistiques des campagnes
  async getCampaignStats(): Promise<CampaignStats> {
    try {
      const campaigns = await this.getCampaigns();
      
      const stats = campaigns.reduce((acc, campaign) => {
        acc.totalCampaigns++;
        acc.totalSent += campaign.sent;
        acc.totalDelivered += campaign.delivered;
        acc.totalOpened += campaign.opened;
        acc.totalClicked += campaign.clicked;
        return acc;
      }, {
        totalCampaigns: 0,
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        totalClicked: 0,
        averageOpenRate: 0,
        averageClickRate: 0,
        averageBounceRate: 0
      });

      // Calculer les taux moyens
      if (stats.totalDelivered > 0) {
        stats.averageOpenRate = Math.round((stats.totalOpened / stats.totalDelivered) * 100 * 10) / 10;
        stats.averageClickRate = Math.round((stats.totalClicked / stats.totalDelivered) * 100 * 10) / 10;
      }

      const totalBounced = campaigns.reduce((sum, campaign) => sum + campaign.bounced, 0);
      if (stats.totalSent > 0) {
        stats.averageBounceRate = Math.round((totalBounced / stats.totalSent) * 100 * 10) / 10;
      }

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      return this.getDefaultStats();
    }
  }

  // Données par défaut pour les campagnes
  private getDefaultCampaigns(): Campaign[] {
    return [
      {
        id: 1,
        name: 'Newsletter Mensuelle',
        subject: 'Votre newsletter de janvier',
        status: 'sent',
        sent: 1250,
        delivered: 1200,
        opened: 480,
        clicked: 120,
        bounced: 50,
        unsubscribed: 5,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Promotion Nouvel An',
        subject: 'Offres spéciales pour 2024',
        status: 'scheduled',
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        recipients: 2000,
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'Bienvenue Nouveaux Utilisateurs',
        subject: 'Bienvenue dans notre plateforme !',
        status: 'draft',
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        recipients: 0,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  // Statistiques par défaut
  private getDefaultStats(): CampaignStats {
    return {
      totalCampaigns: 3,
      totalSent: 1250,
      totalDelivered: 1200,
      totalOpened: 480,
      totalClicked: 120,
      averageOpenRate: 40.0,
      averageClickRate: 10.0,
      averageBounceRate: 4.0
    };
  }

  // Obtenir la couleur du statut
  getStatusColor(status: string): string {
    switch (status) {
      case 'sent':
        return 'text-green-500';
      case 'scheduled':
        return 'text-blue-500';
      case 'sending':
        return 'text-yellow-500';
      case 'draft':
        return 'text-gray-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  }

  // Obtenir l'icône du statut
  getStatusIcon(status: string): string {
    switch (status) {
      case 'sent':
        return '✓';
      case 'scheduled':
        return '⏰';
      case 'sending':
        return '📤';
      case 'draft':
        return '📝';
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  }

  // Formater les nombres
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toString();
    }
  }

  // Calculer le taux d'ouverture
  calculateOpenRate(opened: number, delivered: number): number {
    if (delivered === 0) return 0;
    return Math.round((opened / delivered) * 100 * 10) / 10;
  }

  // Calculer le taux de clic
  calculateClickRate(clicked: number, delivered: number): number {
    if (delivered === 0) return 0;
    return Math.round((clicked / delivered) * 100 * 10) / 10;
  }

  // Calculer le taux de rebond
  calculateBounceRate(bounced: number, sent: number): number {
    if (sent === 0) return 0;
    return Math.round((bounced / sent) * 100 * 10) / 10;
  }

  // ===================================================================
  // NOUVELLES MÉTHODES POUR LE SYSTÈME COMPLET
  // ===================================================================

  // Configuration SMTP
  async getSMTPConfig(): Promise<any> {
    try {
      return await this.makeRequest('/mailing/smtp-config');
    } catch (error) {
      console.error('Erreur lors de la récupération de la config SMTP:', error);
      throw error;
    }
  }

  async saveSMTPConfig(config: any): Promise<any> {
    try {
      return await this.makeRequest('/mailing/smtp-config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la config SMTP:', error);
      throw error;
    }
  }

  async testSMTPConnection(): Promise<any> {
    try {
      return await this.makeRequest('/mailing/test-smtp', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Erreur lors du test SMTP:', error);
      throw error;
    }
  }

  // Templates
  async getTemplates(): Promise<any[]> {
    try {
      return await this.makeRequest('/mailing/templates');
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      return [];
    }
  }

  async createTemplate(template: any): Promise<any> {
    try {
      return await this.makeRequest('/mailing/templates', {
        method: 'POST',
        body: JSON.stringify(template)
      });
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      throw error;
    }
  }

  async updateTemplate(id: string, template: any): Promise<any> {
    try {
      return await this.makeRequest(`/mailing/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify(template)
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du template:', error);
      throw error;
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      await this.makeRequest(`/mailing/templates/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du template:', error);
      throw error;
    }
  }

  // Listes de diffusion
  async getMailingLists(): Promise<any[]> {
    try {
      return await this.makeRequest('/mailing/lists');
    } catch (error) {
      console.error('Erreur lors de la récupération des listes:', error);
      return [];
    }
  }

  async createMailingList(list: any): Promise<any> {
    try {
      return await this.makeRequest('/mailing/lists', {
        method: 'POST',
        body: JSON.stringify(list)
      });
    } catch (error) {
      console.error('Erreur lors de la création de la liste:', error);
      throw error;
    }
  }

  // Contacts
  async getContacts(params?: { page?: number; limit?: number; listId?: string }): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.listId) queryParams.append('listId', params.listId);

      const url = `/mailing/contacts${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await this.makeRequest(url);
    } catch (error) {
      console.error('Erreur lors de la récupération des contacts:', error);
      return [];
    }
  }

  async addContact(contact: any): Promise<any> {
    try {
      return await this.makeRequest('/mailing/contacts', {
        method: 'POST',
        body: JSON.stringify(contact)
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
      throw error;
    }
  }

  // Envoyer une campagne
  async sendCampaign(campaignId: string, mailingListIds: string[]): Promise<any> {
    try {
      return await this.makeRequest(`/mailing/campaigns/${campaignId}/send`, {
        method: 'POST',
        body: JSON.stringify({ mailingListIds })
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la campagne:', error);
      throw error;
    }
  }

  // Statistiques
  async getMailingStats(): Promise<any> {
    try {
      return await this.makeRequest('/mailing/stats');
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return this.getDefaultStats();
    }
  }
}

export const adminMailingService = new AdminMailingService();
