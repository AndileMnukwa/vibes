
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

interface CacheConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchInterval?: number;
  retryDelay?: number;
  retry?: number;
}

interface SmartCacheOptions<T> extends UseQueryOptions<T> {
  cacheStrategy?: 'aggressive' | 'conservative' | 'real-time';
  dependencies?: string[];
  invalidateOn?: string[];
}

export const useAdvancedCaching = () => {
  const queryClient = useQueryClient();
  const cacheStatsRef = useRef({
    hits: 0,
    misses: 0,
    invalidations: 0,
  });

  // Predefined cache strategies
  const getCacheConfig = (strategy: 'aggressive' | 'conservative' | 'real-time'): CacheConfig => {
    switch (strategy) {
      case 'aggressive':
        return {
          staleTime: 10 * 60 * 1000, // 10 minutes
          cacheTime: 30 * 60 * 1000, // 30 minutes
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          retry: 3,
          retryDelay: 1000,
        };
      
      case 'conservative':
        return {
          staleTime: 2 * 60 * 1000, // 2 minutes
          cacheTime: 5 * 60 * 1000, // 5 minutes
          refetchOnWindowFocus: true,
          refetchOnMount: true,
          retry: 2,
          retryDelay: 500,
        };
      
      case 'real-time':
        return {
          staleTime: 0,
          cacheTime: 1 * 60 * 1000, // 1 minute
          refetchOnWindowFocus: true,
          refetchOnMount: true,
          refetchInterval: 30 * 1000, // 30 seconds
          retry: 1,
          retryDelay: 200,
        };
      
      default:
        return {};
    }
  };

  // Smart cache invalidation
  const smartInvalidate = (patterns: string[]) => {
    patterns.forEach(pattern => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey.join('-') : String(query.queryKey);
          return queryKey.includes(pattern);
        }
      });
    });
    
    cacheStatsRef.current.invalidations++;
  };

  // Preload data
  const preloadData = async <T>(
    queryKey: string[],
    queryFn: () => Promise<T>,
    config?: CacheConfig
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...config,
    });
  };

  // Background refetch for critical data
  const backgroundRefresh = (queryKeys: string[][]) => {
    queryKeys.forEach(queryKey => {
      queryClient.refetchQueries({ queryKey });
    });
  };

  // Cache warming for predicted data
  const warmCache = async (predictions: Array<{ queryKey: string[]; queryFn: () => Promise<any> }>) => {
    const promises = predictions.map(({ queryKey, queryFn }) =>
      queryClient.prefetchQuery({ queryKey, queryFn })
    );
    
    await Promise.allSettled(promises);
  };

  // Monitor cache performance
  const getCacheStats = () => ({
    ...cacheStatsRef.current,
    hitRate: cacheStatsRef.current.hits / (cacheStatsRef.current.hits + cacheStatsRef.current.misses) || 0,
  });

  // Cleanup stale cache entries
  const cleanupCache = () => {
    queryClient.clear();
  };

  return {
    getCacheConfig,
    smartInvalidate,
    preloadData,
    backgroundRefresh,
    warmCache,
    getCacheStats,
    cleanupCache,
  };
};

// Enhanced useQuery wrapper with smart caching
export const useSmartQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: SmartCacheOptions<T>
) => {
  const { getCacheConfig } = useAdvancedCaching();
  const queryClient = useQueryClient();
  
  const cacheConfig = options?.cacheStrategy 
    ? getCacheConfig(options.cacheStrategy)
    : {};

  const query = useQuery({
    queryKey,
    queryFn,
    ...cacheConfig,
    ...options,
  });

  // Auto-invalidate based on dependencies
  useEffect(() => {
    if (options?.invalidateOn) {
      const handleInvalidation = () => {
        queryClient.invalidateQueries({ queryKey });
      };

      options.invalidateOn.forEach(event => {
        window.addEventListener(event, handleInvalidation);
      });

      return () => {
        options.invalidateOn?.forEach(event => {
          window.removeEventListener(event, handleInvalidation);
        });
      };
    }
  }, [options?.invalidateOn, queryClient, queryKey]);

  return query;
};
