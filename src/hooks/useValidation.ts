import { useState, useCallback, useMemo } from 'react';
import { ValidationService, ValidationResult, ValidationSchema } from '@/services/validationService';

// Interface pour les options du hook
export interface UseValidationOptions {
  schema?: ValidationSchema;
  schemaName?: keyof typeof ValidationService.SCHEMAS;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

// Interface pour le retour du hook
export interface UseValidationReturn {
  values: { [key: string]: any };
  errors: { [key: string]: string[] };
  warnings: { [key: string]: string[] };
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: string, value: any) => void;
  setValues: (values: { [key: string]: any }) => void;
  validateField: (field: string) => ValidationResult;
  validateAll: () => ValidationResult;
  reset: () => void;
  getFieldError: (field: string) => string | null;
  getFieldWarning: (field: string) => string | null;
  hasFieldError: (field: string) => boolean;
  hasFieldWarning: (field: string) => boolean;
  isFieldValid: (field: string) => boolean;
}

// Hook pour la validation des formulaires
export const useValidation = (
  initialValues: { [key: string]: any } = {},
  options: UseValidationOptions = {}
): UseValidationReturn => {
  const {
    schema,
    schemaName,
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300
  } = options;

  const [values, setValuesState] = useState<{ [key: string]: any }>(initialValues);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [warnings, setWarnings] = useState<{ [key: string]: string[] }>({});
  const [isDirty, setIsDirty] = useState(false);

  // Obtenir le schéma de validation
  const validationSchema = useMemo(() => {
    if (schema) return schema;
    if (schemaName) return ValidationService.getSchema(schemaName);
    return {};
  }, [schema, schemaName]);

  // Valider un champ spécifique
  const validateField = useCallback((field: string): ValidationResult => {
    const rule = validationSchema[field];
    if (!rule) {
      return {
        isValid: true,
        value: values[field],
        errors: [],
        warnings: [],
        sanitized: false
      };
    }

    const result = ValidationService.validateValue(values[field], rule);
    
    setErrors(prev => ({
      ...prev,
      [field]: result.errors
    }));

    setWarnings(prev => ({
      ...prev,
      [field]: result.warnings
    }));

    return result;
  }, [values, validationSchema]);

  // Valider tous les champs
  const validateAll = useCallback((): ValidationResult => {
    const result = ValidationService.validateObject(values, validationSchema);
    
    const newErrors: { [key: string]: string[] } = {};
    const newWarnings: { [key: string]: string[] } = {};

    // Extraire les erreurs par champ
    result.errors.forEach(error => {
      const [field, ...errorParts] = error.split(': ');
      if (field && errorParts.length > 0) {
        if (!newErrors[field]) newErrors[field] = [];
        newErrors[field].push(errorParts.join(': '));
      }
    });

    // Extraire les avertissements par champ
    result.warnings.forEach(warning => {
      const [field, ...warningParts] = warning.split(': ');
      if (field && warningParts.length > 0) {
        if (!newWarnings[field]) newWarnings[field] = [];
        newWarnings[field].push(warningParts.join(': '));
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);

    return result;
  }, [values, validationSchema]);

  // Définir la valeur d'un champ
  const setValue = useCallback((field: string, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);

    if (validateOnChange) {
      // Debounce la validation
      setTimeout(() => {
        validateField(field);
      }, debounceMs);
    }
  }, [validateOnChange, debounceMs, validateField]);

  // Définir plusieurs valeurs
  const setValues = useCallback((newValues: { [key: string]: any }) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues
    }));
    setIsDirty(true);

    if (validateOnChange) {
      // Valider tous les champs modifiés
      setTimeout(() => {
        Object.keys(newValues).forEach(field => {
          validateField(field);
        });
      }, debounceMs);
    }
  }, [validateOnChange, debounceMs, validateField]);

  // Réinitialiser le formulaire
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setWarnings({});
    setIsDirty(false);
  }, [initialValues]);

  // Obtenir l'erreur d'un champ
  const getFieldError = useCallback((field: string): string | null => {
    const fieldErrors = errors[field];
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
  }, [errors]);

  // Obtenir l'avertissement d'un champ
  const getFieldWarning = useCallback((field: string): string | null => {
    const fieldWarnings = warnings[field];
    return fieldWarnings && fieldWarnings.length > 0 ? fieldWarnings[0] : null;
  }, [warnings]);

  // Vérifier si un champ a une erreur
  const hasFieldError = useCallback((field: string): boolean => {
    return errors[field] && errors[field].length > 0;
  }, [errors]);

  // Vérifier si un champ a un avertissement
  const hasFieldWarning = useCallback((field: string): boolean => {
    return warnings[field] && warnings[field].length > 0;
  }, [warnings]);

  // Vérifier si un champ est valide
  const isFieldValid = useCallback((field: string): boolean => {
    return !hasFieldError(field);
  }, [hasFieldError]);

  // Calculer si le formulaire est valide
  const isValid = useMemo(() => {
    return Object.keys(validationSchema).every(field => isFieldValid(field));
  }, [validationSchema, isFieldValid]);

  return {
    values,
    errors,
    warnings,
    isValid,
    isDirty,
    setValue,
    setValues,
    validateField,
    validateAll,
    reset,
    getFieldError,
    getFieldWarning,
    hasFieldError,
    hasFieldWarning,
    isFieldValid
  };
};

