// ===================================================================
// UNIVERSAL API HOOKS
// Backend-agnostic React hooks for API integration
// Compatible with any backend (Express, Fastify, Django, etc.)
// ===================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { ApiResponse, ApiParams, ApiError } from '@/types/api';

// ===================================================================
// CONFIGURATION
// ===================================================================

interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  defaultHeaders: Record<string, string>;
}

const defaultConfig: ApiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};

// ===================================================================
// HTTP CLIENT
// ===================================================================

class ApiClient {
  private config: ApiConfig;
  private interceptors: {
    request: Array<(config: RequestInit) => RequestInit>;
    response: Array<(response: Response) => Response>;
  };

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.interceptors = { request: [], response: [] };
  }

  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor: (response: Response) => Response) {
    this.interceptors.response.push(interceptor);
  }

  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    retries: number = this.config.retries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await this.delay(this.config.retryDelay);
        return this.executeWithRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    if (error instanceof TypeError) return true; // Network error
    if (error.status >= 500) return true; // Server error
    if (error.status === 429) return true; // Rate limit
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    let config: RequestInit = {
      ...options,
      headers: {
        ...this.config.defaultHeaders,
        ...options.headers,
      },
    };

    // Apply request interceptors
    for (const interceptor of this.interceptors.request) {
      config = interceptor(config);
    }

    return this.executeWithRetry(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      try {
        let response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Apply response interceptors
        for (const interceptor of this.interceptors.response) {
          response = interceptor(response);
        }

        const data = await response.json();

        if (!response.ok) {
          throw {
            status: response.status,
            statusText: response.statusText,
            ...data,
          };
        }

        return data;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    });
  }

  get<T = any>(endpoint: string, params?: ApiParams): Promise<ApiResponse<T>> {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// ===================================================================
// API INSTANCE & SETUP
// ===================================================================

export const apiClient = new ApiClient();

// Auto-add auth token to requests
apiClient.addRequestInterceptor((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

// Handle auth errors globally
apiClient.addResponseInterceptor((response) => {
  if (response.status === 401) {
    // Token expired or invalid - redirect to login
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }
  return response;
});

// ===================================================================
// GENERIC API HOOKS
// ===================================================================

export interface UseApiOptions<T> {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retryOnError?: boolean;
  select?: (data: any) => T;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function useApi<T = any>(
  endpoint: string | null,
  params?: ApiParams,
  options: UseApiOptions<T> = {}
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    enabled = true,
    refetchOnWindowFocus = false,
    refetchInterval,
    onSuccess,
    onError,
    retryOnError = true,
    select,
  } = options;

  const fetchData = useCallback(async () => {
    if (!endpoint || !enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<T>(endpoint, params);
      const result = select ? select(response.data) : response.data;
      
      setData(result);
      onSuccess?.(result);
    } catch (err: any) {
      const apiError: ApiError = {
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An unexpected error occurred',
        name: 'ApiError',
        details: err.details,
        field: err.field,
        timestamp: new Date().toISOString(),
        request_id: err.request_id || '',
      };
      
      setError(apiError);
      onError?.(apiError);
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, enabled, onSuccess, onError, select]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, refetchInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}

// ===================================================================
// MUTATION HOOK
// ===================================================================

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void;
}

export interface UseMutationState<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  loading: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationState<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { onSuccess, onError, onSettled } = options;

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setLoading(true);
    setError(null);

    try {
      const response = await mutationFn(variables);
      setData(response.data);
      onSuccess?.(response.data, variables);
      onSettled?.(response.data, null, variables);
      return response.data;
    } catch (err: any) {
      const apiError: ApiError = {
        code: err.code || 'UNKNOWN_ERROR',
        message: err.message || 'An unexpected error occurred',
        name: 'ApiError',
        details: err.details,
        field: err.field,
        timestamp: new Date().toISOString(),
        request_id: err.request_id || '',
      };
      
      setError(apiError);
      onError?.(apiError, variables);
      onSettled?.(null, apiError, variables);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    mutateAsync: mutate,
    data,
    loading,
    error,
    reset,
  };
}

// ===================================================================
// SPECIALIZED HOOKS
// ===================================================================

export function useInfiniteApi<T>(
  endpoint: string,
  options: UseApiOptions<T> & {
    getNextPageParam?: (lastPage: any) => string | null;
    initialPageParam?: string;
  } = {}
) {
  const [pages, setPages] = useState<any[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const { getNextPageParam, initialPageParam = '', ...apiOptions } = options;

  const baseQuery = useApi<T>(
    pages.length === 0 ? `${endpoint}?${initialPageParam}` : null,
    undefined,
    apiOptions
  );

  const fetchNextPage = useCallback(async () => {
    if (!hasNextPage || isFetchingNextPage) return;

    const lastPage = pages[pages.length - 1];
    const nextPageParam = getNextPageParam?.(lastPage);
    
    if (!nextPageParam) return;

    setIsFetchingNextPage(true);
    try {
      const response = await apiClient.get(`${endpoint}?${nextPageParam}`);
      setPages(prev => [...prev, response.data]);
      setHasNextPage(!!getNextPageParam?.(response.data));
    } catch (error) {
      console.error('Error fetching next page:', error);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [endpoint, pages, hasNextPage, isFetchingNextPage, getNextPageParam]);

  useEffect(() => {
    if (baseQuery.data) {
      setPages([baseQuery.data]);
      setHasNextPage(!!getNextPageParam?.(baseQuery.data));
    }
  }, [baseQuery.data, getNextPageParam]);

  return {
    data: { pages },
    loading: baseQuery.loading,
    error: baseQuery.error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch: baseQuery.refetch,
  };
}

// ===================================================================
// QUERY INVALIDATION
// ===================================================================

class QueryCache {
  private cache = new Map<string, any>();

  set(key: string, data: any) {
    this.cache.set(key, data);
  }

  get(key: string) {
    return this.cache.get(key);
  }

  invalidate(keyPattern: string | RegExp) {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (typeof keyPattern === 'string') {
        if (key.includes(keyPattern)) {
          keysToDelete.push(key);
        }
      } else {
        if (keyPattern.test(key)) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clear() {
    this.cache.clear();
  }
}

export const queryCache = new QueryCache();

export function useQueryInvalidation() {
  const invalidateQueries = useCallback((keyPattern: string | RegExp) => {
    queryCache.invalidate(keyPattern);
    // Trigger re-renders of components using invalidated queries
    window.dispatchEvent(new CustomEvent('query-invalidated', { detail: { keyPattern } }));
  }, []);

  return { invalidateQueries };
}

// ===================================================================
// OPTIMISTIC UPDATES
// ===================================================================

export function useOptimisticMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: UseMutationOptions<TData, TVariables> & {
    optimisticUpdate?: (variables: TVariables) => TData;
    rollback?: (error: ApiError, variables: TVariables) => void;
  } = {}
) {
  const { optimisticUpdate, rollback, ...mutationOptions } = options;
  
  const mutation = useMutation(mutationFn, {
    ...mutationOptions,
    onError: (error, variables) => {
      rollback?.(error, variables);
      mutationOptions.onError?.(error, variables);
    },
  });

  const optimisticMutate = useCallback(async (variables: TVariables) => {
    // Apply optimistic update immediately
    if (optimisticUpdate) {
      const optimisticData = optimisticUpdate(variables);
      mutation.mutate(variables);
      return optimisticData;
    }
    
    return mutation.mutate(variables);
  }, [mutation, optimisticUpdate]);

  return {
    ...mutation,
    mutate: optimisticMutate,
  };
}

// ===================================================================
// WEBSOCKET HOOK
// ===================================================================

export interface UseWebSocketOptions {
  enabled?: boolean;
  reconnectOnClose?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: (event: Event) => void;
  onMessage?: (data: any) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const reconnectAttempts = useRef(0);

  const {
    enabled = true,
    reconnectOnClose = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onOpen,
    onMessage,
    onError,
    onClose,
  } = options;

  const connect = useCallback(() => {
    if (!enabled || socket?.readyState === WebSocket.OPEN) return;

    setConnectionStatus('connecting');
    const ws = new WebSocket(url);

    ws.onopen = (event) => {
      setConnectionStatus('connected');
      reconnectAttempts.current = 0;
      onOpen?.(event);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(data);
      onMessage?.(data);
    };

    ws.onerror = (error) => {
      onError?.(error);
    };

    ws.onclose = (event) => {
      setConnectionStatus('disconnected');
      onClose?.(event);

      if (reconnectOnClose && reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(connect, reconnectInterval);
      }
    };

    setSocket(ws);
  }, [url, enabled, reconnectOnClose, reconnectInterval, maxReconnectAttempts, onOpen, onMessage, onError, onClose]);

  const disconnect = useCallback(() => {
    socket?.close();
    setSocket(null);
    setConnectionStatus('disconnected');
  }, [socket]);

  const sendMessage = useCallback((data: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }, [socket]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    socket,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}