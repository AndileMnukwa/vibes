
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useTickets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all user tickets
  const { data: tickets, isLoading, error } = useQuery({
    queryKey: ['user-tickets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          events (
            title,
            event_date,
            location,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Download ticket PDF
  const downloadTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('generate-ticket', {
        body: { ticketId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, ticketId) => {
      // Create blob and download
      if (data instanceof ArrayBuffer) {
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${ticketId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Ticket Downloaded",
          description: "Your ticket PDF has been downloaded successfully.",
        });
      }
    },
    onError: (error) => {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create ticket for free events
  const createTicketMutation = useMutation({
    mutationFn: async ({ eventId, attendanceId }: { eventId: string; attendanceId?: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.functions.invoke('create-ticket', {
        body: {
          userId: user.id,
          eventId,
          attendanceId
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tickets', user?.id] });
      toast({
        title: "Ticket Created",
        description: "Your ticket has been generated successfully!",
      });
    },
    onError: (error) => {
      console.error('Ticket creation error:', error);
      toast({
        title: "Ticket Creation Failed",
        description: "There was an error creating your ticket. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    tickets: tickets || [],
    isLoading,
    error,
    downloadTicket: downloadTicketMutation.mutate,
    createTicket: createTicketMutation.mutate,
    isDownloading: downloadTicketMutation.isPending,
    isCreatingTicket: createTicketMutation.isPending,
  };
};
