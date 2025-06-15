import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useEventRegistration = (eventId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is registered for the event
  const { data: isRegistered, isLoading: checkingRegistration } = useQuery({
    queryKey: ['event-registration', eventId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_event_attendance')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!eventId,
  });

  // Check if user has a paid ticket for this event
  const { data: hasPaidTicket } = useQuery({
    queryKey: ['event-purchase', eventId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('event_purchases')
        .select('id, payment_status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .eq('payment_status', 'paid')
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!eventId,
  });

  // Check if user has a ticket for this event
  const { data: hasTicket } = useQuery({
    queryKey: ['event-ticket', eventId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('tickets')
        .select('id, validation_status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!eventId,
  });

  // Register for free event mutation
  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data: attendance, error } = await supabase
        .from('user_event_attendance')
        .insert({
          event_id: eventId,
          user_id: user.id,
          attendance_status: 'going'
        })
        .select()
        .single();

      if (error) throw error;

      // Create ticket for free event
      const { data: ticketData, error: ticketError } = await supabase.functions.invoke('create-ticket', {
        body: {
          userId: user.id,
          eventId,
          attendanceId: attendance.id
        }
      });

      if (ticketError) {
        console.error('Ticket creation failed:', ticketError);
        // Don't fail registration if ticket creation fails
      }

      return attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registration', eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket', eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-tickets', user?.id] });
      toast({
        title: "Registration Successful",
        description: "You have successfully registered for this event! Your ticket has been generated.",
      });
    },
    onError: (error) => {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering for this event. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Purchase ticket for paid event mutation
  const purchaseTicketMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { eventId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Unregister from event mutation
  const unregisterMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('user_event_attendance')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registration', eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['event-purchase', eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['event-ticket', eventId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-tickets', user?.id] });
      toast({
        title: "Unregistered Successfully",
        description: "You have been unregistered from this event.",
      });
    },
    onError: (error) => {
      console.error('Unregistration error:', error);
      toast({
        title: "Unregistration Failed",
        description: "There was an error unregistering from this event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const register = () => {
    registerMutation.mutate();
  };

  const purchaseTicket = () => {
    purchaseTicketMutation.mutate();
  };

  const unregister = () => {
    unregisterMutation.mutate();
  };

  return {
    isRegistered: !!isRegistered,
    hasPaidTicket: !!hasPaidTicket,
    hasTicket: !!hasTicket,
    isLoading: checkingRegistration || registerMutation.isPending || purchaseTicketMutation.isPending || unregisterMutation.isPending,
    register,
    purchaseTicket,
    unregister,
    error: registerMutation.error || purchaseTicketMutation.error || unregisterMutation.error,
  };
};
