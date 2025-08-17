-- Fix security issue: Restrict event_purchases table access to authenticated users only
-- Drop existing policies to recreate them with proper authentication checks
DROP POLICY IF EXISTS "Users can view own purchases" ON public.event_purchases;
DROP POLICY IF EXISTS "Service role can manage purchases" ON public.event_purchases;

-- Create more restrictive policies that explicitly require authentication
CREATE POLICY "Authenticated users can view own purchases only" 
ON public.event_purchases 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own purchases (needed for checkout)
CREATE POLICY "Authenticated users can create own purchases" 
ON public.event_purchases 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Service role policy for backend operations (Stripe webhooks, etc.)
CREATE POLICY "Service role can manage all purchases" 
ON public.event_purchases 
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Ensure no public access - revoke any public permissions
REVOKE ALL ON public.event_purchases FROM public;
REVOKE ALL ON public.event_purchases FROM anon;