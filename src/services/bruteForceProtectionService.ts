// ===================================================================
// SERVICE DE PROTECTION CONTRE LES ATTAQUES PAR FORCE BRUTE
// Protection avancée contre les tentatives de connexion malveillantes
// ===================================================================

// Interface pour les tentatives de connexion
export interface LoginAttempt {
  id: string;
  email: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  failureReason?: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

// Interface pour les règles de protection
export interface BruteForceRule {
  name: string;
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
  penaltyMs: number;
  enabled: boolean;
  description: string;
}

// Interface pour les statistiques de sécurité
export interface SecurityStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  blockedAttempts: number;
  blockedIPs: number;
  blockedEmails: number;
  suspiciousActivity: number;
  last24Hours: {
    attempts: number;
    failures: number;
    blocks: number;
  };
}

// Interface pour les alertes de sécurité
export interface SecurityAlert {
  id: string;
  type: 'brute_force' | 'suspicious_activity' | 'multiple_failures' | 'ip_blocked' | 'email_blocked';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  ip?: string;
  email?: string;
  details: any;
  resolved: boolean;
}

// Classe de protection contre les attaques par force brute
export class BruteForceProtectionService {
  // Règles de protection prédéfinies
  private static readonly PROTECTION_RULES: BruteForceRule[] = [
    {
      name: 'login_attempts',
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000, // 30 minutes
      penaltyMs: 0,
      enabled: true,
      description: 'Limite les tentatives de connexion par IP'
    },
    {
      name: 'email_attempts',
      maxAttempts: 3,
      windowMs: 10 * 60 * 1000, // 10 minutes
      blockDurationMs: 60 * 60 * 1000, // 1 heure
      penaltyMs: 0,
      enabled: true,
      description: 'Limite les tentatives de connexion par email'
    },
    {
      name: 'rapid_attempts',
      maxAttempts: 10,
      windowMs: 5 * 60 * 1000, // 5 minutes
      blockDurationMs: 15 * 60 * 1000, // 15 minutes
      penaltyMs: 1000, // 1 seconde de délai
      enabled: true,
      description: 'Détecte les tentatives rapides et multiples'
    },
    {
      name: 'suspicious_patterns',
      maxAttempts: 20,
      windowMs: 60 * 60 * 1000, // 1 heure
      blockDurationMs: 24 * 60 * 60 * 1000, // 24 heures
      penaltyMs: 0,
      enabled: true,
      description: 'Détecte les patterns suspects d\'activité'
    }
  ];

  // Stockage des tentatives (en production, utiliser Redis ou une base de données)
  private static attempts: Map<string, LoginAttempt[]> = new Map();
  private static blockedIPs: Map<string, { until: Date; reason: string }> = new Map();
  private static blockedEmails: Map<string, { until: Date; reason: string }> = new Map();
  private static alerts: SecurityAlert[] = [];

  // Obtenir l'IP réelle (en production, utiliser un proxy ou load balancer)
  static getClientIP(request: any): string {
    return request.ip || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress ||
           request.headers['x-forwarded-for']?.split(',')[0] ||
           '127.0.0.1';
  }

  // Obtenir le User-Agent
  static getClientUserAgent(request: any): string {
    return request.headers['user-agent'] || 'Unknown';
  }

  // Enregistrer une tentative de connexion
  static recordLoginAttempt(
    email: string,
    ip: string,
    userAgent: string,
    success: boolean,
    failureReason?: string
  ): LoginAttempt {
    const attempt: LoginAttempt = {
      id: this.generateId(),
      email,
      ip,
      userAgent,
      timestamp: new Date(),
      success,
      failureReason
    };

    // Stocker la tentative
    const key = `${ip}:${email}`;
    if (!this.attempts.has(key)) {
      this.attempts.set(key, []);
    }
    this.attempts.get(key)!.push(attempt);

    // Nettoyer les anciennes tentatives
    this.cleanupOldAttempts();

    // Vérifier les règles de protection
    this.checkProtectionRules(attempt);

    return attempt;
  }

  // Vérifier si une IP est bloquée
  static isIPBlocked(ip: string): { blocked: boolean; until?: Date; reason?: string } {
    const block = this.blockedIPs.get(ip);
    if (block && block.until > new Date()) {
      return { blocked: true, until: block.until, reason: block.reason };
    }
    
    // Nettoyer les blocs expirés
    if (block && block.until <= new Date()) {
      this.blockedIPs.delete(ip);
    }
    
    return { blocked: false };
  }

