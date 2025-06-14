
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Event = Tables<'events'>;

export const useEventSharing = () => {
  const handleWhatsAppShare = (event: Event) => {
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

  const handleGeneralShare = async (event: Event) => {
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

  return { handleWhatsAppShare, handleGeneralShare };
};
