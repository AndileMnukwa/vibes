
-- First, let's check if 'new_event' type already exists in the notification_type enum
-- and add it if it doesn't exist
DO $$ 
BEGIN
    -- Add 'new_event' to the notification_type enum if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = 'public.notification_type'::regtype 
        AND enumlabel = 'new_event'
    ) THEN
        ALTER TYPE public.notification_type ADD VALUE 'new_event';
    END IF;
END $$;

-- Create a function to get all regular user IDs (non-admin users)
CREATE OR REPLACE FUNCTION public.get_regular_user_ids()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN ARRAY(
    SELECT p.id 
    FROM profiles p
    LEFT JOIN user_roles ur ON p.id = ur.user_id
    WHERE ur.role IS NULL OR ur.role = 'user'
  );
END;
$$;

-- Create a function to notify users about new events
CREATE OR REPLACE FUNCTION public.notify_users_new_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_ids UUID[];
  user_id UUID;
BEGIN
  -- Only send notifications when an event is published (not draft)
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Get all regular user IDs
    user_ids := get_regular_user_ids();
    
    -- Create notification for each regular user
    FOREACH user_id IN ARRAY user_ids
    LOOP
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data
      ) VALUES (
        user_id,
        'new_event',
        'New Event Available',
        'A new event "' || NEW.title || '" has been published in your area!',
        jsonb_build_object(
          'event_id', NEW.id,
          'event_title', NEW.title,
          'event_date', NEW.event_date,
          'location', NEW.location,
          'category_id', NEW.category_id
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new/updated events
DROP TRIGGER IF EXISTS notify_users_on_event_publish ON public.events;
CREATE TRIGGER notify_users_on_event_publish
  AFTER INSERT OR UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_new_event();

-- Enable RLS on notifications table if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);
