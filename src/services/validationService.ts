// ===================================================================
// SERVICE DE VALIDATION AVANCÉE DES ENTRÉES
// Validation complète et sécurisée des données utilisateur
// ===================================================================

import { XSSProtectionService } from './xssProtectionService';

// Interface pour les règles de validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  sanitize?: boolean;
  allowHtml?: boolean;
  type?: 'string' | 'number' | 'email' | 'url' | 'date' | 'boolean' | 'array' | 'object';
}

// Interface pour les résultats de validation
export interface ValidationResult {
  isValid: boolean;
  value: any;
  errors: string[];
  warnings: string[];
  sanitized: boolean;
}

// Interface pour les schémas de validation
export interface ValidationSchema {
  [key: string]: ValidationRule;
}

// Classe de validation avancée
export class ValidationService {
  // Patterns de validation courants
  private static readonly PATTERNS = {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    username: /^[a-zA-Z0-9_-]{3,50}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    ipv6: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    base64: /^[A-Za-z0-9+/]*={0,2}$/,
    hex: /^[0-9a-fA-F]+$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    alphabetic: /^[a-zA-Z]+$/,
    numeric: /^[0-9]+$/,
    slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    color: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
    time: /^\d{2}:\d{2}(:\d{2})?$/
  };

  // Schémas de validation prédéfinis
  private static readonly SCHEMAS = {
    user: {
      email: {
        required: true,
        type: 'email' as const,
        pattern: this.PATTERNS.email,
        maxLength: 254,
        sanitize: true
      },
      username: {
        required: true,
        type: 'string' as const,
        pattern: this.PATTERNS.username,
        minLength: 3,
        maxLength: 50,
        sanitize: true
      },
      password: {
        required: true,
        type: 'string' as const,
        pattern: this.PATTERNS.password,
        minLength: 8,
        maxLength: 128,
        sanitize: false
      },
      name: {
        required: true,
        type: 'string' as const,
        minLength: 2,
        maxLength: 100,
        sanitize: true
      },
      role: {
        required: true,
        type: 'string' as const,
        custom: (value: string) => ['user', 'admin', 'superadmin'].includes(value)
      }
    },
    database: {
      host: {
        required: true,
        type: 'string' as const,
        pattern: this.PATTERNS.ipv4,
        maxLength: 255,
        sanitize: true
      },
      port: {
        required: true,
        type: 'number' as const,
        custom: (value: number) => value >= 1 && value <= 65535
      },
      database_name: {
        required: true,
        type: 'string' as const,
        pattern: this.PATTERNS.alphanumeric,
        minLength: 1,
        maxLength: 64,
        sanitize: true
      },
      username: {
        required: true,
        type: 'string' as const,
        minLength: 1,
        maxLength: 64,
        sanitize: true
      },
      password: {
        required: true,
        type: 'string' as const,
        minLength: 1,
        maxLength: 255,
        sanitize: false
      }
    },
    chatbot: {
      api_key: {
        required: false,
        type: 'string' as const,
        maxLength: 255,
        sanitize: false
      },
      welcome_message: {
        required: true,
        type: 'string' as const,
        maxLength: 500,
        sanitize: true,
        allowHtml: false
      },
      max_messages: {
        required: true,
        type: 'number' as const,
        custom: (value: number) => value >= 1 && value <= 1000
      },
      response_delay: {
        required: true,
        type: 'number' as const,
        custom: (value: number) => value >= 0 && value <= 10000
      }
    }
  };

