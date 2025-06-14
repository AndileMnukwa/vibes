
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

interface EventDetailSidebarProps {
  event: Event;
}

export const EventDetailSidebar = ({ event }: EventDetailSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isRegistered, isLoading, register, unregister } = useEventRegistration(event.id);

  const handleRegistrationClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isRegistered) {
      unregister();
    } else {
      register();
    }
  };

  const getButtonText = () => {
    if (!user) return 'Sign In to Register';
    if (isLoading) return 'Processing...';
    if (isRegistered) return 'Registered';
    return event.ticket_price && event.ticket_price > 0 ? 'Buy Ticket' : 'Register Free';
  };

  const getButtonVariant = () => {
    if (isRegistered) return 'outline' as const;
    return 'default' as const;
  };

  // Check if event is in the past
  const isEventPast = new Date(event.event_date) < new Date();

  return (
    <div className="space-y-6">
      {/* Ticket Info */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.ticket_price !== null && event.ticket_price > 0 ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Price
              </span>
              <span className="text-lg font-semibold text-green-600">
                ${event.ticket_price}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Price
              </span>
              <span className="text-lg font-semibold text-green-600">
                Free
              </span>
            </div>
          )}

          {event.capacity && (
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Capacity
              </span>
              <span>{event.capacity} people</span>
            </div>
          )}

          <Separator />

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleRegistrationClick}
            disabled={isLoading || isEventPast}
            variant={getButtonVariant()}
          >
            {isRegistered && (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            {isEventPast ? 'Event Ended' : getButtonText()}
          </Button>

          {isRegistered && !isEventPast && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-red-600 hover:text-red-700"
              onClick={() => unregister()}
              disabled={isLoading}
            >
              Unregister
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Organizer Info */}
      {event.profiles && (
        <Card>
          <CardHeader>
            <CardTitle>Organizer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-medium">
                  {(event.profiles.full_name || event.profiles.username || 'A')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">
                  {event.profiles.full_name || event.profiles.username || 'Anonymous'}
                </p>
                {event.profiles.bio && (
                  <p className="text-sm text-muted-foreground">
                    {event.profiles.bio}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
