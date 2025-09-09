import { useState, useEffect, useCallback, useRef } from 'react';
import { PerformanceService, PerformanceMetrics } from '@/services/performanceService';

// Interface pour les options du hook
export interface UsePerformanceOptions {
  measureRender?: boolean;
  measureMemory?: boolean;
  measureApi?: boolean;
  autoCleanup?: boolean;
  reportInterval?: number;
}

// Interface pour le retour du hook
export interface UsePerformanceReturn {
  metrics: PerformanceMetrics;
  startMeasure: (name: string) => () => void;
  measureApi: (url: string, options?: RequestInit) => Promise<Response>;
  optimizeImage: (src: string, options?: any) => string;
  debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => (...args: Parameters<T>) => void;
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number) => (...args: Parameters<T>) => void;
  clearCache: () => void;
  getCache: (key: string) => any;
  setCache: (key: string, data: any, ttl?: number) => void;
  analysis: {
    score: number;
    recommendations: string[];
    issues: string[];
  };
}

// Hook pour l'optimisation des performances
export const usePerformance = (options: UsePerformanceOptions = {}): UsePerformanceReturn => {
  const {
    measureRender = true,
    measureMemory = true,
    measureApi = true,
    autoCleanup = true,
    reportInterval = 30000 // 30 secondes
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>(PerformanceService.getMetrics());
  const [analysis, setAnalysis] = useState(PerformanceService.analyzePerformance());
  const renderStartTime = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Mettre à jour les métriques
  const updateMetrics = useCallback(() => {
    const newMetrics = PerformanceService.getMetrics();
    setMetrics(newMetrics);
    setAnalysis(PerformanceService.analyzePerformance());
  }, []);

  // Mesurer le rendu
  const startMeasure = useCallback((name: string) => {
    if (measureRender) {
      renderStartTime.current = performance.now();
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - renderStartTime.current;
        console.log(`Rendu de ${name}: ${renderTime.toFixed(2)}ms`);
      };
    }
    return () => {};
  }, [measureRender]);

  // Mesurer les requêtes API
  const measureApiCall = useCallback(async (url: string, options?: RequestInit): Promise<Response> => {
    if (measureApi) {
      return PerformanceService.optimizedFetch(url, options);
    }
    return fetch(url, options);
  }, [measureApi]);

  // Optimiser les images
  const optimizeImage = useCallback((src: string, options?: any) => {
    return PerformanceService.optimizeImage(src, options);
  }, []);

  // Debounce
  const debounce = useCallback(<T extends (...args: any[]) => any>(func: T, wait: number) => {
    return PerformanceService.debounce(func, wait);
  }, []);

  // Throttle
  const throttle = useCallback(<T extends (...args: any[]) => any>(func: T, limit: number) => {
    return PerformanceService.throttle(func, limit);
  }, []);

  // Gestion du cache
  const clearCache = useCallback(() => {
    PerformanceService.clearCache();
    updateMetrics();
  }, [updateMetrics]);

  const getCache = useCallback((key: string) => {
    return PerformanceService.getCache(key);
  }, []);

  const setCache = useCallback((key: string, data: any, ttl?: number) => {
    PerformanceService.setCache(key, data, ttl);
    updateMetrics();
  }, [updateMetrics]);

  // Effet pour la mise à jour périodique
  useEffect(() => {
    if (reportInterval > 0) {
      intervalRef.current = setInterval(() => {
        const newMetrics = PerformanceService.getMetrics();
        setMetrics(newMetrics);
        setAnalysis(PerformanceService.analyzePerformance());
      }, reportInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reportInterval]);

  // Effet pour le nettoyage automatique
  useEffect(() => {
    if (autoCleanup) {
      const cleanup = () => {
        PerformanceService.clearCache();
      };

      window.addEventListener('beforeunload', cleanup);
      return () => window.removeEventListener('beforeunload', cleanup);
    }
  }, [autoCleanup]);

  // Effet pour mesurer l'utilisation mémoire
  useEffect(() => {
    if (measureMemory) {
      const measureMemoryInterval = () => {
        const newMetrics = PerformanceService.getMetrics();
        setMetrics(newMetrics);
        setAnalysis(PerformanceService.analyzePerformance());
      };

      const interval = setInterval(measureMemoryInterval, 5000); // Toutes les 5 secondes
      return () => clearInterval(interval);
    }
  }, [measureMemory]);

  return {
    metrics,
    startMeasure,
    measureApi: measureApiCall,
    optimizeImage,
    debounce,
    throttle,
    clearCache,
    getCache,
    setCache,
    analysis
  };
};

// Hook spécialisé pour l'optimisation des images
export const useImageOptimization = () => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  const optimizeImage = useCallback((src: string, options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }) => {
    return PerformanceService.optimizeImage(src, options);
  }, []);

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      setLoadedImages(prev => {
        if (prev.has(src)) {
          resolve();
          return prev;
        }
        return prev;
      });

      setLoadingImages(prev => {
        if (prev.has(src)) {
          // Attendre que l'image soit chargée
          const checkLoaded = () => {
            setLoadedImages(current => {
              if (current.has(src)) {
                resolve();
                return current;
              }
              setTimeout(checkLoaded, 100);
              return current;
            });
          };
          checkLoaded();
          return prev;
        }

        // Commencer le chargement
        const newSet = new Set(prev).add(src);
        
        const img = new Image();
        img.onload = () => {
          setLoadedImages(current => new Set(current).add(src));
          setLoadingImages(current => {
            const newLoadingSet = new Set(current);
            newLoadingSet.delete(src);
            return newLoadingSet;
          });
          resolve();
        };
        img.onerror = () => {
          setLoadingImages(current => {
            const newLoadingSet = new Set(current);
            newLoadingSet.delete(src);
            return newLoadingSet;
          });
          reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
        
        return newSet;
      });
    });
  }, []);

  const isImageLoaded = useCallback((src: string) => {
    return loadedImages.has(src);
  }, []);

  const isImageLoading = useCallback((src: string) => {
    return loadingImages.has(src);
  }, []);

  return {
    optimizeImage,
    preloadImage,
    isImageLoaded,
    isImageLoading
  };
};