  // Valider une valeur selon une règle
  static validateValue(value: any, rule: ValidationRule): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      value,
      errors: [],
      warnings: [],
      sanitized: false
    };

    try {
      // Vérifier si la valeur est requise
      if (rule.required && (value === null || value === undefined || value === '')) {
        result.errors.push('Ce champ est obligatoire');
        result.isValid = false;
        return result;
      }

      // Si la valeur est vide et non requise, retourner succès
      if (!rule.required && (value === null || value === undefined || value === '')) {
        return result;
      }

      // Sanitiser la valeur si nécessaire
      if (rule.sanitize && typeof value === 'string') {
        const sanitized = XSSProtectionService.sanitizeHtml(value, {
          allowHtml: rule.allowHtml || false,
          stripHtml: !rule.allowHtml
        });
        result.value = sanitized;
        result.sanitized = sanitized !== value;
      }

      // Vérifier le type
      if (rule.type) {
        const typeCheck = this.validateType(result.value, rule.type);
        if (!typeCheck.isValid) {
          result.errors.push(...typeCheck.errors);
          result.isValid = false;
        }
      }

      // Vérifier la longueur pour les chaînes
      if (typeof result.value === 'string') {
        if (rule.minLength && result.value.length < rule.minLength) {
          result.errors.push(`Minimum ${rule.minLength} caractères requis`);
          result.isValid = false;
        }
        if (rule.maxLength && result.value.length > rule.maxLength) {
          result.errors.push(`Maximum ${rule.maxLength} caractères autorisés`);
          result.isValid = false;
        }
      }

      // Vérifier le pattern
      if (rule.pattern && typeof result.value === 'string') {
        if (!rule.pattern.test(result.value)) {
          result.errors.push('Format invalide');
          result.isValid = false;
        }
      }

      // Validation personnalisée
      if (rule.custom) {
        const customResult = rule.custom(result.value);
        if (customResult !== true) {
          result.errors.push(typeof customResult === 'string' ? customResult : 'Validation personnalisée échouée');
          result.isValid = false;
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de la validation:', error);
      result.errors.push('Erreur de validation');
      result.isValid = false;
      return result;
    }
  }

  // Valider un objet selon un schéma
  static validateObject(data: any, schema: ValidationSchema): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      value: {},
      errors: [],
      warnings: [],
      sanitized: false
    };

    try {
      const validatedData: any = {};

      // Valider chaque champ du schéma
      for (const [field, rule] of Object.entries(schema)) {
        const fieldResult = this.validateValue(data[field], rule);
        
        if (!fieldResult.isValid) {
          result.errors.push(`${field}: ${fieldResult.errors.join(', ')}`);
          result.isValid = false;
        }

        if (fieldResult.warnings.length > 0) {
          result.warnings.push(`${field}: ${fieldResult.warnings.join(', ')}`);
        }

        if (fieldResult.sanitized) {
          result.sanitized = true;
        }

        validatedData[field] = fieldResult.value;
      }

      result.value = validatedData;
      return result;
    } catch (error) {
      console.error('Erreur lors de la validation de l\'objet:', error);
      result.errors.push('Erreur de validation de l\'objet');
      result.isValid = false;
      return result;
    }
  }

  // Valider le type d'une valeur
  private static validateType(value: any, type: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      value,
      errors: [],
      warnings: [],
      sanitized: false
    };

    switch (type) {
      case 'string':
        if (typeof value !== 'string') {
          result.errors.push('Doit être une chaîne de caractères');
          result.isValid = false;
        }
        break;

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          result.errors.push('Doit être un nombre');
          result.isValid = false;
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !this.PATTERNS.email.test(value)) {
          result.errors.push('Format d\'email invalide');
          result.isValid = false;
        }
        break;

      case 'url':
        if (typeof value !== 'string' || !this.PATTERNS.url.test(value)) {
          result.errors.push('Format d\'URL invalide');
          result.isValid = false;
        }
        break;

      case 'date':
        if (typeof value !== 'string' || !this.PATTERNS.date.test(value)) {
          result.errors.push('Format de date invalide (YYYY-MM-DD)');
          result.isValid = false;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          result.errors.push('Doit être un booléen');
          result.isValid = false;
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          result.errors.push('Doit être un tableau');
          result.isValid = false;
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          result.errors.push('Doit être un objet');
          result.isValid = false;
        }
        break;
    }

    return result;
  }

  // Obtenir un schéma prédéfini
  static getSchema(schemaName: keyof typeof ValidationService.SCHEMAS): ValidationSchema {
    return this.SCHEMAS[schemaName];
  }

  // Valider avec un schéma prédéfini
  static validateWithSchema(data: any, schemaName: keyof typeof ValidationService.SCHEMAS): ValidationResult {
    const schema = this.getSchema(schemaName);
    return this.validateObject(data, schema);
  }

  // Valider un email
  static validateEmail(email: string): ValidationResult {
    return this.validateValue(email, {
      required: true,
      type: 'email',
      pattern: this.PATTERNS.email,
      maxLength: 254,
      sanitize: true
    });
  }

  // Valider un mot de passe
  static validatePassword(password: string): ValidationResult {
    return this.validateValue(password, {
      required: true,
      type: 'string',
      pattern: this.PATTERNS.password,
      minLength: 8,
      maxLength: 128,
      sanitize: false
    });
  }

  // Valider un nom d'utilisateur
  static validateUsername(username: string): ValidationResult {
    return this.validateValue(username, {
      required: true,
      type: 'string',
      pattern: this.PATTERNS.username,
      minLength: 3,
      maxLength: 50,
      sanitize: true
    });
  }

  // Valider une URL
  static validateUrl(url: string): ValidationResult {
    return this.validateValue(url, {
      required: true,
      type: 'url',
      pattern: this.PATTERNS.url,
      maxLength: 2048,
      sanitize: true
    });
  }

  // Valider un numéro de téléphone
  static validatePhone(phone: string): ValidationResult {
    return this.validateValue(phone, {
      required: true,
      type: 'string',
      pattern: this.PATTERNS.phone,
      minLength: 10,
      maxLength: 15,
      sanitize: true
    });
  }

  // Valider un UUID
  static validateUuid(uuid: string): ValidationResult {
    return this.validateValue(uuid, {
      required: true,
      type: 'string',
      pattern: this.PATTERNS.uuid,
      sanitize: true
    });
  }

  // Valider une adresse IP
  static validateIp(ip: string): ValidationResult {
    const ipv4Result = this.validateValue(ip, {
      required: true,
      type: 'string',
      pattern: this.PATTERNS.ipv4,
      sanitize: true
    });

    if (ipv4Result.isValid) {
      return ipv4Result;
    }

    return this.validateValue(ip, {
      required: true,
      type: 'string',
      pattern: this.PATTERNS.ipv6,
      sanitize: true
    });
  }

  // Valider un slug
  static validateSlug(slug: string): ValidationResult {
    return this.validateValue(slug, {
      required: true,
      type: 'string',
      pattern: this.PATTERNS.slug,
      minLength: 1,
      maxLength: 100,
      sanitize: true
    });
  }

  // Valider une couleur hexadécimale
  static validateColor(color: string): ValidationResult {
    return this.validateValue(color, {
      required: true,
      type: 'string',
      pattern: this.PATTERNS.color,
      sanitize: true
    });
  }

  // Valider une date
  static validateDate(date: string): ValidationResult {
    return this.validateValue(date, {
      required: true,
      type: 'date',
      pattern: this.PATTERNS.date,
      sanitize: true
    });
  }

  // Valider un nombre dans une plage
  static validateNumberRange(value: number, min: number, max: number): ValidationResult {
    return this.validateValue(value, {
      required: true,
      type: 'number',
      custom: (val: number) => val >= min && val <= max
    });
  }

  // Valider un tableau avec des éléments d'un type spécifique
  static validateArray<T>(array: T[], itemValidator: (item: T) => ValidationResult): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      value: array,
      errors: [],
      warnings: [],
      sanitized: false
    };

    if (!Array.isArray(array)) {
      result.errors.push('Doit être un tableau');
      result.isValid = false;
      return result;
    }

    for (let i = 0; i < array.length; i++) {
      const itemResult = itemValidator(array[i]);
      if (!itemResult.isValid) {
        result.errors.push(`Élément ${i}: ${itemResult.errors.join(', ')}`);
        result.isValid = false;
      }
    }

    return result;
  }

  // Obtenir les statistiques de validation
  static getValidationStats(): {
    totalSchemas: number;
    totalPatterns: number;
    supportedTypes: string[];
    availableSchemas: string[];
  } {
    return {
      totalSchemas: Object.keys(this.SCHEMAS).length,
      totalPatterns: Object.keys(this.PATTERNS).length,
      supportedTypes: ['string', 'number', 'email', 'url', 'date', 'boolean', 'array', 'object'],
      availableSchemas: Object.keys(this.SCHEMAS)
    };
  }
}

// Fonction utilitaire pour l'export
export const validationService = ValidationService;
