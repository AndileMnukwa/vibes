
import React from 'react';
import { CardHeader } from '@/components/ui/card';
import { Calendar, Clock, ExternalLink } from 'lucide-react';

interface EventCardHeaderProps {
  title: string;
  eventDate: Date;
  endDate: Date | null;
  isExternal: boolean;
  onClick: () => void;
}

export function EventCardHeader({ title, eventDate, endDate, isExternal, onClick }: EventCardHeaderProps) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-lg line-clamp-2 flex-1" onClick={onClick}>
          {title}
        </h3>
        {isExternal && (
          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>
          {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>

      {endDate && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            Until {endDate.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      )}
    </CardHeader>
  );
}
