
-- Create event_purchases table to track payments and registrations
CREATE TABLE public.event_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  ticket_quantity INTEGER DEFAULT 1,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id) -- Prevent duplicate purchases
);

-- Enable Row Level Security
ALTER TABLE public.event_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases" ON public.event_purchases 
FOR SELECT USING (auth.uid() = user_id);

-- Edge functions can insert and update purchases (using service role key)
CREATE POLICY "Service role can manage purchases" ON public.event_purchases 
FOR ALL USING (true);

-- Update the user_event_attendance table to link with purchases
ALTER TABLE public.user_event_attendance 
ADD COLUMN purchase_id UUID REFERENCES public.event_purchases(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_event_purchases_user_event ON public.event_purchases(user_id, event_id);
CREATE INDEX idx_event_purchases_stripe_session ON public.event_purchases(stripe_session_id);
