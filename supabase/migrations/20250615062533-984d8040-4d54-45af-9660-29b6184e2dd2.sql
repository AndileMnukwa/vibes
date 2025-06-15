
-- Create tickets table to store ticket information
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  purchase_id UUID REFERENCES public.event_purchases(id) ON DELETE SET NULL,
  attendance_id UUID REFERENCES public.user_event_attendance(id) ON DELETE SET NULL,
  qr_code_data TEXT NOT NULL,
  validation_status TEXT DEFAULT 'valid' CHECK (validation_status IN ('valid', 'used', 'expired', 'invalid')),
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.tickets 
FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all tickets (for edge functions)
CREATE POLICY "Service role can manage tickets" ON public.tickets 
FOR ALL USING (true);

-- Organizers can validate tickets for their events
CREATE POLICY "Organizers can validate event tickets" ON public.tickets 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = tickets.event_id 
    AND events.organizer_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX idx_tickets_event_id ON public.tickets(event_id);
CREATE INDEX idx_tickets_ticket_number ON public.tickets(ticket_number);
CREATE INDEX idx_tickets_qr_code ON public.tickets(qr_code_data);

-- Function to generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate ticket number: TKT-YYYYMMDD-XXXXXX (where X is random)
    new_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                  UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Check if this number already exists
    SELECT EXISTS(SELECT 1 FROM tickets WHERE ticket_number = new_number) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_number;
END;
$$;
