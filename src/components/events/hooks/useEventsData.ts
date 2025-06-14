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
  organizer_role?: 'admin' | 'moderator' | 'user' | null;
};

export function useEventsData() {
  const { searchQuery, selectedCategory, dateFilter, locationFilter } = useSearch();
  const { userLocation, distanceFilter } = useLocation();
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  
  const externalSources: ExternalEventSource[] = [
    { id: '1', name: 'Eventbrite', type: 'eventbrite', enabled: true },
    { id: '2', name: 'Meetup', type: 'meetup', enabled: true },
  ];

  console.log('useEventsData - userLocation:', userLocation);
  console.log('useEventsData - filters:', { searchQuery, selectedCategory, dateFilter, locationFilter });

  // Fetch local events with organizer role information
  const { data: localEvents, isLoading: localLoading, error: localError } = useQuery({
    queryKey: ['events', debouncedSearchQuery, selectedCategory, dateFilter, locationFilter],
    queryFn: async () => {
      console.log('Fetching local events with organizer roles...');
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

      const { data: events, error } = await query;
      if (error) {
        console.error('Error fetching local events:', error);
        throw error;
      }

      if (!events || events.length === 0) {
        console.log('No events found');
        return [];
      }

      // Get unique organizer IDs
      const organizerIds = [...new Set(events.map(event => event.organizer_id))];

      // Fetch roles for all organizers
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', organizerIds);

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        // Continue without roles rather than failing completely
      }

      // Create a map of user_id to role for quick lookup
      const roleMap = new Map();
      userRoles?.forEach(userRole => {
        roleMap.set(userRole.user_id, userRole.role);
      });

      // Transform the data to include organizer role
      const eventsWithRoles = events.map(event => ({
        ...event,
        organizer_role: roleMap.get(event.organizer_id) || 'user'
      }));

      console.log('Local events fetched with roles:', eventsWithRoles.length);
      return eventsWithRoles as Event[];
    },
  });

  // Fetch external events (only when location is available)
  const { data: externalEvents, isLoading: externalLoading, error: externalError } = useQuery({
    queryKey: ['external-events', userLocation, distanceFilter, externalSources],
    queryFn: async () => {
      console.log('Fetching external events...');
      if (!userLocation) {
        console.log('No user location, returning empty external events');
        return [];
      }
      try {
        const events = await ExternalEventService.fetchExternalEvents(
          userLocation,
          distanceFilter.radius,
          externalSources
        );
        console.log('External events fetched:', events.length);
        return events;
      } catch (error) {
        console.error('Error fetching external events:', error);
        return []; // Return empty array instead of throwing
      }
    },
    enabled: true, // Always enabled, but returns empty array if no location
  });

  const isLoading = localLoading || externalLoading;
  const error = localError || externalError;

  console.log('useEventsData - isLoading:', isLoading);
  console.log('useEventsData - localEvents count:', localEvents?.length || 0);
  console.log('useEventsData - externalEvents count:', externalEvents?.length || 0);

  return {
    localEvents: localEvents || [],
    externalEvents: externalEvents || [],
    isLoading,
    error,
  };
}
