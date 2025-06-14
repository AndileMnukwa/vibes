
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEventCard } from './EnhancedEventCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearch } from '@/contexts/SearchContext';
import { useLocation } from '@/components/location/LocationProvider';
import { ExternalEventService } from '@/services/externalEventService';
import { Grid, List, Filter, SortAsc } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import type { ExternalEvent, ExternalEventSource } from '@/types/external-events';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

type SortOption = 'date' | 'distance' | 'price' | 'popularity';
type ViewMode = 'grid' | 'list';

export function EnhancedEventsGrid() {
  const { searchQuery, selectedCategory, dateFilter, locationFilter } = useSearch();
  const { userLocation, distanceFilter } = useLocation();
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300);
  
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [externalSources] = useState<ExternalEventSource[]>([
    { id: '1', name: 'Eventbrite', type: 'eventbrite', enabled: true },
    { id: '2', name: 'Meetup', type: 'meetup', enabled: true },
  ]);

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

  // Combined and sorted events
  const allEvents = useMemo(() => {
    const local = localEvents || [];
    const external = externalEvents || [];
    const combined = [...local, ...external];

    return combined.sort((a, b) => {
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
  }, [localEvents, externalEvents, sortBy]);

  const isLoading = localLoading || externalLoading;
  const hasFilters = searchQuery || selectedCategory || dateFilter || locationFilter;

  if (isLoading) {
    return (
      <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-80">
            <Skeleton className="h-full w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (localError) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading events. Please try again later.</p>
      </div>
    );
  }

  if (!allEvents || allEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="text-muted-foreground">
            {hasFilters 
              ? 'Try adjusting your filters or search terms.'
              : 'Be the first to create an event in your area!'
            }
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            {allEvents.length} events
          </Badge>
          {externalEvents && externalEvents.length > 0 && (
            <Badge variant="outline">
              {externalEvents.length} from external sources
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Options */}
          <Tabs value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="date">Date</TabsTrigger>
              <TabsTrigger value="distance">Distance</TabsTrigger>
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="popularity">Popular</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* View Mode Toggle */}
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Events Grid/List */}
      <motion.div
        layout
        className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 max-w-4xl mx-auto'
        }`}
      >
        <AnimatePresence>
          {allEvents.map((event, index) => (
            <motion.div
              key={`${('source' in event) ? 'external' : 'local'}-${event.id}`}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <EnhancedEventCard
                event={event}
                isExternal={'source' in event}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
