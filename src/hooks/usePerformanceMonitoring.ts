import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

interface PerformanceMetrics {
  pageLoadTime: number;
  renderTime: number;
  interactionDelay: number;
  memoryUsage?: number;
}

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

export const usePerformanceMonitoring = () => {
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const errorsRef = useRef<ErrorInfo[]>([]);

  // Track performance metrics
  const trackMetrics = (metrics: PerformanceMetrics) => {
    metricsRef.current.push({
      ...metrics,
      timestamp: Date.now()
    } as any);

    // Keep only last 100 entries
    if (metricsRef.current.length > 100) {
      metricsRef.current = metricsRef.current.slice(-100);
    }

    // Send to analytics (could be enhanced with actual analytics service)
    console.log('Performance Metrics:', metrics);
  };

  // Track errors
  const trackError = (error: Error, errorInfo?: any) => {
    const errorData: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    errorsRef.current.push(errorData);

    // Keep only last 50 errors
    if (errorsRef.current.length > 50) {
      errorsRef.current = errorsRef.current.slice(-50);
    }

    console.error('Error tracked:', errorData);
  };

  // Measure page load time
  useEffect(() => {
    const measurePageLoad = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
          
          trackMetrics({
            pageLoadTime,
            renderTime,
            interactionDelay: 0,
            memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          });
        }
      }
    };

    // Delay to ensure navigation timing is available
    setTimeout(measurePageLoad, 1000);
  }, []);

  // Measure interaction delays
  const measureInteraction = (interactionName: string) => {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const interactionDelay = end - start;
      
      trackMetrics({
        pageLoadTime: 0,
        renderTime: 0,
        interactionDelay,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      });
    };
  };

  return {
    trackMetrics,
    trackError,
    measureInteraction,
    getMetrics: () => metricsRef.current,
    getErrors: () => errorsRef.current,
  };
};
