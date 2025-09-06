import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { XSSProtectionService, ValidationResult } from '@/services/xssProtectionService';
import { AlertTriangle, CheckCircle, Shield, Eye, EyeOff } from 'lucide-react';

// Interface pour les props du composant
export interface SecureInputProps {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'textarea';
  value: string;
  onChange: (value: string, isValid: boolean, validation: ValidationResult) => void;
  onBlur?: (value: string, validation: ValidationResult) => void;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  allowHtml?: boolean;
  validationType?: 'username' | 'email' | 'url' | 'message' | 'general';
  showSecurityStatus?: boolean;
  showValidationDetails?: boolean;
  className?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  id,
  name,
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  maxLength,
  allowHtml = false,
  validationType = 'general',
  showSecurityStatus = true,
  showValidationDetails = false,
  className = ''
}) => {
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    sanitizedValue: value,
    originalValue: value,
    errors: [],
    warnings: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Valider l'entrée selon le type
  const validateInput = (inputValue: string): ValidationResult => {
    switch (validationType) {
      case 'username':
        return XSSProtectionService.validateUsername(inputValue);
      case 'email':
        return XSSProtectionService.validateEmail(inputValue);
      case 'url':
        return XSSProtectionService.validateUrl(inputValue);
      case 'message':
        return XSSProtectionService.validateMessageContent(inputValue);
      default:
        return XSSProtectionService.validateAndSanitize(inputValue, {
          allowHtml,
          maxLength,
          stripHtml: !allowHtml
        });
    }
  };

  // Gérer les changements d'entrée
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = event.target.value;
    const validationResult = validateInput(inputValue);
    
    setValidation(validationResult);
    onChange(inputValue, validationResult.isValid, validationResult);
  };

  // Gérer la perte de focus
  const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(event.target.value, validation);
    }
  };

  // Gérer le focus
  const handleFocus = () => {
    setIsFocused(true);
  };

  // Mettre à jour la validation quand la valeur change
  useEffect(() => {
    const validationResult = validateInput(value);
    setValidation(validationResult);
  }, [value, validationType, allowHtml, maxLength]);

  // Obtenir le type d'input pour les mots de passe
  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  // Obtenir l'icône de statut de sécurité
  const getSecurityIcon = () => {
    if (validation.errors.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (validation.warnings.length > 0) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Shield className="h-4 w-4 text-gray-500" />;
  };

  // Obtenir la couleur du badge de statut
  const getStatusBadgeColor = () => {
    if (validation.errors.length > 0) {
      return 'destructive';
    } else if (validation.warnings.length > 0) {
      return 'secondary';
    } else if (validation.isValid) {
      return 'default';
    }
    return 'outline';
  };

  // Obtenir le texte du badge de statut
  const getStatusBadgeText = () => {
    if (validation.errors.length > 0) {
      return 'Non sécurisé';
    } else if (validation.warnings.length > 0) {
      return 'Attention';
    } else if (validation.isValid) {
      return 'Sécurisé';
    }
    return 'En cours';
  };

  // Rendu de l'input
  const renderInput = () => {
    const inputProps = {
      ref: inputRef,
      id,
      name,
      placeholder,
      value,
      onChange: handleChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      required,
      disabled,
      maxLength,
      className: `transition-all duration-200 ${
        validation.errors.length > 0 
          ? 'border-red-500 focus:border-red-500' 
          : validation.warnings.length > 0
          ? 'border-yellow-500 focus:border-yellow-500'
          : 'border-gray-300 focus:border-blue-500'
      } ${className}`
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...inputProps}
          rows={4}
          className={`${inputProps.className} resize-vertical`}
        />
      );
    }

    return (
      <div className="relative">
        <Input
          {...inputProps}
          type={getInputType()}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {showSecurityStatus && (
            <div className="flex items-center gap-2">
              {getSecurityIcon()}
              <Badge variant={getStatusBadgeColor()} className="text-xs">
                {getStatusBadgeText()}
              </Badge>
            </div>
          )}
        </div>
      )}

      {renderInput()}

      {/* Affichage des erreurs */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Affichage des avertissements */}
      {validation.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Détails de validation (optionnel) */}
      {showValidationDetails && isFocused && (
        <div className="text-xs text-gray-600 space-y-1">
          <div>Longueur: {value.length} caractères</div>
          {maxLength && (
            <div>Maximum: {maxLength} caractères</div>
          )}
          <div>Type: {validationType}</div>
          <div>HTML autorisé: {allowHtml ? 'Oui' : 'Non'}</div>
        </div>
      )}

      {/* Compteur de caractères */}
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};
