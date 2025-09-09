import { useAuth } from '@/contexts/AuthContext';

// Types pour les Security Headers
export interface SecurityHeadersConfig {
  id?: number;
  environment: 'development' | 'production' | 'staging';
  csp: {
    enabled: boolean;
    directives: {
      defaultSrc: string[];
      scriptSrc: string[];
      styleSrc: string[];
      imgSrc: string[];
      fontSrc: string[];
      connectSrc: string[];
      mediaSrc: string[];
      objectSrc: string[];
      childSrc: string[];
      frameSrc: string[];
      workerSrc: string[];
      manifestSrc: string[];
      formAction: string[];
      frameAncestors: string[];
      baseUri: string[];
      upgradeInsecureRequests: string[];
      blockAllMixedContent: string[];
    };
    reportOnly: boolean;
  };
  hsts: {
    enabled: boolean;
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  xFrameOptions: {
    enabled: boolean;
    action: 'deny' | 'sameorigin' | 'allow-from';
  };
  xContentTypeOptions: {
    enabled: boolean;
  };
  xXssProtection: {
    enabled: boolean;
  };
  referrerPolicy: {
    enabled: boolean;
    policy: string;
  };
  permissionsPolicy: {
    enabled: boolean;
    policies: {
      camera: string[];
      microphone: string[];
      geolocation: string[];
      payment: string[];
      usb: string[];
      accelerometer: string[];
      gyroscope: string[];
      magnetometer: string[];
      ambientLightSensor: string[];
      autoplay: string[];
      encryptedMedia: string[];
      fullscreen: string[];
      pictureInPicture: string[];
    };
  };
  crossOriginEmbedderPolicy: {
    enabled: boolean;
    policy: string;
  };
  crossOriginOpenerPolicy: {
    enabled: boolean;
    policy: string;
  };
  crossOriginResourcePolicy: {
    enabled: boolean;
    policy: string;
  };
  isActive: boolean;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratedHeaders {
  environment: string;
  headers: { [key: string]: string };
  config: SecurityHeadersConfig;
  generatedAt: string;
  totalHeaders: number;
}

export interface SecurityHeadersStats {
  totalHeaders: number;
  securityLevel: 'Low' | 'Medium' | 'High' | 'Maximum';
  vulnerabilities: string[];
  recommendations: string[];
}

class SecurityHeadersApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Import dynamique pour éviter les dépendances circulaires
    const { AuthService } = await import('./authService');
    
    // Vérifier d'abord si l'utilisateur est authentifié
    const isAuthenticated = await AuthService.isAuthenticated();
    if (!isAuthenticated) {
      console.log('🔍 SecurityHeaders: Utilisateur non authentifié');
      return {
        'Content-Type': 'application/json',
        'Authorization': '',
      };
    }
    
    const tokens = await AuthService.getStoredTokens();
    const token = tokens?.accessToken;
    
    // Debug: log token status
    console.log('🔍 SecurityHeaders Debug token:', {
      isAuthenticated,
      hasTokens: !!tokens,
      hasAccessToken: !!token,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) + '...' || 'null'
    });
    
