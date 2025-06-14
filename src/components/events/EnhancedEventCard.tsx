
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Star, ExternalLink, Navigation } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import type { ExternalEvent } from '@/types/external-events';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

interface EnhancedEventCardProps {
  event: Event | ExternalEvent;
  isExternal?: boolean;
}

export function EnhancedEventCard({ event, isExternal = false }: EnhancedEventCardProps) {
  const navigate = useNavigate();
  const eventDate = new Date(event.event_date);
  
  const handleViewDetails = () => {
    if (isExternal) {
      window.open((event as ExternalEvent).external_url, '_blank');
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  const getImageUrl = () => {
    if (isExternal) {
      return (event as ExternalEvent).image_url;
    }
    // Fallback to category-based placeholder
    return 'https://images.unsplash.com/photo-1540575467063-178a50c2df87';
  };

  const getCategoryInfo = () => {
    if (isExternal) {
      const extEvent = event as ExternalEvent;
      return {
        name: extEvent.category || 'External Event',
        color: '#8B5CF6', // Purple for external events
      };
    }
    
    const localEvent = event as Event;
    return {
      name: localEvent.categories?.name || 'Event',
      color: localEvent.categories?.color || '#8B5CF6',
    };
  };

  const category = getCategoryInfo();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm">
        {/* Image Header */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={getImageUrl()}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Source Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              variant="secondary" 
              className="bg-black/20 text-white border-white/20 backdrop-blur-sm"
            >
              {isExternal ? (event as ExternalEvent).source : 'local'}
            </Badge>
          </div>
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <Badge 
              variant="secondary"
              style={{ 
                backgroundColor: category.color + '20', 
                color: category.color,
                borderColor: category.color + '40'
              }}
              className="backdrop-blur-sm"
            >
              {category.name}
            </Badge>
          </div>

          {/* Distance Badge */}
          {isExternal && (event as ExternalEvent).distance && (
            <div className="absolute bottom-3 left-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20 backdrop-blur-sm flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                {(event as ExternalEvent).distance!.toFixed(1)} mi
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.short_description || event.description}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 pb-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-primary" />
            <span>{eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 text-primary" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          
          {event.capacity && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <span>Capacity: {event.capacity}</span>
            </div>
          )}
          
          {/* Price Display */}
          <div className="flex items-center justify-between">
            {event.ticket_price !== null && event.ticket_price > 0 ? (
              <div className="text-xl font-bold text-green-600">
                ${event.ticket_price}
              </div>
            ) : (
              <div className="text-xl font-bold text-green-600">
                Free
              </div>
            )}
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>4.2</span>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="pt-0">
          <Button 
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            onClick={handleViewDetails}
          >
            {isExternal ? (
              <>
                <ExternalLink className="h-4 w-4 mr-2" />
                View on {(event as ExternalEvent).source}
              </>
            ) : (
              'View Details'
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
