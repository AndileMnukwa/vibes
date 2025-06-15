
-- Add foreign key relationship between review_responses and profiles
ALTER TABLE public.review_responses 
ADD CONSTRAINT review_responses_admin_user_id_fkey 
FOREIGN KEY (admin_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