// Hook spécialisé pour l'optimisation des listes
export const useListOptimization = <T>(items: T[], options: {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) => {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const overscanCount = overscan * 2;

  const updateVisibleRange = useCallback((scrollTop: number) => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(items.length, start + visibleCount + overscanCount);
    
    setVisibleRange({ start, end });
  }, [itemHeight, visibleCount, overscanCount, items.length]);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleItems,
    offsetY,
    totalHeight,
    updateVisibleRange,
    visibleRange
  };
};

// Hook spécialisé pour l'optimisation des formulaires
export const useFormOptimization = () => {
  const [debouncedValues, setDebouncedValues] = useState<Record<string, any>>({});
  const [validationCache, setValidationCache] = useState<Record<string, boolean>>({});

  const debounceValue = useCallback((key: string, value: any, delay: number = 300) => {
    const debounced = PerformanceService.debounce((val: any) => {
      setDebouncedValues(prev => ({ ...prev, [key]: val }));
    }, delay);
    
    debounced(value);
  }, []);

  const cacheValidation = useCallback((key: string, isValid: boolean) => {
    setValidationCache(prev => ({ ...prev, [key]: isValid }));
  }, []);

  const getCachedValidation = useCallback((key: string) => {
    return validationCache[key];
  }, [validationCache]);

  const clearFormCache = useCallback(() => {
    setDebouncedValues({});
    setValidationCache({});
  }, []);

  return {
    debouncedValues,
    validationCache,
    debounceValue,
    cacheValidation,
    getCachedValidation,
    clearFormCache
  };
};

// Hook spécialisé pour l'optimisation des routes
export const useRouteOptimization = () => {
  const [preloadedRoutes, setPreloadedRoutes] = useState<Set<string>>(new Set());
  const [routeCache, setRouteCache] = useState<Record<string, any>>({});

  const preloadRoute = useCallback((routePath: string, importFunc: () => Promise<any>) => {
    if (preloadedRoutes.has(routePath)) {
      return Promise.resolve();
    }

    return importFunc().then(module => {
      setPreloadedRoutes(prev => new Set(prev).add(routePath));
      setRouteCache(prev => ({ ...prev, [routePath]: module }));
    });
  }, [preloadedRoutes]);

  const getCachedRoute = useCallback((routePath: string) => {
    return routeCache[routePath];
  }, [routeCache]);

  const isRoutePreloaded = useCallback((routePath: string) => {
    return preloadedRoutes.has(routePath);
  }, [preloadedRoutes]);

  return {
    preloadRoute,
    getCachedRoute,
    isRoutePreloaded,
    preloadedRoutes,
    routeCache
  };
};
