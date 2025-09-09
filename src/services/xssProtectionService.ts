// ===================================================================
// SERVICE DE PROTECTION XSS (Cross-Site Scripting)
// Sanitisation et validation des entrées utilisateur
// ===================================================================

import DOMPurify from 'dompurify';

// Configuration de sécurité pour DOMPurify
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'b', 'i', 'em', 'strong', 'p', 'br', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'a', 'img'
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'alt', 'src', 'class', 'id',
    'data-*', 'aria-*', 'role'
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  FORBID_TAGS: [
    'script', 'object', 'embed', 'form', 'input', 'textarea',
    'button', 'select', 'option', 'iframe', 'frame', 'frameset',
    'applet', 'base', 'link', 'meta', 'style'
  ],
  FORBID_ATTR: [
    'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus',
    'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect',
    'onkeydown', 'onkeypress', 'onkeyup', 'onmousedown',
    'onmousemove', 'onmouseout', 'onmouseup', 'onabort',
    'onbeforeunload', 'onerror', 'onhashchange', 'onload',
    'onpageshow', 'onpagehide', 'onresize', 'onscroll',
    'onunload', 'onbeforeprint', 'onafterprint'
  ]
};

// Interface pour les options de sanitisation
export interface SanitizationOptions {
  allowHtml?: boolean;
  maxLength?: number;
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripHtml?: boolean;
}

// Interface pour les résultats de validation
export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  originalValue: string;
  errors: string[];
  warnings: string[];
}

// Classe de protection XSS
export class XSSProtectionService {
  // Sanitiser du contenu HTML
  static sanitizeHtml(html: string, options: SanitizationOptions = {}): string {
    try {
      if (!html || typeof html !== 'string') {
        return '';
      }

      // Si stripHtml est activé, supprimer tout le HTML
      if (options.stripHtml) {
        return this.stripHtml(html);
      }

      // Si allowHtml est false, échapper le HTML
      if (options.allowHtml === false) {
        return this.escapeHtml(html);
      }

      // Configuration personnalisée
      const config = {
        ...PURIFY_CONFIG,
        ALLOWED_TAGS: options.allowedTags || PURIFY_CONFIG.ALLOWED_TAGS,
        ALLOWED_ATTR: options.allowedAttributes || PURIFY_CONFIG.ALLOWED_ATTR
      };

      // Sanitiser avec DOMPurify
      const sanitized = DOMPurify.sanitize(html, config);

      // Limiter la longueur si spécifié
      if (options.maxLength && sanitized.length > options.maxLength) {
        return sanitized.substring(0, options.maxLength) + '...';
      }

      return sanitized;
    } catch (error) {
      console.error('Erreur lors de la sanitisation HTML:', error);
      return this.escapeHtml(html);
    }
  }

  // Échapper les caractères HTML
  static escapeHtml(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    const htmlEscapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };

