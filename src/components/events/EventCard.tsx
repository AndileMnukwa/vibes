
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
    <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer border border-border/50 hover:border-coral/30 bg-card hover:bg-gradient-to-br hover:from-card hover:to-coral/5 group" onClick={handleViewDetails}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-coral transition-colors">{event.title}</CardTitle>
          {event.categories && (
            <Badge 
              variant="secondary" 
              className="ml-2 border border-coral/30 bg-coral/10 text-coral"
              style={{ 
                backgroundColor: event.categories.color + '15', 
                color: event.categories.color,
                borderColor: event.categories.color + '30'
              }}
            >
              {event.categories.name}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.short_description || event.description}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3 py-3">
        <div className="flex items-center text-sm text-muted-foreground hover-coral-bg p-2 rounded-md transition-colors">
          <Calendar className="h-4 w-4 mr-2 text-coral" />
          {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground hover-coral-bg p-2 rounded-md transition-colors">
          <MapPin className="h-4 w-4 mr-2 text-coral" />
          {event.location}
        </div>
        
        {event.capacity && (
          <div className="flex items-center text-sm text-muted-foreground hover-coral-bg p-2 rounded-md transition-colors">
            <Users className="h-4 w-4 mr-2 text-coral" />
            Capacity: {event.capacity}
          </div>
        )}
        
        {event.ticket_price !== null && event.ticket_price > 0 && (
          <div className="text-lg font-semibold text-coral">
            ${event.ticket_price}
          </div>
        )}

        {event.ticket_price === 0 && (
          <div className="text-lg font-semibold text-coral">
            Free
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-3">
        <div className="flex items-center">
          <Star className="h-4 w-4 text-coral mr-1" />
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
          className="bg-coral hover:bg-coral-dark transition-colors"
        >
          View Details
        </Button>
      </CardFooter>
      
      {/* Coral accent bottom border */}
      <div className="h-1 bg-coral-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Card>
  );
};

export default EventCard;
