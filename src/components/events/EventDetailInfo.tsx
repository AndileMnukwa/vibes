
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

interface EventDetailInfoProps {
  event: Event;
}

export const EventDetailInfo = ({ event }: EventDetailInfoProps) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>About This Event</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{event.description}</p>
          {event.tags && event.tags.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location Details */}
      {event.address && (
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-1" />
              <div>
                <p className="font-medium">{event.location}</p>
                <p className="text-muted-foreground">{event.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
