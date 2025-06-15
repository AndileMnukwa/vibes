
import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

export const FullCalendarView = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { data: events = [], calendarEvents, isLoading } = useCalendarEvents();

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event.extendedProps.originalEvent;
    setSelectedEvent(event);
  };

  const handleDateClick = (arg: any) => {
    // You could add functionality to create events on date click
    console.log('Date clicked:', arg.dateStr);
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
  };

  const viewEventDetail = () => {
    if (selectedEvent) {
      navigate(`/events/${selectedEvent.id}`);
      setSelectedEvent(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Event Calendar</h1>
        </div>
        <Badge variant="secondary" className="text-sm">
          {events.length} Events
        </Badge>
      </div>

      <Card className="shadow-lg">
        <CardContent className="p-6">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            initialView="dayGridMonth"
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={3}
            moreLinkClick="popover"
            eventTimeFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: 'short'
            }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: 'short'
            }}
            nowIndicator={true}
            selectable={true}
            selectMirror={true}
            weekends={true}
            eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
            businessHours={{
              daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
              startTime: '08:00',
              endTime: '22:00',
            }}
            slotMinTime="06:00:00"
            slotMaxTime="24:00:00"
            expandRows={true}
            stickyHeaderDates={true}
            select={handleDateClick}
          />
        </CardContent>
      </Card>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-xl line-clamp-2">
                    {selectedEvent.title}
                  </CardTitle>
                  {selectedEvent.categories && (
                    <Badge 
                      variant="secondary"
                      style={{ 
                        backgroundColor: selectedEvent.categories.color + '20', 
                        color: selectedEvent.categories.color 
                      }}
                    >
                      {selectedEvent.categories.name}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeEventDetail}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {new Date(selectedEvent.event_date).toLocaleDateString()} at{' '}
                  {new Date(selectedEvent.event_date).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedEvent.location}
                </div>
                
                {selectedEvent.capacity && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    Capacity: {selectedEvent.capacity}
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <div className="pt-2">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {selectedEvent.ticket_price !== null && (
                <div className="pt-2">
                  <div className="text-lg font-semibold text-green-600">
                    {selectedEvent.ticket_price === 0 ? 'Free' : `$${selectedEvent.ticket_price}`}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={viewEventDetail} className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" onClick={closeEventDetail}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
