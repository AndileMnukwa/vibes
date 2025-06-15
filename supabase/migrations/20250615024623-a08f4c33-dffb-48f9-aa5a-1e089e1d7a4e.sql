
-- Update the trigger function to use SECURITY DEFINER (this is the key fix)
CREATE OR REPLACE FUNCTION public.notify_admins_new_review()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
DECLARE
  admin_ids UUID[];
  admin_id UUID;
  event_title TEXT;
BEGIN
  -- Get event title for the notification
  SELECT title INTO event_title FROM events WHERE id = NEW.event_id;
  
  -- Get all admin user IDs
  admin_ids := get_admin_user_ids();
  
  -- Create notification for each admin
  FOREACH admin_id IN ARRAY admin_ids
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      admin_id,
      'new_review',
      'New Review Submitted',
      'A new review has been submitted for "' || COALESCE(event_title, 'Unknown Event') || '"',
      jsonb_build_object(
        'review_id', NEW.id,
        'event_id', NEW.event_id,
        'rating', NEW.rating,
        'event_title', event_title
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Check if we need to add an INSERT policy for notifications
DO $$
BEGIN
  -- Try to create the INSERT policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'notifications' 
    AND policyname = 'System can insert notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true)';
  END IF;
END
$$;
