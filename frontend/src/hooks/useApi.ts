import { useState, useEffect } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  deps: React.DependencyList = []
): UseApiState<T> & { refetch: () => void } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await apiCall();
      setState({ data, loading: false, error: null });
    } catch (error) {
      console.error('API Error in useApi:', error);
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, deps);

  return {
    ...state,
    refetch: fetchData,
  };
}

// Hook for async operations with better error handling
export function useAsyncAction<T = any, P = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    action: (params: P) => Promise<T>,
    params: P
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Executing async action:', action.name, params);
      
      const result = await action(params);
      
      console.log('Action result:', result);
      
      setLoading(false);
      
      // DELETE operations or other operations that return void/undefined, 
      return result !== undefined ? result : null;
      
    } catch (error: any) {
      console.error('API Error in useAsyncAction:', error);
      setLoading(false);
      
      // Enhanced network error handling
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        console.warn('Network error detected - operation may have succeeded on server side');
        return null;
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn('Request timeout - operation may have succeeded');
        return null;
      }
      
      // Handle server errors with more specific messages
      let errorMessage = 'An error occurred';
      
      if (error.response?.data) {
        // Try different response formats
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.response?.status) {
        // Map common HTTP status codes to user-friendly messages
        switch (error.response.status) {
          case 400:
            errorMessage = 'Bad request - please check your input';
            break;
          case 401:
            errorMessage = 'Unauthorized - please log in again';
            break;
          case 403:
            errorMessage = 'Access denied - you do not have permission for this action';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 409:
            errorMessage = 'Conflict - resource may be in use or have dependencies';
            break;
          case 422:
            errorMessage = 'Invalid data provided';
            break;
          case 429:
            errorMessage = 'Too many requests - please try again later';
            break;
          case 500:
            errorMessage = 'Server error - please try again later';
            break;
          case 502:
            errorMessage = 'Service temporarily unavailable';
            break;
          case 503:
            errorMessage = 'Service unavailable - please try again later';
            break;
          default:
            errorMessage = `Server error (${error.response.status}): ${error.response.statusText}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  return { 
    execute, 
    loading, 
    error, 
    clearError: () => setError(null) 
  };
}