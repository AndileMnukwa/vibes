import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CalendarIntegrationComponent } from '@/components/events/CalendarIntegration';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  ArrowLeft, 
  Share2,
  Heart,
  MessageCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      if (!id) throw new Error('Event ID is required');
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          categories (*),
          profiles (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!id,
  });

  const handleWhatsAppShare = () => {
    if (!event) return;

    const eventDate = new Date(event.event_date);
    const eventUrl = `${window.location.origin}/events/${event.id}`;
    
    const message = `🎉 Check out this event: *${event.title}*

📅 Date: ${eventDate.toLocaleDateString()} at ${eventDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}
📍 Location: ${event.location}
${event.ticket_price && event.ticket_price > 0 ? `💰 Price: $${event.ticket_price}` : '🆓 Free Event'}

${event.description ? event.description.substring(0, 100) + '...' : ''}

View details: ${eventUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "Shared to WhatsApp",
      description: "Opening WhatsApp to share this event",
    });
  };

  const handleGeneralShare = async () => {
    if (!event) return;

    const eventUrl = `${window.location.origin}/events/${event.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: eventUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(eventUrl);
        toast({
          title: "Link copied",
          description: "Event link copied to clipboard",
        });
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !event) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The event you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const eventDate = new Date(event.event_date);
  const endDate = event.end_date ? new Date(event.end_date) : null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    {endDate && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Until {endDate.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <CalendarIntegrationComponent 
                    event={{
                      title: event.title,
                      description: event.description,
                      location: event.location,
                      event_date: event.event_date,
                      end_date: event.end_date,
                    }}
                  />
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleWhatsAppShare}
                    className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGeneralShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {event.categories && (
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: event.categories.color + '20', 
                    color: event.categories.color 
                  }}
                  className="mb-4"
                >
                  {event.categories.name}
                </Badge>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </div>
                {event.capacity && (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {event.capacity} spots
                  </div>
                )}
                {event.profiles && (
                  <div>
                    Organized by {event.profiles.full_name || event.profiles.username || 'Anonymous'}
                  </div>
                )}
              </div>
            </div>

            <Separator />

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

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>
              <ReviewsList eventId={event.id} />
            </div>
          </div>

          {/* Sidebar */}
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
        </div>
      </div>
    </Layout>
  );
};

export default EventDetail;
