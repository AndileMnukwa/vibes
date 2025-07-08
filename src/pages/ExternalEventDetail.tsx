import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, ExternalLink } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useExternalEventDetail } from '@/hooks/useExternalEventDetail';
import { ShareButton } from '@/components/social/ShareButton';
import { CalendarIntegrationComponent } from '@/components/events/CalendarIntegration';
import { motion } from 'framer-motion';

export default function ExternalEventDetail() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const navigate = useNavigate();
  const { event, loading, error } = useExternalEventDetail(source!, id!);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded-lg mb-6"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
              <div className="space-y-4">
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
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
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The external event you're looking for could not be found.
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {event.image_url && (
              <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="capitalize">
                    {event.source}
                  </Badge>
                </div>
              </div>
            )}

            {/* Event Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {event.title}
                  </h1>
                  {event.organizer && (
                    <p className="text-lg text-muted-foreground">
                      by {event.organizer}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <ShareButton
                    eventId={`${event.source}-${event.id}`}
                    eventTitle={event.title}
                  />
                  <CalendarIntegrationComponent
                    event={{
                      title: event.title,
                      description: event.description,
                      location: event.location,
                      event_date: event.event_date,
                      end_date: null,
                    }}
                  />
                  <Button asChild>
                    <a
                      href={event.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on {event.source}
                    </a>
                  </Button>
                </div>
              </div>

              {event.category && (
                <Badge variant="outline" className="mb-4">
                  {event.category}
                </Badge>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">About this event</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Event Details Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Event Details</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">
                          {eventDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {eventDate.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">{event.location}</p>
                        {event.distance && (
                          <p className="text-sm text-muted-foreground">
                            {event.distance.toFixed(1)} miles away
                          </p>
                        )}
                      </div>
                    </div>

                    {event.ticket_price !== undefined && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {event.ticket_price === 0
                              ? 'Free'
                              : `$${event.ticket_price}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {event.capacity && (
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            Up to {event.capacity} attendees
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* External Link Card */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Get Tickets</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Tickets and registration are handled on {event.source}.
                  </p>
                  <Button asChild className="w-full">
                    <a
                      href={event.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Register on {event.source}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}