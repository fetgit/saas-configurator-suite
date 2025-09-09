import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useImageOptimization } from '@/hooks/usePerformance';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  placeholder?: string;
  lazy?: boolean;
  blur?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 80,
  format = 'webp',
  placeholder,
  lazy = true,
  blur = true,
  onLoad,
  onError,
  className,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const { optimizeImage, preloadImage, isImageLoaded, isImageLoading } = useImageOptimization();

  // Optimiser l'URL de l'image
  const optimizedSrc = optimizeImage(src, {
    width,
    height,
    quality,
    format
  });

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (!lazy || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // Précharger l'image
  useEffect(() => {
    if (isInView && !isImageLoaded(src)) {
      preloadImage(src).catch(() => {
        setIsError(true);
      });
    }
  }, [isInView, src, preloadImage, isImageLoaded]);

  // Gestionnaire de chargement
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  }, [onLoad]);

  // Gestionnaire d'erreur
  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
    onError?.();
  }, [onError]);

  // Rendu du placeholder
  const renderPlaceholder = () => {
    if (placeholder) {
      return (
        <img
          src={placeholder}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />
      );
    }

    if (blur) {
      return (
        <div className={cn(
          "absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse",
          isLoaded ? "opacity-0" : "opacity-100"
        )} />
      );
    }

    return null;
  };

  // Rendu de l'image
  const renderImage = () => {
    if (!isInView) {
      return null;
    }

    return (
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        loading={lazy ? "lazy" : "eager"}
        {...props}
      />
    );
  };

  // Rendu d'erreur
  const renderError = () => {
    if (!isError) return null;

    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100 text-gray-500",
        className
      )}>
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Image non disponible</div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden">
      {renderPlaceholder()}
      {renderImage()}
      {renderError()}
    </div>
  );
};

// Composant pour les images avec ratio d'aspect
interface AspectRatioImageProps extends OptimizedImageProps {
  aspectRatio?: number;
}

export const AspectRatioImage: React.FC<AspectRatioImageProps> = ({
  aspectRatio = 16 / 9,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        {...props}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};

// Composant pour les images responsives
interface ResponsiveImageProps extends OptimizedImageProps {
  sizes?: string;
  srcSet?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  srcSet,
  ...props
}) => {
  const { optimizeImage } = useImageOptimization();
  
  // Générer le srcSet si non fourni
  const generateSrcSet = (src: string) => {
    if (srcSet) return srcSet;
    
    const widths = [320, 640, 768, 1024, 1280, 1536];
    return widths
      .map(width => `${optimizeImage(src, { width })} ${width}w`)
      .join(', ');
  };

  return (
    <OptimizedImage
      {...props}
      srcSet={generateSrcSet(props.src)}
      sizes={sizes}
    />
  );
};

// Composant pour les images avec lazy loading avancé
interface LazyImageProps extends OptimizedImageProps {
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}) => {
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return (
    <OptimizedImage
      ref={imgRef}
      {...props}
      lazy={false}
      style={{
        ...props.style,
        opacity: isInView ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    />
  );
};
