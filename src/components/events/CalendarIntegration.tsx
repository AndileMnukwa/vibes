
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Download, ExternalLink, Plus } from 'lucide-react';
import { CalendarIntegration, CalendarEvent } from '@/utils/calendarIntegration';
import { toast } from '@/components/ui/use-toast';

interface CalendarIntegrationProps {
  event: {
    title: string;
    description: string;
    location: string;
    event_date: string;
    end_date?: string | null;
  };
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function CalendarIntegrationComponent({ event, variant = 'outline', size = 'sm' }: CalendarIntegrationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const calendarEvent: CalendarEvent = {
    title: event.title,
    description: event.description,
    location: event.location,
    startDate: new Date(event.event_date),
    endDate: event.end_date ? new Date(event.end_date) : undefined,
    url: window.location.href,
  };

  const handleDownloadICS = () => {
    try {
      CalendarIntegration.downloadICSFile(calendarEvent);
      toast({
        title: "Calendar file downloaded",
        description: "The event has been saved to your downloads folder.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download calendar file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCalendarLink = (url: string, service: string) => {
    window.open(url, '_blank');
    toast({
      title: "Opening calendar",
      description: `Redirecting to ${service} calendar...`,
    });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Plus className="h-4 w-4 mr-1" />
          Add to Calendar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          Download .ics file
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleCalendarLink(
            CalendarIntegration.getGoogleCalendarUrl(calendarEvent),
            'Google'
          )}
          className="cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleCalendarLink(
            CalendarIntegration.getOutlookCalendarUrl(calendarEvent),
            'Outlook'
          )}
          className="cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleCalendarLink(
            CalendarIntegration.getYahooCalendarUrl(calendarEvent),
            'Yahoo'
          )}
          className="cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Yahoo Calendar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
