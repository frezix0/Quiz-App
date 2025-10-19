import { useState, useEffect, useCallback } from 'react';
import { ENV } from '../config/env';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  cacheTime?: number;
  skip?: boolean;
  retries?: number;
  retryDelay?: number;
}

// Simple cache implementation
const apiCache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(...args: any[]): string {
  return JSON.stringify(args);
}

function isCacheValid(cacheTime?: number): boolean {
  if (!cacheTime) return false;
  return true;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => void } {
  const { cacheTime = 0, skip = false, retries = 1, retryDelay = 1000 } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: !skip,
    error: null,
  });

  const cacheKey = getCacheKey(apiCall.toString());

  const fetchData = useCallback(
    async (retryCount = 0) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Check cache
        const cached = apiCache.get(cacheKey);
        if (cached && cacheTime > 0) {
          const now = Date.now();
          if (now - cached.timestamp < cacheTime) {
            if (ENV.DEBUG) console.log('[Cache] Using cached data for:', cacheKey);
            setState({ data: cached.data, loading: false, error: null });
            return;
          }
        }

        // Fetch data
        const data = await apiCall();
        
        // Cache the result
        if (cacheTime > 0) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
        }

        setState({ data, loading: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';

        // Retry logic
        if (retryCount < retries) {
          if (ENV.DEBUG) console.log(`[API] Retrying... (${retryCount + 1}/${retries})`);
          setTimeout(() => fetchData(retryCount + 1), retryDelay);
        } else {
          setState({
            data: null,
            loading: false,
            error: errorMessage,
          });
        }
      }
    },
    [apiCall, cacheKey, cacheTime, retries, retryDelay]
  );

  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, deps);

  return {
    ...state,
    refetch: () => {
      apiCache.delete(cacheKey);
      fetchData();
    },
  };
}

// Hook async actions
export function useAsyncAction<T = any, P = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    action: (params: P) => Promise<T>,
    params: P,
    options?: { showError?: boolean }
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      if (ENV.DEBUG) console.log('[Action] Executing:', action.name);

      const result = await action(params);

      setLoading(false);
      return result !== undefined ? result : null;
    } catch (error: any) {
      setLoading(false);

      // Error handling
      let errorMessage = 'An error occurred';

      if (error.response?.data) {
        const data = error.response.data as any;
        errorMessage =
          data.detail || data.message || data.error || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);

      if (options?.showError !== false) {
        console.error('[Action] Error:', errorMessage);
      }

      throw error;
    }
  };

  return {
    execute,
    loading,
    error,
    clearError: () => setError(null),
  };
}