    // Debug: décoder le token si présent
    if (token) {
      console.log('🎫 Token complet:', token);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('📋 Payload du token:', payload);
          if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            console.log('⏰ Expiration:', expDate.toISOString());
            console.log('⏰ Maintenant:', now.toISOString());
            console.log('⏰ Expiré?', now > expDate);
          }
        }
      } catch (error) {
        console.error('❌ Erreur de décodage du token:', error.message);
      }
    }
    
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

  // Récupérer la configuration des Security Headers
  async getConfig(environment: 'development' | 'production' | 'staging' = 'development'): Promise<SecurityHeadersConfig> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/admin/security-headers?environment=${environment}`,
        {
          method: 'GET',
          headers: await this.getAuthHeaders(),
        }
      );

      return this.handleResponse<SecurityHeadersConfig>(response);
    } catch (error) {
      console.error('Erreur lors de la récupération de la configuration:', error);
      // Retourner une configuration par défaut si le backend n'est pas disponible
      return this.getDefaultConfig(environment);
    }
  }

  // Sauvegarder la configuration des Security Headers
  async saveConfig(config: SecurityHeadersConfig): Promise<SecurityHeadersConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admin/security-headers`, {
        method: 'POST',
        headers: await this.getAuthHeaders(),
        body: JSON.stringify(config),
      });

      return this.handleResponse<SecurityHeadersConfig>(response);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      throw error;
    }
  }

  // Générer les headers de sécurité
  async generateHeaders(environment: 'development' | 'production' | 'staging' = 'development'): Promise<GeneratedHeaders> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/admin/security-headers/generate?environment=${environment}`,
        {
          method: 'GET',
          headers: await this.getAuthHeaders(),
        }
      );

      return this.handleResponse<GeneratedHeaders>(response);
    } catch (error) {
      console.error('Erreur lors de la génération des headers:', error);
      // Générer des headers par défaut si le backend n'est pas disponible
      return this.generateDefaultHeaders(environment);
    }
  }

  // Valider la configuration
  validateConfig(config: SecurityHeadersConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation CSP
    if (config.csp.enabled) {
      if (config.csp.directives.scriptSrc.includes("'unsafe-eval'") && config.environment === 'production') {
        errors.push("CSP script-src contient 'unsafe-eval' (risque de sécurité en production)");
      }
      if (config.csp.directives.scriptSrc.includes("'unsafe-inline'") && config.environment === 'production') {
        errors.push("CSP script-src contient 'unsafe-inline' (risque de sécurité en production)");
      }
    }

    // Validation HSTS
    if (config.hsts.enabled && config.hsts.maxAge < 31536000) {
      errors.push("HSTS maxAge devrait être d'au moins 1 an (31536000 secondes)");
    }

    // Validation X-Frame-Options
    if (config.xFrameOptions.enabled && config.xFrameOptions.action === 'allow-from') {
      errors.push("X-Frame-Options 'allow-from' est déprécié, utilisez 'deny' ou 'sameorigin'");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculer les statistiques de sécurité
  calculateSecurityStats(config: SecurityHeadersConfig): SecurityHeadersStats {
    const enabledHeaders = [
      config.csp.enabled,
      config.hsts.enabled,
      config.xFrameOptions.enabled,
      config.xContentTypeOptions.enabled,
      config.xXssProtection.enabled,
      config.referrerPolicy.enabled,
      config.permissionsPolicy.enabled,
      config.crossOriginEmbedderPolicy.enabled,
      config.crossOriginOpenerPolicy.enabled,
      config.crossOriginResourcePolicy.enabled
    ].filter(Boolean).length;

    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];

    // Vérifications de sécurité
    if (config.csp.enabled) {
      if (config.csp.directives.scriptSrc.includes("'unsafe-eval'")) {
        vulnerabilities.push("CSP script-src contient 'unsafe-eval'");
        recommendations.push("Supprimez 'unsafe-eval' du CSP script-src");
      }
      if (config.csp.directives.scriptSrc.includes("'unsafe-inline'")) {
        vulnerabilities.push("CSP script-src contient 'unsafe-inline'");
        recommendations.push("Supprimez 'unsafe-inline' du CSP script-src");
      }
    }

    if (config.hsts.enabled && config.hsts.maxAge < 31536000) {
      vulnerabilities.push("HSTS maxAge trop faible");
      recommendations.push("Augmentez HSTS maxAge à au moins 1 an");
    }

    if (!config.hsts.enabled) {
      vulnerabilities.push("HSTS non activé");
      recommendations.push("Activez HSTS pour forcer HTTPS");
    }

    if (!config.csp.enabled) {
      vulnerabilities.push("CSP non activé");
      recommendations.push("Activez CSP pour protéger contre XSS");
    }

    // Déterminer le niveau de sécurité
    let securityLevel: 'Low' | 'Medium' | 'High' | 'Maximum';
    if (enabledHeaders >= 8 && vulnerabilities.length === 0) {
      securityLevel = 'Maximum';
    } else if (enabledHeaders >= 6 && vulnerabilities.length <= 2) {
      securityLevel = 'High';
    } else if (enabledHeaders >= 4 && vulnerabilities.length <= 4) {
      securityLevel = 'Medium';
    } else {
      securityLevel = 'Low';
    }

    return {
      totalHeaders: enabledHeaders,
      securityLevel,
      vulnerabilities,
      recommendations
    };
  }

  // Exporter la configuration en JSON
  exportConfig(config: SecurityHeadersConfig, headers: { [key: string]: string }): string {
    const exportData = {
      environment: config.environment,
      config,
      headers,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Exporter la configuration pour Nginx
  exportNginxConfig(headers: { [key: string]: string }, environment: string): string {
    const nginxHeaders = Object.entries(headers)
      .map(([key, value]) => `    add_header ${key} "${value}";`)
      .join('\n');

    return `# Configuration Nginx - Headers de Sécurité
# Environnement: ${environment}
# Généré le: ${new Date().toISOString()}

server {
    # ... autres configurations ...
    
    # Headers de sécurité
${nginxHeaders}
    
    # ... autres configurations ...
}`;
  }

  // Exporter la configuration pour Apache
  exportApacheConfig(headers: { [key: string]: string }, environment: string): string {
    const apacheHeaders = Object.entries(headers)
      .map(([key, value]) => `    Header always set ${key} "${value}"`)
      .join('\n');

    return `# Configuration Apache - Headers de Sécurité
