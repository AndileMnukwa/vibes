
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react';
import { useEventsData } from '@/components/events/hooks/useEventsData';
import { useNavigate } from 'react-router-dom';
import { EnhancedEventCard } from '@/components/events/EnhancedEventCard';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { localEvents, externalEvents, isLoading } = useEventsData();
  const navigate = useNavigate();

  // Combine local and external events
  const allEvents = [...localEvents, ...externalEvents];

  // Get events for the selected date
  const selectedDateEvents = allEvents.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate.toDateString() === selectedDate.toDateString();
  });

  // Get events for the current month to show on calendar
  const monthEvents = allEvents.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate.getMonth() === currentMonth.getMonth() && 
           eventDate.getFullYear() === currentMonth.getFullYear();
  });

  // Create a map of dates that have events
  const eventDates = monthEvents.reduce((acc, event) => {
    const eventDate = new Date(event.event_date);
    const dateStr = eventDate.toDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(event);
    return acc;
  }, {} as Record<string, typeof allEvents>);

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const formatEventTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <CalendarIcon className="h-8 w-8 text-purple-600" />
          Event Calendar
        </h1>
        <p className="text-muted-foreground">
          View and explore events in calendar format
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">
                  {currentMonth.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handlePreviousMonth}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleNextMonth}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                modifiers={{
                  hasEvents: (date) => {
                    return Object.keys(eventDates).includes(date.toDateString());
                  }
                }}
                modifiersStyles={{
                  hasEvents: {
                    backgroundColor: 'rgba(147, 51, 234, 0.1)',
                    color: 'rgb(147, 51, 234)',
                    fontWeight: 'bold'
                  }
                }}
                className="w-full"
              />
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
                <span>Days with events</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Events on {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No events scheduled for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((event, index) => (
                    <div
                      key={`${event.id}-${index}`}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => {
                        if ('external_url' in event) {
                          window.open(event.external_url, '_blank');
                        } else {
                          navigate(`/events/${event.id}`);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium line-clamp-2 flex-1 pr-2">
                          {event.title}
                        </h4>
                        {'source' in event && (
                          <Badge variant="outline" className="text-xs">
                            {event.source}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatEventTime(event.event_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {event.ticket_price !== null && event.ticket_price > 0 ? (
                        <Badge variant="secondary" className="mt-2 text-green-600">
                          ${event.ticket_price}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="mt-2 text-green-600">
                          Free
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Events Overview */}
      {monthEvents.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>
                All Events in {currentMonth.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthEvents.slice(0, 6).map((event, index) => (
                  <EnhancedEventCard
                    key={`${event.id}-${index}`}
                    event={event}
                    isExternal={'source' in event}
                  />
                ))}
              </div>
              {monthEvents.length > 6 && (
                <div className="text-center mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/')}
                  >
                    View All {monthEvents.length} Events
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
