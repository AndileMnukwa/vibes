-- CRITICAL SECURITY FIXES

-- 1. Fix role escalation vulnerability in user_roles table
-- Drop existing policies that allow unsafe updates
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

-- Create safer update policy that prevents self-escalation
CREATE POLICY "Admins can update roles safely" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (
  -- Only admins can update roles
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
  -- And they cannot update their own role
  AND user_id != auth.uid()
)
WITH CHECK (
  -- Same conditions for the check
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
  AND user_id != auth.uid()
);

-- 2. Secure user_analytics table - restrict to user's own data only
DROP POLICY IF EXISTS "Users can view their own analytics" ON public.user_analytics;
CREATE POLICY "Users can view own analytics only" 
ON public.user_analytics 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analytics" ON public.user_analytics;
CREATE POLICY "Users can insert own analytics only" 
ON public.user_analytics 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add admin access to analytics for dashboard
CREATE POLICY "Admins can view all analytics" 
ON public.user_analytics 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 3. Secure user_sessions table - restrict to user's own data
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage own sessions only" 
ON public.user_sessions 
FOR ALL
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add admin access to sessions for monitoring
CREATE POLICY "Admins can view all sessions" 
ON public.user_sessions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- 4. Fix database functions security - add proper search_path
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_user_ids()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ARRAY(
    SELECT user_id 
    FROM public.user_roles 
    WHERE role = 'admin'::app_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_regular_user_ids()
RETURNS uuid[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN ARRAY(
    SELECT p.id 
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON p.id = ur.user_id
    WHERE ur.role IS NULL OR ur.role = 'user'::app_role
  );
END;
$$;