
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Registration = {
  id: string;
  user_id: string;
  attendance_status: string;
  created_at: string;
  profiles: {
    id: string;
    full_name: string | null;
    username: string | null;
  } | null;
};

type Event = Tables<'events'> & {
  categories: Tables<'categories'> | null;
  profiles: Tables<'profiles'> | null;
};

const AdminEventRegistrations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['admin-event', id],
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

  const { data: registrations, isLoading: registrationsLoading } = useQuery({
    queryKey: ['event-registrations', id],
    queryFn: async () => {
      if (!id) throw new Error('Event ID is required');
      
      const { data, error } = await supabase
        .from('user_event_attendance')
        .select(`
          *,
          profiles (
            id,
            full_name,
            username
          )
        `)
        .eq('event_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Registration[];
    },
    enabled: !!id,
  });

  const isLoading = eventLoading || registrationsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/events')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Event not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'going':
        return <Badge variant="default">Going</Badge>;
      case 'interested':
        return <Badge variant="secondary">Interested</Badge>;
      case 'attended':
        return <Badge variant="outline">Attended</Badge>;
      case 'not_going':
        return <Badge variant="destructive">Not Going</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/events')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      {/* Event Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(event.event_date).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Users className="mr-1 h-4 w-4" />
                  {registrations?.length || 0} registered
                  {event.capacity && ` / ${event.capacity} capacity`}
                </div>
              </div>
            </div>
            {event.categories && (
              <Badge
                variant="secondary"
                style={{ 
                  backgroundColor: event.categories.color + '20', 
                  color: event.categories.color 
                }}
              >
                {event.categories.name}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Registrations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registrations ({registrations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations && registrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registration Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((registration) => (
                  <TableRow key={registration.id}>
                    <TableCell className="font-medium">
                      {registration.profiles?.full_name || 
                       registration.profiles?.username || 
                       'Anonymous User'}
                    </TableCell>
                    <TableCell>
                      {getAttendanceStatusBadge(registration.attendance_status)}
                    </TableCell>
                    <TableCell>
                      {new Date(registration.created_at).toLocaleDateString()} at{' '}
                      {new Date(registration.created_at).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No registrations yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Users will appear here once they register for this event
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventRegistrations;
