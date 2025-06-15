
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Download, QrCode } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Ticket = Tables<'tickets'> & {
  events: {
    title: string;
    event_date: string;
    location: string;
    image_url: string | null;
  } | null;
};

interface TicketCardProps {
  ticket: Ticket;
  onDownload: (ticketId: string) => void;
  isDownloading: boolean;
}

export const TicketCard = ({ ticket, onDownload, isDownloading }: TicketCardProps) => {
  if (!ticket.events) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const eventDate = new Date(ticket.events.event_date);
  const isUpcoming = eventDate > new Date();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {ticket.events.image_url && (
          <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500 relative">
            <img 
              src={ticket.events.image_url} 
              alt={ticket.events.title}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-black bg-opacity-20" />
          </div>
        )}
        <Badge 
          className={`absolute top-2 right-2 ${getStatusColor(ticket.validation_status)}`}
        >
          {ticket.validation_status.toUpperCase()}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {ticket.events.title}
        </CardTitle>
        <div className="text-sm text-muted-foreground font-mono">
          Ticket #{ticket.ticket_number}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="line-clamp-1">{ticket.events.location}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(ticket.id)}
            disabled={isDownloading}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download PDF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="px-3"
            title="QR Code"
          >
            <QrCode className="w-4 h-4" />
          </Button>
        </div>

        {!isUpcoming && ticket.validation_status === 'valid' && (
          <div className="text-xs text-muted-foreground">
            This event has passed. Your ticket is still valid for records.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
