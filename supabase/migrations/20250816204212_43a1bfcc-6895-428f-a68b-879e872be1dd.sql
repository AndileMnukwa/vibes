-- Fix security vulnerability: Restrict profiles table access to authenticated users
-- This replaces the overly permissive "Users can view all profiles" policy

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more secure policy that only allows authenticated users to view profiles
-- This maintains social functionality while protecting from unauthenticated access
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Also ensure we have proper policies for profile updates and inserts
-- (These should already exist but let's make sure they're properly secured)

-- Recreate insert policy to ensure it's properly restricted
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Recreate update policy to ensure it's properly restricted  
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);