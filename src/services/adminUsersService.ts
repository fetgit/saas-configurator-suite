// Service pour la gestion des utilisateurs en administration
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'superadmin';
  company?: string;
  status: 'active' | 'inactive' | 'pending_verification';
  email_verified: boolean;
  mfa_enabled: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin' | 'superadmin';
  company?: string;
}

export interface UpdateUserData {
  name?: string;
  role?: 'user' | 'admin' | 'superadmin';
  company?: string;
  status?: 'active' | 'inactive' | 'pending_verification';
  email_verified?: boolean;
  mfa_enabled?: boolean;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class AdminUsersService {
  private baseUrl = 'http://localhost:3001/api/admin';

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Import dynamique pour éviter les dépendances circulaires
    const { AuthService } = await import('./authService');
    const tokens = await AuthService.getStoredTokens();
    const token = tokens?.accessToken;
    
    // Debug: log token status
    console.log('🔍 Debug token:', {
      hasTokens: !!tokens,
      hasAccessToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) + '...' || 'null'
    });
    
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

  // Récupérer tous les utilisateurs avec pagination et filtres
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  } = {}): Promise<UsersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);
    if (params.status) searchParams.append('status', params.status);

    const queryString = searchParams.toString();
    const endpoint = `/users${queryString ? `?${queryString}` : ''}`;

    return this.makeRequest<UsersResponse>(endpoint);
  }

  // Créer un nouvel utilisateur
  async createUser(userData: CreateUserData): Promise<{ user: User; message: string }> {
    return this.makeRequest<{ user: User; message: string }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Mettre à jour un utilisateur
  async updateUser(id: number, userData: UpdateUserData): Promise<{ user: User; message: string }> {
    return this.makeRequest<{ user: User; message: string }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Supprimer un utilisateur
  async deleteUser(id: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtenir les statistiques des utilisateurs
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    byRole: { role: string; count: number }[];
  }> {
    try {
      const response = await this.getUsers({ limit: 1000 }); // Récupérer tous les utilisateurs pour les stats
      const users = response.users;
      
      const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        inactive: users.filter(u => u.status === 'inactive').length,
        pending: users.filter(u => u.status === 'pending_verification').length,
        byRole: users.reduce((acc, user) => {
          const existing = acc.find(item => item.role === user.role);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ role: user.role, count: 1 });
          }
          return acc;
        }, [] as { role: string; count: number }[])
      };

      return stats;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      // Retourner des données par défaut en cas d'erreur
      return {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        byRole: []
      };
    }
  }
}

export const adminUsersService = new AdminUsersService();
