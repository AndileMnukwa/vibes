import { useState, useCallback } from 'react';
import type { ExternalEvent, ExternalEventSource } from '@/types/external-events';
import type { LocationData } from '@/types/location';

interface EventbriteEvent {
  id: string;
  name: {
    text: string;
  };
  description: {
    text: string;
  };
  start: {
    utc: string;
  };
  venue?: {
    name: string;
    address: {
      city: string;
      region: string;
    };
  };
  ticket_availability?: {
    minimum_ticket_price?: {
      value: number;
    };
  };
  capacity?: number;
  logo?: {
    url: string;
  };
  url: string;
  organizer: {
    name: string;
  };
  category?: {
    name: string;
  };
}

interface MeetupEvent {
  id: string;
  name: string;
  description: string;
  time: number;
  venue?: {
    name: string;
    city: string;
    state: string;
    lat: number;
    lon: number;
  };
  fee?: {
    amount: number;
  };
  rsvp_limit?: number;
  featured_photo?: {
    photo_link: string;
  };
  link: string;
  group: {
    name: string;
  };
  category?: {
    name: string;
  };
}

export function useExternalEventAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transformEventbriteEvent = useCallback((event: EventbriteEvent, location: LocationData): ExternalEvent => {
    return {
      id: event.id,
      source: 'eventbrite',
      title: event.name.text,
      description: event.description.text,
      event_date: event.start.utc,
      location: event.venue ? `${event.venue.name}, ${event.venue.address.city}, ${event.venue.address.region}` : 'Location TBA',
      ticket_price: event.ticket_availability?.minimum_ticket_price?.value || 0,
      capacity: event.capacity,
      image_url: event.logo?.url,
      external_url: event.url,
      category: event.category?.name,
      organizer: event.organizer.name,
    };
  }, []);

  const transformMeetupEvent = useCallback((event: MeetupEvent, location: LocationData): ExternalEvent => {
    return {
      id: event.id,
      source: 'meetup',
      title: event.name,
      description: event.description,
      event_date: new Date(event.time).toISOString(),
      location: event.venue ? `${event.venue.name}, ${event.venue.city}, ${event.venue.state}` : 'Location TBA',
      latitude: event.venue?.lat,
      longitude: event.venue?.lon,
      ticket_price: event.fee?.amount || 0,
      capacity: event.rsvp_limit,
      image_url: event.featured_photo?.photo_link,
      external_url: event.link,
      category: event.category?.name,
      organizer: event.group.name,
    };
  }, []);

  const fetchEventbriteEvents = useCallback(async (
    location: LocationData,
    radius: number = 25,
    apiToken?: string
  ): Promise<ExternalEvent[]> => {
    if (!apiToken) {
      console.warn('Eventbrite API token not provided, using mock data');
      return [];
    }

    try {
      const response = await fetch(
        `https://www.eventbriteapi.com/v3/events/search/?location.latitude=${location.latitude}&location.longitude=${location.longitude}&location.within=${radius}km&expand=venue,ticket_availability,organizer,category&start_date.range_start=${new Date().toISOString()}&page_size=50`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Eventbrite API error: ${response.status}`);
      }

      const data = await response.json();
      return data.events?.map((event: EventbriteEvent) => transformEventbriteEvent(event, location)) || [];
    } catch (error) {
      console.error('Error fetching Eventbrite events:', error);
      throw error;
    }
  }, [transformEventbriteEvent]);

  const fetchMeetupEvents = useCallback(async (
    location: LocationData,
    radius: number = 25,
    apiToken?: string
  ): Promise<ExternalEvent[]> => {
    if (!apiToken) {
      console.warn('Meetup API token not provided, using mock data');
      return [];
    }

    try {
      const response = await fetch(
        `https://api.meetup.com/find/events?lat=${location.latitude}&lon=${location.longitude}&radius=${radius}&page=50`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Meetup API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map((event: MeetupEvent) => transformMeetupEvent(event, location));
    } catch (error) {
      console.error('Error fetching Meetup events:', error);
      throw error;
    }
  }, [transformMeetupEvent]);

  const fetchExternalEvents = useCallback(async (
    location: LocationData | null,
    radius: number = 25,
    sources: ExternalEventSource[] = [],
    apiTokens: { eventbrite?: string; meetup?: string } = {}
  ): Promise<ExternalEvent[]> => {
    if (!location) {
      console.warn('No location provided for external events');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const enabledSources = sources.filter(source => source.enabled);
      const promises: Promise<ExternalEvent[]>[] = [];

      for (const source of enabledSources) {
        switch (source.type) {
          case 'eventbrite':
            if (apiTokens.eventbrite) {
              promises.push(fetchEventbriteEvents(location, radius, apiTokens.eventbrite));
            }
            break;
          case 'meetup':
            if (apiTokens.meetup) {
              promises.push(fetchMeetupEvents(location, radius, apiTokens.meetup));
            }
            break;
          default:
            console.warn(`Unsupported event source: ${source.type}`);
        }
      }

      const results = await Promise.all(promises);
      const allEvents = results.flat();

      // Calculate distances
      const eventsWithDistance = allEvents.map(event => ({
        ...event,
        distance: event.latitude && event.longitude 
          ? calculateDistance(location.latitude, location.longitude, event.latitude, event.longitude)
          : undefined,
      }));

      // Sort by distance and date
      eventsWithDistance.sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      });

      return eventsWithDistance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch external events';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [fetchEventbriteEvents, fetchMeetupEvents]);

  return {
    fetchExternalEvents,
    loading,
    error,
  };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}