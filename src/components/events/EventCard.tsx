
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Star } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();
  const eventDate = new Date(event.event_date);

  // Fetch reviews for this event to show average rating
  const { data: reviews = [] } = useQuery({
    queryKey: ['event-reviews', event.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('event_id', event.id)
        .eq('status', 'approved');

      if (error) throw error;
      return data;
    },
  });

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  
  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleViewDetails}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
          {event.categories && (
            <Badge 
              variant="secondary" 
              style={{ backgroundColor: event.categories.color + '20', color: event.categories.color }}
            >
              {event.categories.name}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.short_description || event.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2" />
          {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-2" />
          {event.location}
        </div>
        
        {event.capacity && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            Capacity: {event.capacity}
          </div>
        )}
        
        {event.ticket_price !== null && event.ticket_price > 0 && (
          <div className="text-lg font-semibold text-green-600">
            ${event.ticket_price}
          </div>
        )}

        {event.ticket_price === 0 && (
          <div className="text-lg font-semibold text-green-600">
            Free
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 mr-1" />
          {reviews.length > 0 ? (
            <span className="text-sm text-muted-foreground">
              {averageRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">No reviews yet</span>
          )}
        </div>
        <Button 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetails();
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