    return text.replace(/[&<>"'`=\/]/g, (char) => htmlEscapeMap[char] || char);
  }

  // Supprimer tout le HTML
  static stripHtml(html: string): string {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Supprimer les balises HTML
    let stripped = html.replace(/<[^>]*>/g, '');
    
    // Décoder les entités HTML
    stripped = stripped.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
      const entityMap: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x60;': '`',
        '&#x3D;': '=',
        '&nbsp;': ' '
      };
      return entityMap[entity] || entity;
    });

    return stripped.trim();
  }

  // Valider et sanitiser une entrée utilisateur
  static validateAndSanitize(
    input: string, 
    options: SanitizationOptions = {}
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      sanitizedValue: '',
      originalValue: input || '',
      errors: [],
      warnings: []
    };

    try {
      // Vérifier si l'entrée est vide
      if (!input || typeof input !== 'string') {
        result.sanitizedValue = '';
        return result;
      }

      // Détecter les tentatives XSS
      const xssPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe[^>]*>.*?<\/iframe>/gi,
        /<object[^>]*>.*?<\/object>/gi,
        /<embed[^>]*>/gi,
        /<form[^>]*>.*?<\/form>/gi,
        /<input[^>]*>/gi,
        /<textarea[^>]*>.*?<\/textarea>/gi,
        /<button[^>]*>.*?<\/button>/gi,
        /<select[^>]*>.*?<\/select>/gi,
        /<option[^>]*>.*?<\/option>/gi,
        /<link[^>]*>/gi,
        /<meta[^>]*>/gi,
        /<style[^>]*>.*?<\/style>/gi,
        /<base[^>]*>/gi,
        /<applet[^>]*>.*?<\/applet>/gi,
        /<frame[^>]*>.*?<\/frame>/gi,
        /<frameset[^>]*>.*?<\/frameset>/gi
      ];

      // Vérifier les patterns XSS
      for (const pattern of xssPatterns) {
        if (pattern.test(input)) {
          result.errors.push(`Tentative XSS détectée: ${pattern.source}`);
          result.isValid = false;
        }
      }

      // Détecter les URLs suspectes
      const suspiciousUrlPatterns = [
        /javascript:/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
        /file:/gi,
        /ftp:/gi
      ];

      for (const pattern of suspiciousUrlPatterns) {
        if (pattern.test(input)) {
          result.warnings.push(`URL suspecte détectée: ${pattern.source}`);
        }
      }

      // Sanitiser l'entrée
      result.sanitizedValue = this.sanitizeHtml(input, options);

      // Vérifier la longueur
      if (options.maxLength && result.sanitizedValue.length > options.maxLength) {
        result.warnings.push(`Contenu tronqué à ${options.maxLength} caractères`);
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de la validation XSS:', error);
      result.isValid = false;
      result.errors.push('Erreur lors de la validation');
      result.sanitizedValue = this.escapeHtml(input);
      return result;
    }
  }

  // Valider un nom d'utilisateur
  static validateUsername(username: string): ValidationResult {
    const options: SanitizationOptions = {
      allowHtml: false,
      maxLength: 50,
      stripHtml: true
    };

    const result = this.validateAndSanitize(username, options);

    // Vérifications spécifiques au nom d'utilisateur
    if (result.sanitizedValue.length < 3) {
      result.errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      result.isValid = false;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(result.sanitizedValue)) {
      result.errors.push('Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores');
      result.isValid = false;
    }

    return result;
  }

  // Valider un email
  static validateEmail(email: string): ValidationResult {
    const options: SanitizationOptions = {
      allowHtml: false,
      maxLength: 254,
      stripHtml: true
    };

    const result = this.validateAndSanitize(email, options);

    // Vérification du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(result.sanitizedValue)) {
      result.errors.push('Format d\'email invalide');
      result.isValid = false;
    }

    return result;
  }

  // Valider du contenu de message/commentaire
  static validateMessageContent(content: string): ValidationResult {
    const options: SanitizationOptions = {
      allowHtml: true,
      maxLength: 5000,
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'a'],
      allowedAttributes: ['href', 'title']
    };

    return this.validateAndSanitize(content, options);
  }

  // Valider une URL
  static validateUrl(url: string): ValidationResult {
    const options: SanitizationOptions = {
      allowHtml: false,
      maxLength: 2048,
      stripHtml: true
    };

    const result = this.validateAndSanitize(url, options);

    try {
      new URL(result.sanitizedValue);
    } catch {
      result.errors.push('URL invalide');
      result.isValid = false;
    }

    // Vérifier les protocoles autorisés
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    try {
      const urlObj = new URL(result.sanitizedValue);
      if (!allowedProtocols.includes(urlObj.protocol)) {
        result.errors.push('Protocole non autorisé');
        result.isValid = false;
      }
    } catch {
      // URL invalide déjà détectée
    }

    return result;
  }

  // Détecter les tentatives d'injection SQL
  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /'/gi,
      /;/gi,
      /--/gi,
      /\s+union\s+/gi,
      /\s+or\s+.*?=.*?/gi,
      /\s+and\s+.*?=.*?/gi,
      /\s+select\s+/gi,
      /\s+insert\s+/gi,
      /\s+update\s+/gi,
      /\s+delete\s+/gi,
      /\s+drop\s+/gi,
      /\s+create\s+/gi,
      /\s+alter\s+/gi,
      /\s+exec\s+/gi,
      /\s+execute\s+/gi,
      /\s+script\s+/gi,
      /\s+eval\s+/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Nettoyer les logs pour éviter les injections
  static sanitizeLogMessage(message: string): string {
    return this.escapeHtml(message)
      .replace(/[\r\n\t]/g, ' ')
      .substring(0, 1000);
  }
}

// Fonction utilitaire pour l'export
export const xssProtection = XSSProtectionService;
