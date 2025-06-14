
import type { ExternalEvent, ExternalEventSource } from '@/types/external-events';
import type { LocationData } from '@/types/location';

const EVENTBRITE_API_URL = 'https://www.eventbriteapi.com/v3';
const MEETUP_API_URL = 'https://api.meetup.com';

export class ExternalEventService {
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
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

  private static async fetchEventbriteEvents(
    location: LocationData,
    radius: number = 25
  ): Promise<ExternalEvent[]> {
    try {
      // Note: In production, this would require proper API keys and CORS handling
      // For demo purposes, returning mock data
      const mockEvents: ExternalEvent[] = [
        {
          id: 'eb-1',
          source: 'eventbrite',
          title: 'Tech Conference 2024',
          description: 'Annual technology conference featuring the latest innovations',
          short_description: 'Annual tech conference with industry leaders',
          event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: `${location.city}, ${location.state}`,
          latitude: location.latitude + 0.01,
          longitude: location.longitude + 0.01,
          ticket_price: 299,
          capacity: 500,
          image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          external_url: 'https://eventbrite.com/event/tech-conference-2024',
          category: 'Technology',
          organizer: 'Tech Innovators',
        },
        {
          id: 'eb-2',
          source: 'eventbrite',
          title: 'Startup Networking Mixer',
          description: 'Connect with fellow entrepreneurs and investors',
          event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          location: `${location.city}, ${location.state}`,
          latitude: location.latitude - 0.02,
          longitude: location.longitude - 0.01,
          ticket_price: 0,
          capacity: 100,
          image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72',
          external_url: 'https://eventbrite.com/event/startup-mixer',
          category: 'Business',
          organizer: 'Startup Hub',
        },
      ];

      return mockEvents.map(event => ({
        ...event,
        distance: event.latitude && event.longitude 
          ? this.calculateDistance(
              location.latitude,
              location.longitude,
              event.latitude,
              event.longitude
            )
          : undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch Eventbrite events:', error);
      return [];
    }
  }

  private static async fetchMeetupEvents(
    location: LocationData,
    radius: number = 25
  ): Promise<ExternalEvent[]> {
    try {
      // Mock Meetup events
      const mockEvents: ExternalEvent[] = [
        {
          id: 'mu-1',
          source: 'meetup',
          title: 'React Developers Meetup',
          description: 'Monthly meetup for React developers to share knowledge and network',
          event_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          location: `${location.city}, ${location.state}`,
          latitude: location.latitude + 0.005,
          longitude: location.longitude - 0.005,
          ticket_price: 0,
          capacity: 50,
          image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8',
          external_url: 'https://meetup.com/react-developers',
          category: 'Technology',
          organizer: 'React Community',
        },
      ];

      return mockEvents.map(event => ({
        ...event,
        distance: event.latitude && event.longitude 
          ? this.calculateDistance(
              location.latitude,
              location.longitude,
              event.latitude,
              event.longitude
            )
          : undefined,
      }));
    } catch (error) {
      console.error('Failed to fetch Meetup events:', error);
      return [];
    }
  }

  static async fetchExternalEvents(
    location: LocationData,
    radius: number = 25,
    sources: ExternalEventSource[] = []
  ): Promise<ExternalEvent[]> {
    const enabledSources = sources.filter(source => source.enabled);
    const promises: Promise<ExternalEvent[]>[] = [];

    for (const source of enabledSources) {
      switch (source.type) {
        case 'eventbrite':
          promises.push(this.fetchEventbriteEvents(location, radius));
          break;
        case 'meetup':
          promises.push(this.fetchMeetupEvents(location, radius));
          break;
        default:
          console.warn(`Unsupported event source: ${source.type}`);
      }
    }

    try {
      const results = await Promise.all(promises);
      return results.flat().sort((a, b) => {
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
      });
    } catch (error) {
      console.error('Failed to fetch external events:', error);
      return [];
    }
  }
}
