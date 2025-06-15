
-- Enable Row Level Security on reviews table if not already enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews for events they attended" ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;

-- Create comprehensive RLS policies for reviews table

-- SELECT policy: Admins can see all reviews, users can see approved reviews and their own
CREATE POLICY "Reviews select policy" ON public.reviews
  FOR SELECT USING (
    -- Admin users can see all reviews
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
    OR
    -- Regular users can see approved reviews and their own reviews
    (status = 'approved' OR user_id = auth.uid())
  );

-- INSERT policy: Authenticated users can create reviews for themselves
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE policy: Users can update their own reviews, admins can update any review
CREATE POLICY "Reviews update policy" ON public.reviews
  FOR UPDATE USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- DELETE policy: Users can delete their own reviews, admins can delete any review
CREATE POLICY "Reviews delete policy" ON public.reviews
  FOR DELETE USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );
