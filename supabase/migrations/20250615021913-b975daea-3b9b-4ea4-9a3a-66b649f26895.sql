
-- Add new notification type for reviews
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_review';

-- Create function to get all admin user IDs
CREATE OR REPLACE FUNCTION get_admin_user_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT user_id 
    FROM user_roles 
    WHERE role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to notify admins of new reviews
CREATE OR REPLACE FUNCTION notify_admins_new_review()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for new review notifications
DROP TRIGGER IF EXISTS notify_admins_on_new_review ON reviews;
CREATE TRIGGER notify_admins_on_new_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_admins_new_review();

-- Enable realtime for notifications table
ALTER TABLE notifications REPLICA IDENTITY FULL;
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE notifications;
