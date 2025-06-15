
-- Create push_subscriptions table for push notifications
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on push_subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for push_subscriptions
CREATE POLICY "Users can manage their own push subscriptions" 
  ON public.push_subscriptions 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_analytics table for tracking user behavior
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID,
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_analytics
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for user_analytics (allow users to insert their own data, admins to view all)
CREATE POLICY "Users can insert their own analytics" 
  ON public.user_analytics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own analytics" 
  ON public.user_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create user_sessions table for session tracking
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  page_views INTEGER NOT NULL DEFAULT 0,
  events_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY "Users can manage their own sessions" 
  ON public.user_sessions 
  FOR ALL 
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for better performance
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_event_type ON public.user_analytics(event_type);
CREATE INDEX idx_user_analytics_timestamp ON public.user_analytics(timestamp);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_id ON public.user_sessions(session_id);