  // Vérifier si un email est bloqué
  static isEmailBlocked(email: string): { blocked: boolean; until?: Date; reason?: string } {
    const block = this.blockedEmails.get(email);
    if (block && block.until > new Date()) {
      return { blocked: true, until: block.until, reason: block.reason };
    }
    
    // Nettoyer les blocs expirés
    if (block && block.until <= new Date()) {
      this.blockedEmails.delete(email);
    }
    
    return { blocked: false };
  }

  // Vérifier les règles de protection
  private static checkProtectionRules(attempt: LoginAttempt): void {
    for (const rule of this.PROTECTION_RULES) {
      if (!rule.enabled) continue;

      const key = `${attempt.ip}:${attempt.email}`;
      const attempts = this.attempts.get(key) || [];
      
      // Filtrer les tentatives dans la fenêtre de temps
      const windowStart = new Date(Date.now() - rule.windowMs);
      const recentAttempts = attempts.filter(a => a.timestamp >= windowStart);
      
      // Compter les échecs
      const failures = recentAttempts.filter(a => !a.success).length;
      
      if (failures >= rule.maxAttempts) {
        this.blockUser(attempt, rule, failures);
      }
    }
  }

  // Bloquer un utilisateur
  private static blockUser(attempt: LoginAttempt, rule: BruteForceRule, failureCount: number): void {
    const blockUntil = new Date(Date.now() + rule.blockDurationMs);
    
    // Bloquer l'IP
    this.blockedIPs.set(attempt.ip, {
      until: blockUntil,
      reason: `Trop d'échecs de connexion (${failureCount}/${rule.maxAttempts})`
    });
    
    // Bloquer l'email
    this.blockedEmails.set(attempt.email, {
      until: blockUntil,
      reason: `Trop d'échecs de connexion (${failureCount}/${rule.maxAttempts})`
    });
    
    // Créer une alerte
    this.createSecurityAlert({
      type: 'brute_force',
      severity: failureCount > 10 ? 'critical' : 'high',
      message: `Tentative de force brute détectée: ${failureCount} échecs en ${rule.windowMs / 1000 / 60} minutes`,
      ip: attempt.ip,
      email: attempt.email,
      details: {
        rule: rule.name,
        failureCount,
        windowMs: rule.windowMs,
        blockDurationMs: rule.blockDurationMs
      }
    });
  }

