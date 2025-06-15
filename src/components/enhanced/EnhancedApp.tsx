
import React, { useEffect } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { useSecurityFeatures } from '@/hooks/useSecurityFeatures';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedAppProps {
  children: React.ReactNode;
}

export const EnhancedApp: React.FC<EnhancedAppProps> = ({ children }) => {
  const { trackError, measureInteraction } = usePerformanceMonitoring();
  const { trackEvent, trackError: trackAnalyticsError } = useUserAnalytics();
  const { detectBot, logSecurityEvent, checkRateLimit } = useSecurityFeatures();
  const { user } = useAuth();

  useEffect(() => {
    // Initialize security monitoring
    const botDetection = detectBot();
    if (botDetection.isBot && botDetection.confidence > 0.7) {
      logSecurityEvent('potential_bot_detected', {
        confidence: botDetection.confidence,
        reasons: botDetection.reasons,
      });
    }

    // Track app initialization
    trackEvent('app_initialized', {
      user_authenticated: !!user,
      timestamp: new Date().toISOString(),
    });
  }, [detectBot, logSecurityEvent, trackEvent, user]);

  // Enhanced error handling
  const handleError = (error: Error, errorInfo: any) => {
    // Track error in performance monitoring
    trackError(error, errorInfo);
    
    // Track error in analytics
    trackAnalyticsError(error, 'error_boundary');
    
    // Log security event if error seems suspicious
    if (error.message.includes('script') || error.message.includes('inject')) {
      logSecurityEvent('suspicious_error', {
        error: error.message,
        stack: error.stack,
        component_stack: errorInfo?.componentStack,
      });
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};
