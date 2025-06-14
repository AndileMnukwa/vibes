
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIntegrationComponent } from './CalendarIntegration';
import { useEventSharing } from '@/hooks/useEventSharing';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

interface EventDetailHeroProps {
  event: Event;
}

export const EventDetailHero = ({ event }: EventDetailHeroProps) => {
  const { handleWhatsAppShare, handleGeneralShare } = useEventSharing();
  const eventDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            {endDate && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Until {endDate.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <CalendarIntegrationComponent 
            event={{
              title: event.title,
              description: event.description,
              location: event.location,
              event_date: event.event_date,
              end_date: event.end_date,
            }}
          />
          <Button variant="outline" size="sm">
            <Heart className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleWhatsAppShare(event)}
            className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleGeneralShare(event)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {event.categories && (
        <Badge 
          variant="secondary"
          style={{ 
            backgroundColor: event.categories.color + '20', 
            color: event.categories.color 
          }}
          className="mb-4"
        >
          {event.categories.name}
        </Badge>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          {event.location}
        </div>
        {event.capacity && (
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {event.capacity} spots
          </div>
        )}
        {event.profiles && (
          <div>
            Organized by {event.profiles.full_name || event.profiles.username || 'Anonymous'}
          </div>
        )}
      </div>
    </div>
  );
};
