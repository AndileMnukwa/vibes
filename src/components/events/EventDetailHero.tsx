
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEventSharing } from '@/hooks/useEventSharing';
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Hero Image with coral overlay */}
      {event.image_url && (
        <div className="relative h-64 lg:h-80 rounded-lg overflow-hidden group">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
        </div>
      )}

      {/* Event Header with enhanced styling */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {event.categories && (
            <Badge
              variant="secondary"
              className="border border-coral/30 bg-coral/10 text-coral hover:bg-coral/20 transition-colors"
              style={{ 
                backgroundColor: event.categories.color + '15', 
                color: event.categories.color,
                borderColor: event.categories.color + '30'
              }}
            >
              {event.categories.name}
            </Badge>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4 text-coral" />
            {eventDate.toLocaleDateString()} at {formatTime(eventDate)}
            {event.end_date && ` - ${formatTime(new Date(event.end_date))}`}
          </div>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
          <div className="flex items-center hover-coral-bg p-2 rounded-md transition-colors">
            <MapPin className="mr-1 h-4 w-4 text-coral" />
            {event.location}
          </div>
          {event.capacity && (
            <div className="flex items-center hover-coral-bg p-2 rounded-md transition-colors">
              <Users className="mr-1 h-4 w-4 text-coral" />
              Up to {event.capacity} people
            </div>
          )}
        </div>

        {/* Enhanced Share Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleWhatsAppShare(event)}
            className="border-coral/30 text-coral hover:bg-coral hover:text-white transition-colors"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Share on WhatsApp
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleGeneralShare(event)}
            className="border-coral/30 text-coral hover:bg-coral hover:text-white transition-colors"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};
