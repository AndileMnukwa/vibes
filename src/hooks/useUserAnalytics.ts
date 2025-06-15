
import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate } from 'react-router-dom';

interface AnalyticsEvent {
  event_type: string;
  event_data: Record<string, any>;
  timestamp: string;
  user_id?: string;
  session_id: string;
  page_url: string;
  user_agent: string;
}

interface UserSession {
  session_id: string;
  start_time: string;
  end_time?: string;
  page_views: number;
  events_count: number;
}

export const useUserAnalytics = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sessionRef = useRef<UserSession | null>(null);
  const eventQueueRef = useRef<AnalyticsEvent[]>([]);
  const lastPageViewRef = useRef<string>('');

  // Initialize session
  useEffect(() => {
    const initSession = () => {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionRef.current = {
        session_id: sessionId,
        start_time: new Date().toISOString(),
        page_views: 0,
        events_count: 0,
      };
    };

    initSession();

    // End session on page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Track page views
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    if (currentPath !== lastPageViewRef.current) {
      trackEvent('page_view', {
        path: currentPath,
        referrer: lastPageViewRef.current || document.referrer,
      });
      
      lastPageViewRef.current = currentPath;
      
      if (sessionRef.current) {
        sessionRef.current.page_views++;
      }
    }
  }, [location]);

  // Track events
  const trackEvent = useCallback((eventType: string, eventData: Record<string, any> = {}) => {
    if (!sessionRef.current) return;

    const event: AnalyticsEvent = {
      event_type: eventType,
      event_data: eventData,
      timestamp: new Date().toISOString(),
      user_id: user?.id,
      session_id: sessionRef.current.session_id,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    };

    eventQueueRef.current.push(event);
    sessionRef.current.events_count++;

    // Batch send events every 5 events or 30 seconds
    if (eventQueueRef.current.length >= 5) {
      flushEvents();
    } else {
      // Set a timeout to flush events if they don't reach the batch size
      setTimeout(flushEvents, 30000);
    }
  }, [user?.id]);

  // Flush events to database
  const flushEvents = useCallback(async () => {
    if (eventQueueRef.current.length === 0) return;

    const eventsToSend = [...eventQueueRef.current];
    eventQueueRef.current = [];

    try {
      const { error } = await supabase
        .from('user_analytics')
        .insert(eventsToSend);

      if (error) {
        console.error('Faile to send analytics events:', error);
        // Re-queue events on failure
        eventQueueRef.current.unshift(...eventsToSend);
      }
    } catch (error) {
      console.error('Analytics flush error:', error);
      eventQueueRef.current.unshift(...eventsToSend);
    }
  }, []);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionRef.current) return;

    // Flush any remaining events
    await flushEvents();

    // Update session end time
    const sessionData = {
      ...sessionRef.current,
      end_time: new Date().toISOString(),
    };

    try {
      await supabase
        .from('user_sessions')
        .insert(sessionData);
    } catch (error) {
      console.error('Failed to save session:', error);
    }

    sessionRef.current = null;
  }, [flushEvents]);

  // Track specific user interactions
  const trackInteraction = useCallback((element: string, action: string, data?: Record<string, any>) => {
    trackEvent('user_interaction', {
      element,
      action,
      ...data,
    });
  }, [trackEvent]);

  // Track search queries
  const trackSearch = useCallback((query: string, results_count: number, filters?: Record<string, any>) => {
    trackEvent('search', {
      query,
      results_count,
      filters,
    });
  }, [trackEvent]);

  // Track event views
  const trackEventView = useCallback((eventId: string, eventTitle: string) => {
    trackEvent('event_view', {
      event_id: eventId,
      event_title: eventTitle,
    });
  }, [trackEvent]);

  // Track review submissions
  const trackReviewSubmission = useCallback((eventId: string, rating: number) => {
    trackEvent('review_submission', {
      event_id: eventId,
      rating,
    });
  }, [trackEvent]);

  // Track calendar interactions
  const trackCalendarAction = useCallback((action: string, eventId?: string) => {
    trackEvent('calendar_action', {
      action,
      event_id: eventId,
    });
  }, [trackEvent]);

  // Track errors
  const trackError = useCallback((error: Error, context?: string) => {
    trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackInteraction,
    trackSearch,
    trackEventView,
    trackReviewSubmission,
    trackCalendarAction,
    trackError,
    flushEvents,
    endSession,
  };
};
