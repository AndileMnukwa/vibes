
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Users } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

interface EventDetailSidebarProps {
  event: Event;
}

export const EventDetailSidebar = ({ event }: EventDetailSidebarProps) => {
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

          <Button className="w-full" size="lg">
            {event.ticket_price && event.ticket_price > 0 ? 'Buy Ticket' : 'Register Free'}
          </Button>
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
