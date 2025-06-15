
import React from 'react';
import Layout from '@/components/layout/Layout';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useTickets } from '@/hooks/useTickets';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, Calendar, MapPin } from 'lucide-react';

const MyTickets = () => {
  const { tickets, isLoading, downloadTicket, isDownloading } = useTickets();

  const upcomingTickets = tickets.filter(ticket => 
    ticket.events && new Date(ticket.events.event_date) > new Date()
  );
  
  const pastTickets = tickets.filter(ticket => 
    ticket.events && new Date(ticket.events.event_date) <= new Date()
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <div className="h-32">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
            <p className="text-muted-foreground">
              Manage and download your event tickets
            </p>
          </div>

          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Tickets Yet</h3>
            <p className="text-muted-foreground mb-6">
              Register for events to see your tickets here.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            Manage and download your event tickets ({tickets.length} total)
          </p>
        </div>

        {upcomingTickets.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-600" />
              Upcoming Events ({upcomingTickets.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onDownload={downloadTicket}
                  isDownloading={isDownloading}
                />
              ))}
            </div>
          </section>
        )}

        {pastTickets.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-gray-600" />
              Past Events ({pastTickets.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onDownload={downloadTicket}
                  isDownloading={isDownloading}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default MyTickets;
