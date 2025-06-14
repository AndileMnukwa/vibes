
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { useSearch } from '@/contexts/SearchContext';
import { useLocation } from '@/components/location/LocationProvider';
import { ExternalEventService } from '@/services/externalEventService';
import type { Tables } from '@/integrations/supabase/types';
import type { ExternalEventSource } from '@/types/external-events';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

export function useEventsData() {
  const { searchQuery, selectedCategory, dateFilter, locationFilter } = useSearch();
  const { userLocation, distanceFilter } = useLocation();
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  
  const externalSources: ExternalEventSource[] = [
    { id: '1', name: 'Eventbrite', type: 'eventbrite', enabled: true },
    { id: '2', name: 'Meetup', type: 'meetup', enabled: true },
  ];

  // Fetch local events
  const { data: localEvents, isLoading: localLoading, error: localError } = useQuery({
    queryKey: ['events', debouncedSearchQuery, selectedCategory, dateFilter, locationFilter],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          categories (*),
          profiles (*)
        `)
        .eq('status', 'published')
        .order('event_date', { ascending: true });

      if (debouncedSearchQuery) {
        query = query.or(`title.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%,location.ilike.%${debouncedSearchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      if (dateFilter) {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case 'tomorrow':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
            break;
          case 'this-week':
            const dayOfWeek = now.getDay();
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - dayOfWeek));
            break;
          case 'this-month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
          default:
            startDate = now;
            endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        }

        query = query
          .gte('event_date', startDate.toISOString())
          .lt('event_date', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });

  // Fetch external events
  const { data: externalEvents, isLoading: externalLoading } = useQuery({
    queryKey: ['external-events', userLocation, distanceFilter, externalSources],
    queryFn: async () => {
      if (!userLocation) return [];
      return ExternalEventService.fetchExternalEvents(
        userLocation,
        distanceFilter.radius,
        externalSources
      );
    },
    enabled: !!userLocation,
  });

  return {
    localEvents: localEvents || [],
    externalEvents: externalEvents || [],
    isLoading: localLoading || externalLoading,
    error: localError,
  };
}
