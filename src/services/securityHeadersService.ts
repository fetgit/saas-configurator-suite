// ===================================================================
// SERVICE DE GESTION DES HEADERS DE SÉCURITÉ
// Configuration et gestion des headers de sécurité HTTP
// ===================================================================

// Interface pour la configuration des headers
export interface SecurityHeadersConfig {
  contentSecurityPolicy?: ContentSecurityPolicyConfig;
  strictTransportSecurity?: StrictTransportSecurityConfig;
  xFrameOptions?: XFrameOptionsConfig;
  xContentTypeOptions?: boolean;
  xXSSProtection?: XXSSProtectionConfig;
  referrerPolicy?: ReferrerPolicyConfig;
  permissionsPolicy?: PermissionsPolicyConfig;
  crossOriginEmbedderPolicy?: CrossOriginEmbedderPolicyConfig;
  crossOriginOpenerPolicy?: CrossOriginOpenerPolicyConfig;
  crossOriginResourcePolicy?: CrossOriginResourcePolicyConfig;
}

// Configuration Content Security Policy
export interface ContentSecurityPolicyConfig {
  defaultSrc?: string[];
  scriptSrc?: string[];
  styleSrc?: string[];
  imgSrc?: string[];
  fontSrc?: string[];
  connectSrc?: string[];
  mediaSrc?: string[];
  objectSrc?: string[];
  childSrc?: string[];
  frameSrc?: string[];
  workerSrc?: string[];
  manifestSrc?: string[];
  formAction?: string[];
  frameAncestors?: string[];
  baseUri?: string[];
  upgradeInsecureRequests?: boolean;
  blockAllMixedContent?: boolean;
  reportUri?: string;
  reportTo?: string;
}

// Configuration Strict Transport Security
export interface StrictTransportSecurityConfig {
  maxAge?: number;
  includeSubDomains?: boolean;
  preload?: boolean;
}

// Configuration X-Frame-Options
export interface XFrameOptionsConfig {
  policy: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';
  uri?: string;
}

// Configuration X-XSS-Protection
export interface XXSSProtectionConfig {
  enabled: boolean;
  mode?: 'block';
  reportUri?: string;
}

// Configuration Referrer Policy
export interface ReferrerPolicyConfig {
  policy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
}

// Configuration Permissions Policy
export interface PermissionsPolicyConfig {
  accelerometer?: string[];
  ambientLightSensor?: string[];
  autoplay?: string[];
  battery?: string[];
  camera?: string[];
  crossOriginIsolated?: string[];
  displayCapture?: string[];
  documentDomain?: string[];
  encryptedMedia?: string[];
  executionWhileNotRendered?: string[];
  executionWhileOutOfViewport?: string[];
  fullscreen?: string[];
  geolocation?: string[];
  gyroscope?: string[];
  keyboardMap?: string[];
  magnetometer?: string[];
  microphone?: string[];
  midi?: string[];
  navigationOverride?: string[];
  payment?: string[];
  pictureInPicture?: string[];
  publickeyCredentialsGet?: string[];
  screenWakeLock?: string[];
  syncXhr?: string[];
  usb?: string[];
  webShare?: string[];
  xrSpatialTracking?: string[];
}

// Configuration Cross-Origin Policies
export interface CrossOriginEmbedderPolicyConfig {
  policy: 'unsafe-none' | 'require-corp';
}

export interface CrossOriginOpenerPolicyConfig {
  policy: 'unsafe-none' | 'same-origin-allow-popups' | 'same-origin';
}

export interface CrossOriginResourcePolicyConfig {
  policy: 'same-site' | 'same-origin' | 'cross-origin';
}

