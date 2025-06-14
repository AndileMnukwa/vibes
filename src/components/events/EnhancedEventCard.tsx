
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarIntegrationComponent } from './CalendarIntegration';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  ExternalLink,
  Clock,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';
import type { ExternalEvent } from '@/types/external-events';

type LocalEvent = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
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
  const hasImage = event.image_url && event.image_url.trim() !== '';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Event Image or Placeholder */}
        {hasImage ? (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={event.image_url} 
              alt={title}
              className="w-full h-full object-cover"
            />
            {isExternal && (
              <Badge className="absolute top-3 right-3 bg-blue-600">
                External
              </Badge>
            )}
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            {isExternal && (
              <Badge className="absolute top-3 right-3 bg-blue-600">
                External
              </Badge>
            )}
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg line-clamp-2 flex-1" onClick={handleClick}>
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

        <CardContent className="pt-0" onClick={handleClick}>
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2" onClick={handleAddToCalendar}>
            <CalendarIntegrationComponent 
              event={{
                title,
                description: description || '',
                location,
                event_date: event.event_date,
                end_date: endDate?.toISOString() || null,
              }}
              size="sm"
            />
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={handleClick}
            >
              {isExternal ? 'View Event' : 'Learn More'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
