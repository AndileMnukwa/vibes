
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

export const useCalendarEvents = () => {
  const query = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          categories (*),
          profiles (*)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const transformEventsForCalendar = (events: Event[]) => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.event_date,
      end: event.end_date || event.event_date,
      backgroundColor: event.categories?.color || '#6366f1',
      borderColor: event.categories?.color || '#6366f1',
      textColor: '#ffffff',
      extendedProps: {
        description: event.description,
        location: event.location,
        category: event.categories?.name || 'Uncategorized',
        categoryColor: event.categories?.color || '#6366f1',
        ticketPrice: event.ticket_price,
        capacity: event.capacity,
        originalEvent: event,
      },
    }));
  };

  return {
    ...query,
    calendarEvents: query.data ? transformEventsForCalendar(query.data) : [],
  };
};
