import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useValidation, UseValidationOptions } from '@/hooks/useValidation';
import { ValidationService } from '@/services/validationService';
import { CheckCircle, AlertTriangle, XCircle, Info, Shield, Eye, EyeOff } from 'lucide-react';

// Interface pour les props du composant
export interface ValidatedFormProps {
  schema?: any;
  schemaName?: keyof typeof ValidationService.SCHEMAS;
  initialValues?: { [key: string]: any };
  onSubmit?: (values: { [key: string]: any }, isValid: boolean) => void;
  onValidationChange?: (isValid: boolean, errors: { [key: string]: string[] }) => void;
  showValidationDetails?: boolean;
  showSecurityStatus?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ValidatedForm: React.FC<ValidatedFormProps> = ({
  schema,
  schemaName,
  initialValues = {},
  onSubmit,
  onValidationChange,
  showValidationDetails = false,
  showSecurityStatus = true,
  className = '',
  children
}) => {
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  const options: UseValidationOptions = {
    schema,
    schemaName,
    validateOnChange: true,
    validateOnBlur: true,
    debounceMs: 300
  };

  const {
    values,
    errors,
    warnings,
    isValid,
    isDirty,
    setValue,
    setValues,
    validateAll,
    reset,
    getFieldError,
    getFieldWarning,
    hasFieldError,
    hasFieldWarning,
    isFieldValid
  } = useValidation(initialValues, options);

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    const validationResult = validateAll();
    
    if (onSubmit) {
      onSubmit(values, validationResult.isValid);
    }
  }, [values, validateAll, onSubmit]);

  // Gérer le changement de valeur
  const handleValueChange = useCallback((field: string, value: any) => {
    setValue(field, value);
    
    if (onValidationChange) {
      onValidationChange(isValid, errors);
    }
  }, [setValue, isValid, errors, onValidationChange]);

  // Basculer la visibilité du mot de passe
  const togglePasswordVisibility = useCallback((field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  // Obtenir l'icône de statut de sécurité
  const getSecurityIcon = (field: string) => {
    if (hasFieldError(field)) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (hasFieldWarning(field)) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else if (isFieldValid(field)) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Shield className="h-4 w-4 text-gray-500" />;
  };

  // Obtenir la couleur du badge de statut
  const getStatusBadgeColor = (field: string) => {
    if (hasFieldError(field)) {
      return 'destructive';
    } else if (hasFieldWarning(field)) {
      return 'secondary';
    } else if (isFieldValid(field)) {
      return 'default';
    }
    return 'outline';
  };

  // Obtenir le texte du badge de statut
  const getStatusBadgeText = (field: string) => {
    if (hasFieldError(field)) {
      return 'Erreur';
    } else if (hasFieldWarning(field)) {
      return 'Attention';
    } else if (isFieldValid(field)) {
      return 'Valide';
    }
    return 'En cours';
  };

  // Rendu d'un champ de formulaire
  const renderField = (field: string, type: string = 'text', label?: string) => {
    const value = values[field] || '';
    const error = getFieldError(field);
    const warning = getFieldWarning(field);
    const isPassword = type === 'password';
    const showPassword = showPasswords[field];

    return (
      <div key={field} className="space-y-2">
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {label}
            </label>
            {showSecurityStatus && (
              <div className="flex items-center gap-2">
                {getSecurityIcon(field)}
                <Badge variant={getStatusBadgeColor(field)} className="text-xs">
                  {getStatusBadgeText(field)}
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <input
            type={isPassword && !showPassword ? 'password' : 'text'}
            value={value}
            onChange={(e) => handleValueChange(field, e.target.value)}
            onBlur={() => validateAll()}
            className={`w-full px-3 py-2 border rounded-md transition-colors ${
              hasFieldError(field)
                ? 'border-red-500 focus:border-red-500'
                : hasFieldWarning(field)
                ? 'border-yellow-500 focus:border-yellow-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder={`Entrez ${label?.toLowerCase() || field}`}
          />
          
          {isPassword && (
            <button
              type="button"
              onClick={() => togglePasswordVisibility(field)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {warning && !error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {warning}
            </AlertDescription>
          </Alert>
        )}

        {showValidationDetails && (
          <div className="text-xs text-gray-600 space-y-1">
            <div>Valeur: {value}</div>
            <div>Longueur: {value.length} caractères</div>
            <div>Type: {type}</div>
            <div>Valide: {isFieldValid(field) ? 'Oui' : 'Non'}</div>
          </div>
        )}
      </div>
    );
  };

  // Obtenir les statistiques de validation
  const getValidationStats = () => {
    const totalFields = Object.keys(values).length;
    const validFields = Object.keys(values).filter(field => isFieldValid(field)).length;
    const errorFields = Object.keys(errors).filter(field => hasFieldError(field)).length;
    const warningFields = Object.keys(warnings).filter(field => hasFieldWarning(field)).length;

    return {
      totalFields,
      validFields,
      errorFields,
      warningFields,
      completionRate: totalFields > 0 ? Math.round((validFields / totalFields) * 100) : 0
    };
  };

  const stats = getValidationStats();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Formulaire Validé
        </CardTitle>
        <CardDescription>
          Validation en temps réel des entrées utilisateur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Statistiques de validation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.validFields}</div>
              <div className="text-sm text-muted-foreground">Valides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.errorFields}</div>
              <div className="text-sm text-muted-foreground">Erreurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.warningFields}</div>
              <div className="text-sm text-muted-foreground">Avertissements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Complétion</div>
            </div>
          </div>

          {/* Champs du formulaire */}
          <div className="space-y-4">
            {children || (
              <>
                {renderField('email', 'email', 'Email')}
                {renderField('username', 'text', 'Nom d\'utilisateur')}
                {renderField('password', 'password', 'Mot de passe')}
                {renderField('name', 'text', 'Nom complet')}
              </>
            )}
          </div>

          {/* Statut global */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              {isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {isValid ? 'Formulaire valide' : 'Formulaire invalide'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isValid ? 'default' : 'destructive'}>
                {isValid ? 'Prêt' : 'Erreurs'}
              </Badge>
              {isDirty && (
                <Badge variant="outline">
                  Modifié
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button type="submit" disabled={!isValid}>
              Soumettre
            </Button>
            <Button type="button" variant="outline" onClick={reset}>
              Réinitialiser
            </Button>
          </div>

          {/* Détails de validation */}
          {showValidationDetails && (
            <div className="space-y-2">
              <h3 className="font-semibold">Détails de validation:</h3>
              <div className="text-sm space-y-1">
                <div>Champs totaux: {stats.totalFields}</div>
                <div>Champs valides: {stats.validFields}</div>
                <div>Champs avec erreurs: {stats.errorFields}</div>
                <div>Champs avec avertissements: {stats.warningFields}</div>
                <div>Taux de complétion: {stats.completionRate}%</div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
