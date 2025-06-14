
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import type { ExternalEvent } from '@/types/external-events';

type LocalEvent = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

interface EventCardContentProps {
  event: LocalEvent | ExternalEvent;
  isExternal: boolean;
  description?: string | null;
  location: string;
  price: number | null;
  capacity?: number | null;
  onClick: () => void;
}

export function EventCardContent({ 
  event, 
  isExternal, 
  description, 
  location, 
  price, 
  capacity, 
  onClick 
}: EventCardContentProps) {
  return (
    <CardContent className="pt-0" onClick={onClick}>
      {/* Description */}
      {description && (
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
      )}

      {/* Location */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
        <MapPin className="h-4 w-4" />
        <span className="line-clamp-1">{location}</span>
        {'distance' in event && event.distance && (
          <Badge variant="outline" className="ml-auto">
            {event.distance.toFixed(1)}km
          </Badge>
        )}
      </div>

      {/* Event Details */}
      <div className="flex items-center justify-between text-sm mb-4">
        <div className="flex items-center gap-4">
          {price !== null && price > 0 ? (
            <div className="flex items-center gap-1 text-green-600 font-medium">
              <DollarSign className="h-4 w-4" />
              ${price}
            </div>
          ) : (
            <Badge variant="secondary" className="text-green-600 bg-green-50">
              Free
            </Badge>
          )}
          
          {capacity && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              {capacity}
            </div>
          )}
        </div>

        {/* Category for local events */}
        {!isExternal && 'categories' in event && event.categories && (
          <Badge 
            variant="secondary"
            style={{ 
              backgroundColor: event.categories.color + '20', 
              color: event.categories.color 
            }}
          >
            {event.categories.name}
          </Badge>
        )}

        {/* Source badge for external events */}
        {isExternal && 'source' in event && (
          <Badge variant="outline" className="capitalize">
            {event.source}
          </Badge>
        )}
      </div>

      {/* Organizer for local events */}
      {!isExternal && 'profiles' in event && event.profiles && (
        <div className="text-xs text-muted-foreground mb-4">
          Organized by {event.profiles.full_name || event.profiles.username || 'Anonymous'}
        </div>
      )}

      {/* External organizer */}
      {isExternal && 'organizer' in event && event.organizer && (
        <div className="text-xs text-muted-foreground mb-4">
          Organized by {event.organizer}
        </div>
      )}
    </CardContent>
  );
}