  // Créer une alerte de sécurité
  static createSecurityAlert(alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>): SecurityAlert {
    const alert: SecurityAlert = {
      id: this.generateId(),
      timestamp: new Date(),
      resolved: false,
      ...alertData
    };
    
    this.alerts.push(alert);
    
    // Limiter le nombre d'alertes stockées
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-500);
    }
    
    return alert;
  }

  // Obtenir les statistiques de sécurité
  static getSecurityStats(): SecurityStats {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let totalAttempts = 0;
    let successfulAttempts = 0;
    let failedAttempts = 0;
    let last24HoursAttempts = 0;
    let last24HoursFailures = 0;
    
    // Analyser toutes les tentatives
    for (const attempts of this.attempts.values()) {
      totalAttempts += attempts.length;
      successfulAttempts += attempts.filter(a => a.success).length;
      failedAttempts += attempts.filter(a => !a.success).length;
      
      const recentAttempts = attempts.filter(a => a.timestamp >= last24Hours);
      last24HoursAttempts += recentAttempts.length;
      last24HoursFailures += recentAttempts.filter(a => !a.success).length;
    }
    
    const blockedAttempts = this.alerts.filter(a => a.type === 'brute_force').length;
    const suspiciousActivity = this.alerts.filter(a => a.type === 'suspicious_activity').length;
    
    return {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      blockedAttempts,
      blockedIPs: this.blockedIPs.size,
      blockedEmails: this.blockedEmails.size,
      suspiciousActivity,
      last24Hours: {
        attempts: last24HoursAttempts,
        failures: last24HoursFailures,
        blocks: this.alerts.filter(a => a.timestamp >= last24Hours && a.type === 'brute_force').length
      }
    };
  }

  // Obtenir les alertes de sécurité
  static getSecurityAlerts(limit: number = 50): SecurityAlert[] {
    return this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Résoudre une alerte
  static resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  // Débloquer une IP
  static unblockIP(ip: string): boolean {
    return this.blockedIPs.delete(ip);
  }

  // Débloquer un email
  static unblockEmail(email: string): boolean {
    return this.blockedEmails.delete(email);
  }

  // Nettoyer les anciennes tentatives
  private static cleanupOldAttempts(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 heures
    
    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(a => a.timestamp >= cutoff);
      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    }
  }

  // Générer un ID unique
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Obtenir les règles de protection
  static getProtectionRules(): BruteForceRule[] {
    return [...this.PROTECTION_RULES];
  }

  // Mettre à jour une règle de protection
  static updateProtectionRule(ruleName: string, updates: Partial<BruteForceRule>): boolean {
    const ruleIndex = this.PROTECTION_RULES.findIndex(r => r.name === ruleName);
    if (ruleIndex !== -1) {
      this.PROTECTION_RULES[ruleIndex] = { ...this.PROTECTION_RULES[ruleIndex], ...updates };
      return true;
    }
    return false;
  }

  // Vérifier la sécurité d'une tentative de connexion
  static checkLoginSecurity(email: string, ip: string): {
    allowed: boolean;
    reason?: string;
    delay?: number;
    blockUntil?: Date;
  } {
    // Vérifier si l'IP est bloquée
    const ipBlock = this.isIPBlocked(ip);
    if (ipBlock.blocked) {
      return {
        allowed: false,
        reason: `IP bloquée: ${ipBlock.reason}`,
        blockUntil: ipBlock.until
      };
    }
    
    // Vérifier si l'email est bloqué
    const emailBlock = this.isEmailBlocked(email);
    if (emailBlock.blocked) {
      return {
        allowed: false,
        reason: `Email bloqué: ${emailBlock.reason}`,
        blockUntil: emailBlock.until
      };
    }
    
    // Vérifier les tentatives récentes pour calculer un délai
    const key = `${ip}:${email}`;
    const attempts = this.attempts.get(key) || [];
    const recentAttempts = attempts.filter(a => 
      a.timestamp >= new Date(Date.now() - 5 * 60 * 1000) // 5 minutes
    );
    
    if (recentAttempts.length > 0) {
      const delay = Math.min(recentAttempts.length * 1000, 10000); // Max 10 secondes
      return {
        allowed: true,
        delay
      };
    }
    
    return { allowed: true };
  }

  // Obtenir les tentatives récentes pour une IP/email
  static getRecentAttempts(ip: string, email: string, hours: number = 24): LoginAttempt[] {
    const key = `${ip}:${email}`;
    const attempts = this.attempts.get(key) || [];
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return attempts.filter(a => a.timestamp >= cutoff);
  }

  // Détecter les patterns suspects
  static detectSuspiciousPatterns(ip: string): {
    suspicious: boolean;
    patterns: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  } {
    const patterns: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Analyser toutes les tentatives pour cette IP
    const allAttempts: LoginAttempt[] = [];
    for (const [key, attempts] of this.attempts.entries()) {
      if (key.startsWith(ip + ':')) {
        allAttempts.push(...attempts);
      }
    }
    
    if (allAttempts.length === 0) {
      return { suspicious: false, patterns, severity };
    }
    
    // Pattern 1: Tentatives multiples sur différents emails
    const uniqueEmails = new Set(allAttempts.map(a => a.email));
    if (uniqueEmails.size > 5) {
      patterns.push(`Tentatives sur ${uniqueEmails.size} emails différents`);
      severity = 'high';
    }
    
    // Pattern 2: Tentatives très rapides
    const recentAttempts = allAttempts.filter(a => 
      a.timestamp >= new Date(Date.now() - 60 * 1000) // 1 minute
    );
    if (recentAttempts.length > 10) {
      patterns.push(`${recentAttempts.length} tentatives en 1 minute`);
      severity = 'critical';
    }
    
    // Pattern 3: User-Agents suspects
    const userAgents = new Set(allAttempts.map(a => a.userAgent));
    if (userAgents.size > 3) {
      patterns.push(`${userAgents.size} User-Agents différents`);
      severity = 'medium';
    }
    
    // Pattern 4: Taux d'échec élevé
    const failureRate = allAttempts.filter(a => !a.success).length / allAttempts.length;
    if (failureRate > 0.8) {
      patterns.push(`Taux d'échec de ${Math.round(failureRate * 100)}%`);
      severity = 'high';
    }
    
    return {
      suspicious: patterns.length > 0,
      patterns,
      severity
    };
  }
}

// Fonction utilitaire pour l'export
export const bruteForceProtection = BruteForceProtectionService;
