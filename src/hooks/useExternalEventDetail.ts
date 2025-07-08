import { useState, useEffect } from 'react';
import { ExternalEventService } from '@/services/externalEventService';
import type { ExternalEvent } from '@/types/external-events';

export function useExternalEventDetail(source: string, id: string) {
  const [event, setEvent] = useState<ExternalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!source || !id) {
        setError('Invalid event source or ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const eventDetail = await ExternalEventService.fetchExternalEventDetail(source, id);
        if (eventDetail) {
          setEvent(eventDetail);
        } else {
          setError('Event not found');
        }
      } catch (err) {
        console.error('Error fetching external event detail:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [source, id]);

  return {
    event,
    loading,
    error,
  };
}