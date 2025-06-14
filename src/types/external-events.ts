
export interface ExternalEventSource {
  id: string;
  name: string;
  type: 'eventbrite' | 'meetup' | 'facebook' | 'ticketmaster';
  enabled: boolean;
}

export interface ExternalEvent {
  id: string;
  source: ExternalEventSource['type'];
  title: string;
  description: string;
  short_description?: string;
  event_date: string;
  location: string;
  latitude?: number;
  longitude?: number;
  ticket_price?: number;
  capacity?: number;
  image_url?: string;
  external_url: string;
  category?: string;
  organizer?: string;
  distance?: number;
}
