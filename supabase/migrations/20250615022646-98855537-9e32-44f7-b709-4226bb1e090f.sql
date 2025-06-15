
-- Create review_responses table
CREATE TABLE public.review_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL,
  response_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for review_responses
ALTER TABLE public.review_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view review responses (since reviews are public)
CREATE POLICY "Anyone can view review responses" 
  ON public.review_responses 
  FOR SELECT 
  USING (true);

-- Policy: Only admins can create review responses
CREATE POLICY "Admins can create review responses" 
  ON public.review_responses 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can update their own review responses
CREATE POLICY "Admins can update their own review responses" 
  ON public.review_responses 
  FOR UPDATE 
  USING (
    admin_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete their own review responses
CREATE POLICY "Admins can delete their own review responses" 
  ON public.review_responses 
  FOR DELETE 
  USING (
    admin_user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_review_responses_review_id ON public.review_responses(review_id);
CREATE INDEX idx_review_responses_admin_user_id ON public.review_responses(admin_user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_review_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_review_responses_updated_at
  BEFORE UPDATE ON public.review_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_review_responses_updated_at();

-- Enable realtime for review_responses table
ALTER TABLE public.review_responses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.review_responses;
