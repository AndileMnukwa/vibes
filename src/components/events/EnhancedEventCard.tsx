
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';
import type { ExternalEvent } from '@/types/external-events';
import { EventCardImage } from './EventCardImage';
import { EventCardHeader } from './EventCardHeader';
import { EventCardContent } from './EventCardContent';
import { EventCardActions } from './EventCardActions';

type LocalEvent = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
  organizer_role?: 'admin' | 'moderator' | 'user' | null;
};

interface EnhancedEventCardProps {
  event: LocalEvent | ExternalEvent;
  isExternal: boolean;
}

export function EnhancedEventCard({ event, isExternal }: EnhancedEventCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isExternal) {
      const externalEvent = event as ExternalEvent;
      window.open(externalEvent.external_url, '_blank');
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
  };

  const eventDate = new Date(event.event_date);
  const endDate = 'end_date' in event && event.end_date ? new Date(event.end_date) : null;
  
  const price = event.ticket_price;
  const capacity = event.capacity;
  const location = event.location;
  const title = event.title;
  const description = 'short_description' in event ? event.short_description : event.description;
  const isAdminCreated = !isExternal && 'organizer_role' in event && event.organizer_role === 'admin';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group"
    >
      <Card className="h-full cursor-pointer overflow-hidden bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-2xl">
        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
        
        <div className="relative">
          <EventCardImage
            imageUrl={event.image_url}
            title={title}
            isExternal={isExternal}
            isAdminCreated={isAdminCreated}
          />
          
          <EventCardHeader
            title={title}
            eventDate={eventDate}
            endDate={endDate}
            isExternal={isExternal}
            onClick={handleClick}
          />

          <EventCardContent
            event={event}
            isExternal={isExternal}
            description={description}
            location={location}
            price={price}
            capacity={capacity}
            onClick={handleClick}
          />

          <EventCardActions
            event={{
              title,
              description: description || '',
              location,
              event_date: event.event_date,
              end_date: endDate?.toISOString() || null,
            }}
            isExternal={isExternal}
            onAddToCalendar={handleAddToCalendar}
            onClick={handleClick}
          />
        </div>
      </Card>
    </motion.div>
  );
}
