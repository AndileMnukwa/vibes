
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityAuditLog {
  id: string;
  user_id?: string;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

interface RateLimitConfig {
  endpoint: string;
  max_requests: number;
  window_minutes: number;
}

export const useSecurityFeatures = () => {
  const { user } = useAuth();
  const [rateLimitHits, setRateLimitHits] = useState<Record<string, number>>({});

  // Rate limiting functionality
  const checkRateLimit = useCallback((endpoint: string, maxRequests = 100, windowMinutes = 15) => {
    const key = `${endpoint}_${user?.id || 'anonymous'}`;
    const now = Date.now();
    const windowStart = now - (windowMinutes * 60 * 1000);
    
    // Get stored requests for this endpoint
    const storedData = localStorage.getItem(`rateLimit_${key}`);
    let requests: number[] = storedData ? JSON.parse(storedData) : [];
    
    // Filter out old requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      setRateLimitHits(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      return false;
    }
    
    // Add current request
    requests.push(now);
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify(requests));
    
    return true;
  }, [user?.id]);

  // Bot detection (simple heuristics)
  const detectBot = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'automated',
      'headless', 'phantom', 'selenium', 'puppeteer'
    ];
    
    const isBot = botPatterns.some(pattern => userAgent.includes(pattern));
    
    // Additional checks
    const hasWebDriver = 'webdriver' in navigator;
    const hasAutomationProperty = (window as any).chrome && (window as any).chrome.runtime;
    const suspiciousUserAgent = userAgent.length < 50 || userAgent.length > 500;
    
    return {
      isBot: isBot || hasWebDriver || suspiciousUserAgent,
      confidence: isBot ? 0.9 : (hasWebDriver ? 0.8 : (suspiciousUserAgent ? 0.6 : 0.1)),
      reasons: [
        ...(isBot ? ['User agent contains bot keywords'] : []),
        ...(hasWebDriver ? ['WebDriver detected'] : []),
        ...(suspiciousUserAgent ? ['Suspicious user agent length'] : []),
      ]
    };
  }, []);

  // Audit logging
  const logSecurityEvent = useCallback(async (action: string, details: Record<string, any>) => {
    try {
      const auditLog: Omit<SecurityAuditLog, 'id'> = {
        user_id: user?.id,
        action,
        details,
        ip_address: await fetch('https://api.ipify.org?format=json')
          .then(r => r.json())
          .then(data => data.ip)
          .catch(() => 'unknown'),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // In a real app, you'd send this to your security logging service
      console.log('Security Event:', auditLog);
      
      // Store in localStorage for demo purposes
      const existingLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
      existingLogs.push(auditLog);
      localStorage.setItem('securityLogs', JSON.stringify(existingLogs.slice(-100)));
      
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user?.id]);

  // GDPR compliance helpers
  const requestDataExport = useCallback(async () => {
    if (!user) return null;
    
    try {
      // Collect user data from various tables
      const [profile, reviews, analytics] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('reviews').select('*').eq('user_id', user.id),
        // Note: user_analytics table access would need proper RLS policies
      ]);

      const exportData = {
        profile: profile.data,
        reviews: reviews.data,
        exportDate: new Date().toISOString(),
        requestedBy: user.id,
      };

      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vibecatcher-data-export-${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      await logSecurityEvent('data_export_requested', {
        user_id: user.id,
        export_type: 'full_data'
      });
      
      return exportData;
    } catch (error) {
      console.error('Data export failed:', error);
      throw error;
    }
  }, [user, logSecurityEvent]);

  const requestDataDeletion = useCallback(async () => {
    if (!user) return false;
    
    try {
      await logSecurityEvent('data_deletion_requested', {
        user_id: user.id,
        timestamp: new Date().toISOString()
      });
      
      // In a real app, this would trigger a secure deletion process
      console.log('Data deletion request logged for user:', user.id);
      return true;
    } catch (error) {
      console.error('Data deletion request failed:', error);
      return false;
    }
  }, [user, logSecurityEvent]);

  // Get security audit logs
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['security-audit-logs'],
    queryFn: () => {
      const logs = localStorage.getItem('securityLogs');
      return logs ? JSON.parse(logs) : [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return {
    checkRateLimit,
    detectBot,
    logSecurityEvent,
    requestDataExport,
    requestDataDeletion,
    auditLogs,
    rateLimitHits,
  };
};
