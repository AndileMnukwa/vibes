-- Fix remaining function security issues - add search_path to all remaining functions

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_admins_new_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_ids UUID[];
  admin_id UUID;
  event_title TEXT;
BEGIN
  -- Get event title for the notification
  SELECT title INTO event_title FROM public.events WHERE id = NEW.event_id;
  
  -- Get all admin user IDs
  admin_ids := public.get_admin_user_ids();
  
  -- Create notification for each admin
  FOREACH admin_id IN ARRAY admin_ids
  LOOP
    INSERT INTO public.notifications (
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

CREATE OR REPLACE FUNCTION public.notify_users_new_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_ids UUID[];
  user_id UUID;
BEGIN
  -- Only send notifications when an event is published (not draft)
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    -- Get all regular user IDs
    user_ids := public.get_regular_user_ids();
    
    -- Create notification for each regular user
    FOREACH user_id IN ARRAY user_ids
    LOOP
      INSERT INTO public.notifications (
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

CREATE OR REPLACE FUNCTION public.award_user_badges()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Award "First Review" badge
  IF TG_TABLE_NAME = 'reviews' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description, badge_icon, points_awarded)
    SELECT NEW.user_id, 'milestone', 'First Review', 'Wrote your first event review!', '📝', 10
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_badges 
      WHERE user_id = NEW.user_id AND badge_type = 'milestone' AND badge_name = 'First Review'
    );
    
    -- Award "Review Champion" badge for 10 reviews
    IF (SELECT COUNT(*) FROM public.reviews WHERE user_id = NEW.user_id) >= 10 THEN
      INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description, badge_icon, points_awarded)
      SELECT NEW.user_id, 'achievement', 'Review Champion', 'Wrote 10+ event reviews!', '🏆', 50
      WHERE NOT EXISTS (
        SELECT 1 FROM public.user_badges 
        WHERE user_id = NEW.user_id AND badge_type = 'achievement' AND badge_name = 'Review Champion'
      );
    END IF;
  END IF;
  
  -- Award "Social Butterfly" badge for first follow
  IF TG_TABLE_NAME = 'user_follows' AND TG_OP = 'INSERT' THEN
    INSERT INTO public.user_badges (user_id, badge_type, badge_name, badge_description, badge_icon, points_awarded)
    SELECT NEW.follower_id, 'social', 'Social Butterfly', 'Followed your first user!', '🦋', 5
    WHERE NOT EXISTS (
      SELECT 1 FROM public.user_badges 
      WHERE user_id = NEW.follower_id AND badge_type = 'social' AND badge_name = 'Social Butterfly'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count + (CASE WHEN NEW.is_helpful THEN 1 ELSE 0 END)
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count + 
      (CASE WHEN NEW.is_helpful THEN 1 ELSE 0 END) - 
      (CASE WHEN OLD.is_helpful THEN 1 ELSE 0 END)
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.reviews 
    SET helpful_count = helpful_count - (CASE WHEN OLD.is_helpful THEN 1 ELSE 0 END)
    WHERE id = OLD.review_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.update_review_responses_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;