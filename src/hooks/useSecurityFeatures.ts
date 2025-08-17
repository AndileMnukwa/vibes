
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export const useSecurityFeatures = () => {
  const { user } = useAuth();
  const { trackEvent } = useUserAnalytics();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [rateLimitData, setRateLimitData] = useState<Map<string, number[]>>(new Map());

  // Bot detection using various heuristics
  const detectBot = useCallback((): BotDetectionResult => {
    const reasons: string[] = [];
    let confidence = 0;

    // Check user agent
    const userAgent = navigator.userAgent.toLowerCase();
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
      'python', 'java', 'http', 'libwww', 'perl'
    ];
    
    if (botPatterns.some(pattern => userAgent.includes(pattern))) {
      reasons.push('Suspicious user agent');
      confidence += 0.4;
    }

    // Check for missing features that real browsers have
    if (!navigator.languages || navigator.languages.length === 0) {
      reasons.push('Missing browser languages');
      confidence += 0.2;
    }

    if (!navigator.plugins || navigator.plugins.length === 0) {
      reasons.push('No plugins detected');
      confidence += 0.1;
    }

    // Check for headless browser indicators
    if ((window as any).navigator.webdriver) {
      reasons.push('WebDriver detected');
      confidence += 0.5;
    }

    if (!(window as any).chrome && userAgent.includes('chrome')) {
      reasons.push('Chrome object missing');
      confidence += 0.3;
    }

    // Check screen dimensions (bots often have unusual dimensions)
    if (screen.width === 0 || screen.height === 0) {
      reasons.push('Invalid screen dimensions');
      confidence += 0.3;
    }

    return {
      isBot: confidence > 0.5,
      confidence: Math.min(confidence, 1),
      reasons
    };
  }, []);

  // Rate limiting check
  const checkRateLimit = useCallback((action: string, limit: number = 10, windowMs: number = 60000): RateLimitResult => {
    const now = Date.now();
    const key = `${user?.id || 'anonymous'}_${action}`;
    const requests = rateLimitData.get(key) || [];
    
    // Clean up old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: validRequests[0] + windowMs
      };
    }

    // Add current request
    validRequests.push(now);
    setRateLimitData(prev => new Map(prev.set(key, validRequests)));

    return {
      allowed: true,
      remaining: limit - validRequests.length,
      resetTime: now + windowMs
    };
  }, [user?.id, rateLimitData]);

  // Log security events
  const logSecurityEvent = useCallback(async (
    eventType: string,
    details: Record<string, any>,
    severity: SecurityEvent['severity'] = 'medium'
  ) => {
    try {
      const event: Omit<SecurityEvent, 'id'> = {
        event_type: eventType,
        severity,
        details,
        user_id: user?.id,
        ip_address: await getClientIP(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // Track in analytics
      trackEvent('security_event', {
        event_type: eventType,
        severity,
        details
      });

      // In a real app, you'd send this to a security monitoring service
      console.log('Security Event:', event);
      
      setSecurityEvents(prev => [event as SecurityEvent, ...prev.slice(0, 99)]);
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }, [user?.id, trackEvent]);

  // Get client IP (simplified version)
  const getClientIP = async (): Promise<string> => {
    try {
      // In production, you'd get this from your server or a service
      return '127.0.0.1';
    } catch {
      return 'unknown';
    }
  };

  // Monitor for suspicious activity
  useEffect(() => {
    const monitorActivity = () => {
      // Monitor rapid clicks (possible automation)
      let clickCount = 0;
      const clickWindow = 1000; // 1 second

      const handleClick = () => {
        clickCount++;
        setTimeout(() => clickCount--, clickWindow);
        
        if (clickCount > 10) {
          logSecurityEvent('rapid_clicking', {
            clicks_per_second: clickCount,
            timestamp: Date.now()
          }, 'medium');
        }
      };

      // Skip console manipulation monitoring in development
      // This was creating false positives with dev tools
      const shouldMonitorConsole = process.env.NODE_ENV === 'production';
      
      const monitorConsole = () => {
        // Only monitor in production to avoid dev tools false positives
        if (shouldMonitorConsole && typeof window !== 'undefined') {
          // More sophisticated console manipulation detection
          const hasDevTools = window.outerHeight - window.innerHeight > 160;
          if (hasDevTools && !window.localStorage.getItem('dev_tools_acknowledged')) {
            logSecurityEvent('potential_console_access', {
              timestamp: Date.now(),
              window_diff: window.outerHeight - window.innerHeight
            }, 'low');
          }
        }
      };

      document.addEventListener('click', handleClick);
      const consoleInterval = shouldMonitorConsole ? setInterval(monitorConsole, 30000) : null;

      return () => {
        document.removeEventListener('click', handleClick);
        if (consoleInterval) clearInterval(consoleInterval);
      };
    };

    return monitorActivity();
  }, [logSecurityEvent]);

  // Audit user permissions
  const auditUserPermissions = useCallback(async () => {
    if (!user) return null;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const auditResult = {
        user_id: user.id,
        has_profile: !!profile,
        role: userRole?.role || 'user',
        permissions_verified: true,
        audit_timestamp: new Date().toISOString()
      };

      logSecurityEvent('permissions_audit', auditResult, 'low');
      
      return auditResult;
    } catch (error) {
      console.error('Error auditing user permissions:', error);
      logSecurityEvent('permissions_audit_failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium');
      return null;
    }
  }, [user, logSecurityEvent]);

  return {
    detectBot,
    checkRateLimit,
    logSecurityEvent,
    auditUserPermissions,
    securityEvents,
  };
};
