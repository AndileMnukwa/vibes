
import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { ExternalEvent } from '@/types/external-events';

interface EventsGridHeaderProps {
  totalEvents: number;
  externalEventsCount: number;
}

export function EventsGridHeader({ totalEvents, externalEventsCount }: EventsGridHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="flex items-center gap-1">
        {totalEvents} events
      </Badge>
      {externalEventsCount > 0 && (
        <Badge variant="outline">
          {externalEventsCount} from external sources
        </Badge>
      )}
    </div>
  );
}