# Environnement: ${environment}
# Généré le: ${new Date().toISOString()}

<VirtualHost *:80>
    # ... autres configurations ...
    
    # Headers de sécurité
${apacheHeaders}
    
    # ... autres configurations ...
</VirtualHost>`;
  }

  // Configuration par défaut (fallback)
  private getDefaultConfig(environment: 'development' | 'production' | 'staging'): SecurityHeadersConfig {
    return {
      environment,
      csp: {
        enabled: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: environment === 'development' 
            ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"]
            : ["'self'", "https://cdn.jsdelivr.net"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'", "https://api.example.com"],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          childSrc: ["'self'"],
          frameSrc: ["'self'"],
          workerSrc: ["'self'"],
          manifestSrc: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          upgradeInsecureRequests: [],
          blockAllMixedContent: []
        },
        reportOnly: false
      },
      hsts: {
        enabled: true,
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      xFrameOptions: {
        enabled: true,
        action: 'deny'
      },
      xContentTypeOptions: {
        enabled: true
      },
      xXssProtection: {
        enabled: true
      },
      referrerPolicy: {
        enabled: true,
        policy: 'strict-origin-when-cross-origin'
      },
      permissionsPolicy: {
        enabled: true,
        policies: {
          camera: [],
          microphone: [],
          geolocation: [],
          payment: [],
          usb: [],
          accelerometer: [],
          gyroscope: [],
          magnetometer: [],
          ambientLightSensor: [],
          autoplay: ["'self'"],
          encryptedMedia: ["'self'"],
          fullscreen: ["'self'"],
          pictureInPicture: ["'self'"]
        }
      },
      crossOriginEmbedderPolicy: {
        enabled: true,
        policy: 'require-corp'
      },
      crossOriginOpenerPolicy: {
        enabled: true,
        policy: 'same-origin'
      },
      crossOriginResourcePolicy: {
        enabled: true,
        policy: 'same-origin'
      },
      isActive: true
    };
  }

  // Génération de headers par défaut (fallback)
  private generateDefaultHeaders(environment: 'development' | 'production' | 'staging'): GeneratedHeaders {
    const config = this.getDefaultConfig(environment);
    const headers: { [key: string]: string } = {};

    // CSP
    if (config.csp.enabled) {
      const cspDirectives = Object.entries(config.csp.directives)
        .map(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            return `${key} ${value.join(' ')}`;
          } else if (value.length === 0) {
            return key;
          }
          return null;
        })
        .filter(Boolean)
        .join('; ');
      
      headers['Content-Security-Policy'] = cspDirectives;
    }

    // HSTS
    if (config.hsts.enabled) {
      let hstsValue = `max-age=${config.hsts.maxAge}`;
      if (config.hsts.includeSubDomains) hstsValue += '; includeSubDomains';
      if (config.hsts.preload) hstsValue += '; preload';
      headers['Strict-Transport-Security'] = hstsValue;
    }

    // X-Frame-Options
    if (config.xFrameOptions.enabled) {
      headers['X-Frame-Options'] = config.xFrameOptions.action.toUpperCase();
    }

    // X-Content-Type-Options
    if (config.xContentTypeOptions.enabled) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // X-XSS-Protection
    if (config.xXssProtection.enabled) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    // Referrer-Policy
    if (config.referrerPolicy.enabled) {
      headers['Referrer-Policy'] = config.referrerPolicy.policy;
    }

    // Permissions-Policy
    if (config.permissionsPolicy.enabled) {
      const permissionsDirectives = Object.entries(config.permissionsPolicy.policies)
        .map(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            return `${key}=(${value.join(' ')})`;
          } else if (value.length === 0) {
            return `${key}=()`;
          }
          return null;
        })
        .filter(Boolean)
        .join(', ');
      
      headers['Permissions-Policy'] = permissionsDirectives;
    }

    // Cross-Origin-Embedder-Policy
    if (config.crossOriginEmbedderPolicy.enabled) {
      headers['Cross-Origin-Embedder-Policy'] = config.crossOriginEmbedderPolicy.policy;
    }

    // Cross-Origin-Opener-Policy
    if (config.crossOriginOpenerPolicy.enabled) {
      headers['Cross-Origin-Opener-Policy'] = config.crossOriginOpenerPolicy.policy;
    }

    // Cross-Origin-Resource-Policy
    if (config.crossOriginResourcePolicy.enabled) {
      headers['Cross-Origin-Resource-Policy'] = config.crossOriginResourcePolicy.policy;
    }

    return {
      environment,
      headers,
      config,
      generatedAt: new Date().toISOString(),
      totalHeaders: Object.keys(headers).length
    };
  }
}

// Instance singleton
export const securityHeadersApiService = new SecurityHeadersApiService();
export default securityHeadersApiService;
