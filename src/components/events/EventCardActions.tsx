
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarIntegrationComponent } from './CalendarIntegration';

interface EventCardActionsProps {
  event: {
    title: string;
    description: string;
    location: string;
    event_date: string;
    end_date: string | null;
  };
  isExternal: boolean;
  onAddToCalendar: (e: React.MouseEvent) => void;
  onClick: () => void;
}

export function EventCardActions({ 
  event, 
  isExternal, 
  onAddToCalendar, 
  onClick 
}: EventCardActionsProps) {
  return (
    <div className="flex gap-2 pt-2 px-6 pb-6" onClick={onAddToCalendar}>
      <CalendarIntegrationComponent 
        event={event}
        size="sm"
      />
      <Button 
        variant="default" 
        size="sm" 
        className="flex-1"
        onClick={onClick}
      >
        {isExternal ? 'View Event' : 'Learn More'}
      </Button>
    </div>
  );
}
