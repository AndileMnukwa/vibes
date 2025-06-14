
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedEventCard } from './EnhancedEventCard';
import { EventsGridControls } from './EventsGridControls';
import { EventsGridHeader } from './EventsGridHeader';
import { EventsGridSkeleton } from './EventsGridSkeleton';
import { EventsGridEmpty } from './EventsGridEmpty';
import { useEventsData } from './hooks/useEventsData';
import { sortEvents } from './utils/eventSorting';
import { useSearch } from '@/contexts/SearchContext';

type SortOption = 'date' | 'distance' | 'price' | 'popularity';
type ViewMode = 'grid' | 'list';

export function EnhancedEventsGrid() {
  const { searchQuery, selectedCategory, dateFilter, locationFilter } = useSearch();
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { localEvents, externalEvents, isLoading, error } = useEventsData();

  // Combined and sorted events
  const allEvents = useMemo(() => {
    return sortEvents(localEvents, externalEvents, sortBy);
  }, [localEvents, externalEvents, sortBy]);

  const hasFilters = searchQuery || selectedCategory || dateFilter || locationFilter;

  if (isLoading) {
    return <EventsGridSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Error loading events. Please try again later.</p>
      </div>
    );
  }

  if (!allEvents || allEvents.length === 0) {
    return <EventsGridEmpty hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <EventsGridHeader 
          totalEvents={allEvents.length}
          externalEventsCount={externalEvents.length}
        />
        <EventsGridControls
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
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
