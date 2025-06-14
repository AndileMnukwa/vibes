
import type { Tables } from '@/integrations/supabase/types';
import type { ExternalEvent } from '@/types/external-events';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
  organizer_role?: 'admin' | 'moderator' | 'user' | null;
};

type SortOption = 'date' | 'distance' | 'price' | 'popularity';

export function sortEvents(
  localEvents: Event[],
  externalEvents: ExternalEvent[],
  sortBy: SortOption
) {
  const combined = [...localEvents, ...externalEvents];

  return combined.sort((a, b) => {
    // First priority: Admin events come first
    const aIsAdmin = ('organizer_role' in a) && a.organizer_role === 'admin';
    const bIsAdmin = ('organizer_role' in b) && b.organizer_role === 'admin';
    
    if (aIsAdmin && !bIsAdmin) return -1;
    if (!aIsAdmin && bIsAdmin) return 1;
    
    // If both are admin or both are not admin, sort by the selected criteria
    switch (sortBy) {
      case 'date':
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      case 'distance':
        if ('distance' in a && 'distance' in b && a.distance && b.distance) {
          return a.distance - b.distance;
        }
        return 0;
      case 'price':
        const priceA = a.ticket_price || 0;
        const priceB = b.ticket_price || 0;
        return priceA - priceB;
      case 'popularity':
        // Mock popularity based on capacity
        const popA = a.capacity || 0;
        const popB = b.capacity || 0;
        return popB - popA;
      default:
        return 0;
    }
  });
}