// Hook spécialisé pour la validation d'email
export const useEmailValidation = (initialEmail: string = '') => {
  const [email, setEmail] = useState(initialEmail);
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    value: email,
    errors: [],
    warnings: [],
    sanitized: false
  });

  const validateEmail = useCallback((emailValue: string) => {
    const validationResult = ValidationService.validateEmail(emailValue);
    setResult(validationResult);
    return validationResult;
  }, []);

  const handleEmailChange = useCallback((newEmail: string) => {
    setEmail(newEmail);
    validateEmail(newEmail);
  }, [validateEmail]);

  return {
    email,
    setEmail: handleEmailChange,
    result,
    isValid: result.isValid,
    error: result.errors[0] || null,
    warning: result.warnings[0] || null,
    validate: validateEmail
  };
};

// Hook spécialisé pour la validation de mot de passe
export const usePasswordValidation = (initialPassword: string = '') => {
  const [password, setPassword] = useState(initialPassword);
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    value: password,
    errors: [],
    warnings: [],
    sanitized: false
  });

  const validatePassword = useCallback((passwordValue: string) => {
    const validationResult = ValidationService.validatePassword(passwordValue);
    setResult(validationResult);
    return validationResult;
  }, []);

  const handlePasswordChange = useCallback((newPassword: string) => {
    setPassword(newPassword);
    validatePassword(newPassword);
  }, [validatePassword]);

  return {
    password,
    setPassword: handlePasswordChange,
    result,
    isValid: result.isValid,
    error: result.errors[0] || null,
    warning: result.warnings[0] || null,
    validate: validatePassword
  };
};

// Hook spécialisé pour la validation d'URL
export const useUrlValidation = (initialUrl: string = '') => {
  const [url, setUrl] = useState(initialUrl);
  const [result, setResult] = useState<ValidationResult>({
    isValid: true,
    value: url,
    errors: [],
    warnings: [],
    sanitized: false
  });

  const validateUrl = useCallback((urlValue: string) => {
    const validationResult = ValidationService.validateUrl(urlValue);
    setResult(validationResult);
    return validationResult;
  }, []);

  const handleUrlChange = useCallback((newUrl: string) => {
    setUrl(newUrl);
    validateUrl(newUrl);
  }, [validateUrl]);

  return {
    url,
    setUrl: handleUrlChange,
    result,
    isValid: result.isValid,
    error: result.errors[0] || null,
    warning: result.warnings[0] || null,
    validate: validateUrl
  };
};
