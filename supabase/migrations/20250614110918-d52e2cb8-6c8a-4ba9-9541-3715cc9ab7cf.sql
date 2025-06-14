
-- Create enum types for better data integrity
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.notification_type AS ENUM ('new_event', 'review_response', 'event_reminder', 'system');

-- Create categories table for event categorization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  preferred_categories UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  category_id UUID REFERENCES public.categories(id),
  organizer_id UUID REFERENCES public.profiles(id) NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  capacity INTEGER,
  ticket_price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  status event_status DEFAULT 'draft',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  atmosphere_rating INTEGER CHECK (atmosphere_rating >= 1 AND atmosphere_rating <= 5),
  organization_rating INTEGER CHECK (organization_rating >= 1 AND organization_rating <= 5),
  value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
  sentiment_score DECIMAL(3,2), -- AI-generated sentiment score
  status review_status DEFAULT 'pending',
  helpful_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  verified_attendance BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Create review votes table for helpful votes
CREATE TABLE public.review_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Create user event attendance tracking
CREATE TABLE public.user_event_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  attendance_status TEXT DEFAULT 'interested' CHECK (attendance_status IN ('interested', 'going', 'attended', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, event_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_event_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read, admin write)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for events
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (status = 'published' OR organizer_id = auth.uid());
CREATE POLICY "Organizers can manage their events" ON public.events FOR ALL USING (organizer_id = auth.uid());
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT TO authenticated WITH CHECK (organizer_id = auth.uid());

-- RLS Policies for reviews
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR user_id = auth.uid());
CREATE POLICY "Users can create reviews for events they attended" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for review votes
CREATE POLICY "Users can view all review votes" ON public.review_votes FOR SELECT USING (true);
CREATE POLICY "Users can manage their own votes" ON public.review_votes FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can vote" ON public.review_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS Policies for attendance
CREATE POLICY "Users can view attendance for published events" ON public.user_event_attendance FOR SELECT USING (true);
CREATE POLICY "Users can manage their own attendance" ON public.user_event_attendance FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can track attendance" ON public.user_event_attendance FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert some default categories
INSERT INTO public.categories (name, description, color) VALUES
  ('Music', 'Live music performances and concerts', '#8B5CF6'),
  ('Food & Drink', 'Culinary experiences and tastings', '#F59E0B'),
  ('Arts & Culture', 'Art exhibitions, theater, and cultural events', '#EF4444'),
  ('Sports', 'Sporting events and competitions', '#10B981'),
  ('Technology', 'Tech conferences and workshops', '#3B82F6'),
  ('Business', 'Professional networking and business events', '#6B7280'),
  ('Community', 'Local community gatherings', '#F97316'),
  ('Education', 'Workshops, seminars, and learning events', '#8B5CF6');

-- Create function to update review helpful count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update helpful count
CREATE TRIGGER update_review_helpful_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.review_votes
  FOR EACH ROW EXECUTE FUNCTION public.update_review_helpful_count();