// Classe de gestion des headers de sécurité
export class SecurityHeadersService {
  // Configuration par défaut pour le développement
  private static readonly DEFAULT_CONFIG: SecurityHeadersConfig = {
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
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
      upgradeInsecureRequests: true,
      blockAllMixedContent: true
    },
    strictTransportSecurity: {
      maxAge: 31536000, // 1 an
      includeSubDomains: true,
      preload: true
    },
    xFrameOptions: {
      policy: 'DENY'
    },
    xContentTypeOptions: true,
    xXSSProtection: {
      enabled: true,
      mode: 'block'
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    permissionsPolicy: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      payment: ["'none'"],
      usb: ["'none'"],
      accelerometer: ["'none'"],
      gyroscope: ["'none'"],
      magnetometer: ["'none'"],
      ambientLightSensor: ["'none'"],
      autoplay: ["'self'"],
      encryptedMedia: ["'self'"],
      fullscreen: ["'self'"],
      pictureInPicture: ["'self'"]
    },
    crossOriginEmbedderPolicy: {
      policy: 'require-corp'
    },
    crossOriginOpenerPolicy: {
      policy: 'same-origin'
    },
    crossOriginResourcePolicy: {
      policy: 'same-origin'
    }
  };

  // Configuration pour la production
  private static readonly PRODUCTION_CONFIG: SecurityHeadersConfig = {
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
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
      upgradeInsecureRequests: true,
      blockAllMixedContent: true
    },
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    xFrameOptions: {
      policy: 'DENY'
    },
    xContentTypeOptions: true,
    xXSSProtection: {
      enabled: true,
      mode: 'block'
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    permissionsPolicy: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      payment: ["'none'"],
      usb: ["'none'"],
      accelerometer: ["'none'"],
      gyroscope: ["'none'"],
      magnetometer: ["'none'"],
      ambientLightSensor: ["'none'"],
      autoplay: ["'self'"],
      encryptedMedia: ["'self'"],
      fullscreen: ["'self'"],
      pictureInPicture: ["'self'"]
    },
    crossOriginEmbedderPolicy: {
      policy: 'require-corp'
    },
    crossOriginOpenerPolicy: {
      policy: 'same-origin'
    },
    crossOriginResourcePolicy: {
      policy: 'same-origin'
    }
  };

  // Obtenir la configuration selon l'environnement
  static getConfig(environment: 'development' | 'production' = 'development'): SecurityHeadersConfig {
    return environment === 'production' ? this.PRODUCTION_CONFIG : this.DEFAULT_CONFIG;
  }

  // Générer le header Content Security Policy
  static generateContentSecurityPolicy(config: ContentSecurityPolicyConfig): string {
    const directives: string[] = [];

    // Directives de base
    if (config.defaultSrc) {
      directives.push(`default-src ${config.defaultSrc.join(' ')}`);
    }
    if (config.scriptSrc) {
      directives.push(`script-src ${config.scriptSrc.join(' ')}`);
    }
    if (config.styleSrc) {
      directives.push(`style-src ${config.styleSrc.join(' ')}`);
    }
    if (config.imgSrc) {
      directives.push(`img-src ${config.imgSrc.join(' ')}`);
    }
    if (config.fontSrc) {
      directives.push(`font-src ${config.fontSrc.join(' ')}`);
    }
    if (config.connectSrc) {
      directives.push(`connect-src ${config.connectSrc.join(' ')}`);
    }
    if (config.mediaSrc) {
      directives.push(`media-src ${config.mediaSrc.join(' ')}`);
    }
    if (config.objectSrc) {
      directives.push(`object-src ${config.objectSrc.join(' ')}`);
    }
    if (config.childSrc) {
      directives.push(`child-src ${config.childSrc.join(' ')}`);
    }
    if (config.frameSrc) {
      directives.push(`frame-src ${config.frameSrc.join(' ')}`);
    }
    if (config.workerSrc) {
      directives.push(`worker-src ${config.workerSrc.join(' ')}`);
    }
    if (config.manifestSrc) {
      directives.push(`manifest-src ${config.manifestSrc.join(' ')}`);
    }
    if (config.formAction) {
      directives.push(`form-action ${config.formAction.join(' ')}`);
    }
    if (config.frameAncestors) {
      directives.push(`frame-ancestors ${config.frameAncestors.join(' ')}`);
    }
    if (config.baseUri) {
      directives.push(`base-uri ${config.baseUri.join(' ')}`);
    }

    // Directives de sécurité
    if (config.upgradeInsecureRequests) {
      directives.push('upgrade-insecure-requests');
    }
    if (config.blockAllMixedContent) {
      directives.push('block-all-mixed-content');
    }

    // Reporting
    if (config.reportUri) {
      directives.push(`report-uri ${config.reportUri}`);
    }
    if (config.reportTo) {
      directives.push(`report-to ${config.reportTo}`);
    }

    return directives.join('; ');
  }

  // Générer le header Strict Transport Security
  static generateStrictTransportSecurity(config: StrictTransportSecurityConfig): string {
    const directives: string[] = [];

    if (config.maxAge) {
      directives.push(`max-age=${config.maxAge}`);
    }
    if (config.includeSubDomains) {
      directives.push('includeSubDomains');
    }
    if (config.preload) {
      directives.push('preload');
    }

    return directives.join('; ');
  }

  // Générer le header X-Frame-Options
  static generateXFrameOptions(config: XFrameOptionsConfig): string {
    if (config.policy === 'ALLOW-FROM' && config.uri) {
      return `ALLOW-FROM ${config.uri}`;
    }
    return config.policy;
  }

  // Générer le header X-XSS-Protection
  static generateXXSSProtection(config: XXSSProtectionConfig): string {
    if (!config.enabled) {
      return '0';
    }

    const directives: string[] = ['1'];
    if (config.mode === 'block') {
      directives.push('mode=block');
    }
    if (config.reportUri) {
      directives.push(`report=${config.reportUri}`);
    }

    return directives.join('; ');
  }

  // Générer le header Referrer Policy
  static generateReferrerPolicy(config: ReferrerPolicyConfig): string {
    return config.policy;
  }

  // Générer le header Permissions Policy
  static generatePermissionsPolicy(config: PermissionsPolicyConfig): string {
    const directives: string[] = [];

    Object.entries(config).forEach(([feature, allowlist]) => {
      if (allowlist && allowlist.length > 0) {
        directives.push(`${feature}=(${allowlist.join(' ')})`);
      } else {
        directives.push(`${feature}=()`);
      }
    });

    return directives.join(', ');
  }

  // Générer tous les headers de sécurité
  static generateAllHeaders(config: SecurityHeadersConfig): { [key: string]: string } {
    const headers: { [key: string]: string } = {};

    // Content Security Policy
    if (config.contentSecurityPolicy) {
      headers['Content-Security-Policy'] = this.generateContentSecurityPolicy(config.contentSecurityPolicy);
    }

    // Strict Transport Security
    if (config.strictTransportSecurity) {
      headers['Strict-Transport-Security'] = this.generateStrictTransportSecurity(config.strictTransportSecurity);
    }

    // X-Frame-Options
    if (config.xFrameOptions) {
      headers['X-Frame-Options'] = this.generateXFrameOptions(config.xFrameOptions);
    }

    // X-Content-Type-Options
    if (config.xContentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // X-XSS-Protection
    if (config.xXSSProtection) {
      headers['X-XSS-Protection'] = this.generateXXSSProtection(config.xXSSProtection);
    }

    // Referrer Policy
    if (config.referrerPolicy) {
      headers['Referrer-Policy'] = this.generateReferrerPolicy(config.referrerPolicy);
    }

    // Permissions Policy
    if (config.permissionsPolicy) {
      headers['Permissions-Policy'] = this.generatePermissionsPolicy(config.permissionsPolicy);
    }

    // Cross-Origin Embedder Policy
    if (config.crossOriginEmbedderPolicy) {
      headers['Cross-Origin-Embedder-Policy'] = config.crossOriginEmbedderPolicy.policy;
    }

    // Cross-Origin Opener Policy
    if (config.crossOriginOpenerPolicy) {
      headers['Cross-Origin-Opener-Policy'] = config.crossOriginOpenerPolicy.policy;
    }

    // Cross-Origin Resource Policy
    if (config.crossOriginResourcePolicy) {
      headers['Cross-Origin-Resource-Policy'] = config.crossOriginResourcePolicy.policy;
    }

    return headers;
  }

  // Valider la configuration des headers
  static validateConfig(config: SecurityHeadersConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Valider CSP
    if (config.contentSecurityPolicy) {
      if (config.contentSecurityPolicy.defaultSrc && config.contentSecurityPolicy.defaultSrc.length === 0) {
        errors.push('CSP default-src ne peut pas être vide');
      }
      if (config.contentSecurityPolicy.scriptSrc && config.contentSecurityPolicy.scriptSrc.includes("'unsafe-eval'")) {
        errors.push('CSP script-src contient unsafe-eval (risque de sécurité)');
      }
    }

    // Valider HSTS
    if (config.strictTransportSecurity) {
      if (config.strictTransportSecurity.maxAge && config.strictTransportSecurity.maxAge < 0) {
        errors.push('HSTS max-age doit être positif');
      }
    }

    // Valider X-Frame-Options
    if (config.xFrameOptions) {
      if (config.xFrameOptions.policy === 'ALLOW-FROM' && !config.xFrameOptions.uri) {
        errors.push('X-Frame-Options ALLOW-FROM nécessite une URI');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Obtenir les statistiques de sécurité
  static getSecurityStats(config: SecurityHeadersConfig): {
    totalHeaders: number;
    enabledHeaders: string[];
    securityLevel: 'low' | 'medium' | 'high' | 'maximum';
    recommendations: string[];
  } {
    const enabledHeaders: string[] = [];
    let securityLevel: 'low' | 'medium' | 'high' | 'maximum' = 'low';

    if (config.contentSecurityPolicy) enabledHeaders.push('CSP');
    if (config.strictTransportSecurity) enabledHeaders.push('HSTS');
    if (config.xFrameOptions) enabledHeaders.push('X-Frame-Options');
    if (config.xContentTypeOptions) enabledHeaders.push('X-Content-Type-Options');
    if (config.xXSSProtection) enabledHeaders.push('X-XSS-Protection');
    if (config.referrerPolicy) enabledHeaders.push('Referrer-Policy');
    if (config.permissionsPolicy) enabledHeaders.push('Permissions-Policy');
    if (config.crossOriginEmbedderPolicy) enabledHeaders.push('COEP');
    if (config.crossOriginOpenerPolicy) enabledHeaders.push('COOP');
    if (config.crossOriginResourcePolicy) enabledHeaders.push('CORP');

    // Déterminer le niveau de sécurité
    if (enabledHeaders.length >= 8) {
      securityLevel = 'maximum';
    } else if (enabledHeaders.length >= 6) {
      securityLevel = 'high';
    } else if (enabledHeaders.length >= 4) {
      securityLevel = 'medium';
    }

    const recommendations: string[] = [];
    if (!config.contentSecurityPolicy) {
      recommendations.push('Ajouter Content Security Policy');
    }
    if (!config.strictTransportSecurity) {
      recommendations.push('Ajouter Strict Transport Security');
    }
    if (!config.xFrameOptions) {
      recommendations.push('Ajouter X-Frame-Options');
    }

    return {
      totalHeaders: enabledHeaders.length,
      enabledHeaders,
      securityLevel,
      recommendations
    };
  }
}

// Fonction utilitaire pour l'export
export const securityHeaders = SecurityHeadersService;
