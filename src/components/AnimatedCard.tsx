
import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  duration?: number;
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  glass?: boolean;
  neon?: boolean;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  hover = true,
  glow = false,
  gradient = false,
  glass = false,
  neon = false,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  // Animations d'entrée
  const getInitialAnimation = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 50 };
      case 'down':
        return { opacity: 0, y: -50 };
      case 'left':
        return { opacity: 0, x: 50 };
      case 'right':
        return { opacity: 0, x: -50 };
      case 'fade':
        return { opacity: 0 };
      case 'scale':
        return { opacity: 0, scale: 0.8 };
      default:
        return { opacity: 0, y: 50 };
    }
  };

  // Animation d'entrée
  useEffect(() => {
    if (isInView) {
      controls.start({
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      });
    }
  }, [isInView, controls, delay, duration]);

  // Classes CSS dynamiques
  const getCardClasses = () => {
    const baseClasses = 'relative overflow-hidden transition-all duration-300';
    const styleClasses = [];

    if (glass) {
      styleClasses.push('glass-effect');
    } else if (gradient) {
      styleClasses.push('gradient-primary');
    } else if (neon) {
      styleClasses.push('neon-effect');
    } else {
      styleClasses.push('card-modern');
    }

    if (hover) {
      styleClasses.push('hover-lift');
    }

    if (glow && isHovered) {
      styleClasses.push('hover-glow');
    }

    return cn(baseClasses, ...styleClasses, className);
  };

  return (
    <motion.div
      ref={ref}
      initial={getInitialAnimation()}
      animate={controls}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={{ scale: 0.98 }}
      className={getCardClasses()}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {/* Effet de brillance au hover */}
      {hover && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Effet de particules */}
      {neon && (
        <div className="particles-container absolute inset-0 pointer-events-none" />
      )}
    </motion.div>
  );
};

// Composant pour les cartes avec icône
interface AnimatedIconCardProps extends AnimatedCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  iconColor?: string;
  iconBg?: string;
}

export const AnimatedIconCard: React.FC<AnimatedIconCardProps> = ({
  icon,
  title,
  description,
  iconColor = 'text-primary-500',
  iconBg = 'bg-primary-100',
  className,
  ...props
}) => {
  return (
    <AnimatedCard className={cn('p-6', className)} {...props}>
      <div className="flex items-start space-x-4">
        <div className={cn(
          'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center',
          iconBg
        )}>
          <div className={cn('w-6 h-6', iconColor)}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      </div>
    </AnimatedCard>
  );
};

// Composant pour les cartes de statistiques
interface AnimatedStatCardProps extends AnimatedCardProps {
  value: string | number;
  label: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error';
}

export const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
  value,
  label,
  change,
  icon,
  color = 'primary',
  className,
  ...props
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          bg: 'bg-success-50',
          text: 'text-success-600',
          icon: 'text-success-500',
          change: change?.type === 'increase' ? 'text-success-600' : 'text-error-600'
        };
      case 'warning':
        return {
          bg: 'bg-warning-50',
          text: 'text-warning-600',
          icon: 'text-warning-500',
          change: change?.type === 'increase' ? 'text-success-600' : 'text-error-600'
        };
      case 'error':
        return {
          bg: 'bg-error-50',
          text: 'text-error-600',
          icon: 'text-error-500',
          change: change?.type === 'increase' ? 'text-success-600' : 'text-error-600'
        };
      default:
        return {
          bg: 'bg-primary-50',
          text: 'text-primary-600',
          icon: 'text-primary-500',
          change: change?.type === 'increase' ? 'text-success-600' : 'text-error-600'
        };
    }
  };

  const colors = getColorClasses();

  return (
    <AnimatedCard className={cn('p-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {label}
          </p>
          <p className={cn('text-2xl font-bold', colors.text)}>
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={cn('text-sm font-medium', colors.change)}>
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">
                vs mois dernier
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
            <div className={cn('w-6 h-6', colors.icon)}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
};

// Composant pour les cartes de fonctionnalités
interface AnimatedFeatureCardProps extends AnimatedCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
  buttonText?: string;
  onButtonClick?: () => void;
}

export const AnimatedFeatureCard: React.FC<AnimatedFeatureCardProps> = ({
  title,
  description,
  icon,
  features = [],
  buttonText,
  onButtonClick,
  className,
  ...props
}) => {
  return (
    <AnimatedCard className={cn('p-8 text-center', className)} {...props}>
      <div className="mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 text-primary-600">
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600">
          {description}
        </p>
      </div>

      {features.length > 0 && (
        <ul className="mb-6 space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-gray-600">
              <div className="w-4 h-4 mr-2 text-success-500">✓</div>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {buttonText && onButtonClick && (
        <button
          onClick={onButtonClick}
          className="btn-modern btn-primary px-6 py-3 rounded-lg font-medium"
        >
          {buttonText}
        </button>
      )}
    </AnimatedCard>
  );
};
