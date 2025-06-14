
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Search } from 'lucide-react';

interface EventsGridEmptyProps {
  hasFilters: boolean;
}

export function EventsGridEmpty({ hasFilters }: EventsGridEmptyProps) {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No events found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your search criteria or filters
        </p>
        <Button variant="outline">Clear Filters</Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No events available</h3>
      <p className="text-muted-foreground mb-4">
        Be the first to create an event in your area
      </p>
      <Button>Create Event</Button>
    </div>
  );
}
