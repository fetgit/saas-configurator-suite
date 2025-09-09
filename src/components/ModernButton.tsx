import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  gradient?: boolean;
  glow?: boolean;
  glass?: boolean;
  neon?: boolean;
  morphing?: boolean;
  children: React.ReactNode;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
  glow = false,
  glass = false,
  neon = false,
  morphing = false,
  children,
  className,
  disabled,
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Classes de base
  const getBaseClasses = () => {
    return cn(
      'relative inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      fullWidth && 'w-full'
    );
  };

  // Classes de taille
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm rounded-md';
      case 'md':
        return 'px-4 py-2 text-sm rounded-lg';
      case 'lg':
        return 'px-6 py-3 text-base rounded-lg';
      case 'xl':
        return 'px-8 py-4 text-lg rounded-xl';
      default:
        return 'px-4 py-2 text-sm rounded-lg';
    }
  };

  // Classes de variante
  const getVariantClasses = () => {
    const baseClasses = 'border';
    
    switch (variant) {
      case 'primary':
        return cn(
          baseClasses,
          gradient ? 'gradient-primary text-white border-transparent' : 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600',
          glow && 'hover-glow'
        );
      case 'secondary':
        return cn(
          baseClasses,
          'bg-secondary-100 text-secondary-700 border-secondary-200 hover:bg-secondary-200'
        );
      case 'outline':
        return cn(
          baseClasses,
          'bg-transparent text-primary-600 border-primary-500 hover:bg-primary-50'
        );
      case 'ghost':
        return cn(
          'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent'
        );
      case 'destructive':
        return cn(
          baseClasses,
          'bg-red-500 text-white border-red-500 hover:bg-red-600'
        );
      case 'success':
        return cn(
          baseClasses,
          'bg-green-500 text-white border-green-500 hover:bg-green-600'
        );
      case 'warning':
        return cn(
          baseClasses,
          'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600'
        );
      default:
        return cn(
          baseClasses,
          'bg-primary-500 text-white border-primary-500 hover:bg-primary-600'
        );
    }
  };

  // Classes d'effets spéciaux
  const getEffectClasses = () => {
    const effects = [];
    
    if (glass) {
      effects.push('glass-effect');
    }
    
    if (neon) {
      effects.push('neon-effect');
    }
    
    if (morphing) {
      effects.push('morphing-button');
    }
    
    return effects.join(' ');
  };

  // Gestionnaire de clic
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  // Rendu de l'icône
  const renderIcon = () => {
    if (loading) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4"
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      );
    }
    
    if (icon) {
      return <div className="w-4 h-4">{icon}</div>;
    }
    
    return null;
  };

  // Rendu du contenu
  const renderContent = () => {
    const iconElement = renderIcon();
    
    if (!iconElement) {
      return children;
    }
    
    if (iconPosition === 'left') {
      return (
        <>
          {iconElement}
          <span className={icon ? 'ml-2' : ''}>{children}</span>
        </>
      );
    }
    
    return (
      <>
        <span className={icon ? 'mr-2' : ''}>{children}</span>
        {iconElement}
      </>
    );
  };

  return (
    <motion.button
      className={cn(
        getBaseClasses(),
        getSizeClasses(),
        getVariantClasses(),
        getEffectClasses(),
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {/* Effet de brillance */}
      <AnimatePresence>
        {isHovered && !disabled && !loading && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Effet de pression */}
      <AnimatePresence>
        {isPressed && !disabled && !loading && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white/10 rounded-inherit"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </AnimatePresence>

      {/* Contenu */}
      <span className="relative z-10 flex items-center">
        {renderContent()}
      </span>

      {/* Effet de particules pour neon */}
      {neon && isHovered && (
        <div className="particles-container absolute inset-0 pointer-events-none" />
      )}
    </motion.button>
  );
};

// Composant de bouton avec menu déroulant
interface ModernDropdownButtonProps extends Omit<ModernButtonProps, 'onClick'> {
  items: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
  }>;
  trigger?: React.ReactNode;
}

export const ModernDropdownButton: React.FC<ModernDropdownButtonProps> = ({
  items,
  trigger,
  children,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <ModernButton
        {...props}
        onClick={() => setIsOpen(!isOpen)}
        icon={<ChevronDown className="w-4 h-4" />}
        iconPosition="right"
      >
        {children}
      </ModernButton>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
            >
              {items.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg',
                    item.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                >
                  {item.icon && <div className="w-4 h-4 mr-3">{item.icon}</div>}
                  {item.label}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Composant de bouton de groupe
interface ModernButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export const ModernButtonGroup: React.FC<ModernButtonGroupProps> = ({
  children,
  orientation = 'horizontal',
  spacing = 'md'
}) => {
  const getSpacingClasses = () => {
    switch (spacing) {
      case 'sm':
        return orientation === 'horizontal' ? 'space-x-1' : 'space-y-1';
      case 'md':
        return orientation === 'horizontal' ? 'space-x-2' : 'space-y-2';
      case 'lg':
        return orientation === 'horizontal' ? 'space-x-4' : 'space-y-4';
      default:
        return orientation === 'horizontal' ? 'space-x-2' : 'space-y-2';
    }
  };

  return (
    <div className={cn(
      'inline-flex',
      orientation === 'vertical' && 'flex-col',
      getSpacingClasses()
    )}>
      {children}
    </div>
  );
};
