
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Users, CheckCircle, CreditCard, Download, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useTickets } from '@/hooks/useTickets';
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
  const { isRegistered, hasPaidTicket, hasTicket, isLoading, register, purchaseTicket, unregister } = useEventRegistration(event.id);
  const { tickets, downloadTicket, isDownloading } = useTickets();

  const isPaidEvent = event.ticket_price && event.ticket_price > 0;
  const isEventPast = new Date(event.event_date) < new Date();

  // Find the ticket for this specific event
  const eventTicket = tickets.find(ticket => ticket.event_id === event.id);

  const handleRegistrationClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (isPaidEvent) {
      if (hasPaidTicket) {
        // User already has a paid ticket, allow unregistration
        unregister();
      } else {
        // Initiate payment process
        purchaseTicket();
      }
    } else {
      // Free event
      if (isRegistered) {
        unregister();
      } else {
        register();
      }
    }
  };

  const getButtonText = () => {
    if (!user) return 'Sign In to Register';
    if (isLoading) return 'Processing...';
    
    if (isPaidEvent) {
      if (hasPaidTicket) return 'Purchased';
      return `Buy Ticket - $${event.ticket_price}`;
    } else {
      if (isRegistered) return 'Registered';
      return 'Register Free';
    }
  };

  const getButtonVariant = () => {
    if (isRegistered || hasPaidTicket) return 'outline' as const;
    return 'default' as const;
  };

  const getButtonIcon = () => {
    if (isRegistered || hasPaidTicket) return <CheckCircle className="mr-2 h-4 w-4" />;
    if (isPaidEvent) return <CreditCard className="mr-2 h-4 w-4" />;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Ticket Info */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPaidEvent ? (
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
            {getButtonIcon()}
            {isEventPast ? 'Event Ended' : getButtonText()}
          </Button>

          {/* Show ticket download button if user has a ticket */}
          {hasTicket && eventTicket && (
            <Button 
              variant="secondary" 
              size="lg" 
              className="w-full"
              onClick={() => downloadTicket(eventTicket.id)}
              disabled={isDownloading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? 'Generating...' : 'Download Ticket'}
            </Button>
          )}

          {(isRegistered || hasPaidTicket) && !isEventPast && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-red-600 hover:text-red-700"
              onClick={() => unregister()}
              disabled={isLoading}
            >
              {isPaidEvent ? 'Cancel Ticket' : 'Unregister'}
            </Button>
          )}

          {isPaidEvent && !hasPaidTicket && user && (
            <p className="text-sm text-muted-foreground text-center">
              Secure payment processed by Stripe
            </p>
          )}

          {hasTicket && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <Ticket className="w-4 h-4" />
              <span>Ticket Available</span>
            </div>
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
