
-- Drop existing restrictive policies that prevent initial admin creation
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;

-- Create new policy to allow first admin creation when no admins exist
CREATE POLICY "Allow first admin creation" ON public.user_roles
  FOR INSERT WITH CHECK (
    role = 'admin' AND 
    NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') AND
    auth.uid() = user_id
  );

-- Allow users to insert their own default 'user' role
CREATE POLICY "Users can insert their own user role" ON public.user_roles
  FOR INSERT WITH CHECK (
    role = 'user' AND 
    auth.uid() = user_id
  );

-- Recreate admin management policies (these will work after first admin is created)
CREATE POLICY "Admins can insert any role" ON public.user_roles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
