import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useFormOptimization } from '@/hooks/usePerformance';
import { ValidatedForm } from './ValidatedForm';
import { cn } from '@/lib/utils';

interface OptimizedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (data: FormData) => void | Promise<void>;
  initialData?: Record<string, any>;
  validationSchema?: any;
  autoSave?: boolean;
  autoSaveDelay?: number;
  debounceDelay?: number;
  loading?: boolean;
  children: React.ReactNode;
}

export const OptimizedForm: React.FC<OptimizedFormProps> = ({
  onSubmit,
  initialData = {},
  validationSchema,
  autoSave = false,
  autoSaveDelay = 5000,
  debounceDelay = 300,
  loading = false,
  children,
  className,
  ...props
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    debouncedValues,
    validationCache,
    debounceValue,
    cacheValidation,
    getCachedValidation,
    clearFormCache
  } = useFormOptimization();

  // Mettre à jour les données du formulaire
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Debounce pour l'auto-save
    if (autoSave) {
      debounceValue(field, value, debounceDelay);
    }
  }, [autoSave, debounceDelay, debounceValue]);

  // Validation en temps réel
  const validateField = useCallback((field: string, value: any) => {
    if (!validationSchema) return true;
    
    // Vérifier le cache de validation
    const cacheKey = `${field}:${JSON.stringify(value)}`;
    const cachedValidation = getCachedValidation(cacheKey);
    
    if (cachedValidation !== undefined) {
      return cachedValidation;
    }
    
    try {
      const isValid = validationSchema.safeParse({ [field]: value }).success;
      cacheValidation(cacheKey, isValid);
      return isValid;
    } catch (error) {
      console.error('Erreur de validation:', error);
      return false;
    }
  }, [validationSchema, getCachedValidation, cacheValidation]);

  // Auto-save
  useEffect(() => {
    if (!autoSave || Object.keys(debouncedValues).length === 0) return;

    autoSaveTimeoutRef.current = setTimeout(() => {
      const dataToSave = { ...formData, ...debouncedValues };
      console.log('Auto-save:', dataToSave);
      setLastSaved(new Date());
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [debouncedValues, autoSave, autoSaveDelay, formData]);

  // Soumission du formulaire
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Validation complète
      if (validationSchema) {
        const validationResult = validationSchema.safeParse(formData);
        if (!validationResult.success) {
          const fieldErrors: Record<string, string> = {};
          validationResult.error.errors.forEach((error: any) => {
            fieldErrors[error.path[0]] = error.message;
          });
          setErrors(fieldErrors);
          return;
        }
      }
      
      // Soumission
      await onSubmit(formData);
      
      // Nettoyer le cache après soumission réussie
      clearFormCache();
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      setErrors({ submit: 'Une erreur est survenue lors de la soumission' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationSchema, onSubmit, isSubmitting, clearFormCache]);

  // Nettoyage à la fermeture
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn("space-y-4", className)}
      {...props}
    >
      {children}
      
      {/* Indicateur d'auto-save */}
      {autoSave && lastSaved && (
        <div className="text-xs text-muted-foreground">
          Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
        </div>
      )}
      
      {/* Erreur de soumission */}
      {errors.submit && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {errors.submit}
        </div>
      )}
      
      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isSubmitting || loading}
        className={cn(
          "w-full px-4 py-2 rounded-md font-medium transition-colors",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer'}
      </button>
    </form>
  );
};

// Composant pour les champs optimisés
interface OptimizedFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value?: any;
  onChange?: (value: any) => void;
  error?: string;
  className?: string;
  autoComplete?: string;
}

export const OptimizedField: React.FC<OptimizedFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  value,
  onChange,
  error,
  className,
  autoComplete,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = event.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-colors duration-200",
            error && "border-red-500 focus:ring-red-500",
            isFocused && "ring-2 ring-ring"
          )}
          {...props}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-colors duration-200",
            error && "border-red-500 focus:ring-red-500",
            isFocused && "ring-2 ring-ring"
          )}
          {...props}
        >
          {props.children}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={localValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            "w-full px-3 py-2 border border-input rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-colors duration-200",
            error && "border-red-500 focus:ring-red-500",
            isFocused && "ring-2 ring-ring"
          )}
          {...props}
        />
      )}
      
      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
};

// Hook pour l'optimisation des formulaires
export const useOptimizedForm = (initialData: Record<string, any> = {}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);
  
  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);
  
  return {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    setFieldError,
    clearErrors,
    resetForm
  };
};
