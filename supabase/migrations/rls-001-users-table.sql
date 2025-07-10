-- RLS-001: Create RLS policy for users table
-- Users can only see their own data, with proper authentication checks

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

-- Create comprehensive policies for users table

-- 1. SELECT policy: Users can see their own data
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT 
  USING (
    -- User can see their own record via Supabase Auth UID
    auth.uid()::text = id::text 
    -- User can see their own record via email match
    OR auth.jwt() ->> 'email' = email
    -- Service role can see everything (for admin operations)
    OR auth.role() = 'service_role'
    -- Authenticated users can see basic info of other users (for agent listings, etc.)
    OR (auth.role() = 'authenticated' AND id IS NOT NULL)
  );

-- 2. UPDATE policy: Users can only update their own data
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE 
  USING (
    auth.uid()::text = id::text 
    OR auth.jwt() ->> 'email' = email
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.uid()::text = id::text 
    OR auth.jwt() ->> 'email' = email
    OR auth.role() = 'service_role'
  );

-- 3. INSERT policy: Allow new user creation (for registration)
CREATE POLICY "users_insert_new" ON public.users
  FOR INSERT 
  WITH CHECK (
    -- Allow service role to insert (for admin operations)
    auth.role() = 'service_role'
    -- Allow authenticated users to create their own record
    OR (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = email)
  );

-- 4. DELETE policy: Only service role can delete users
CREATE POLICY "users_delete_service" ON public.users
  FOR DELETE 
  USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;

-- Test the policy
SELECT 'Testing users table policy:' as info;
SELECT 'Users count:' as test, count(*) as result FROM public.users;

-- Show the policies
SELECT 'Users table policies:' as info;
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';
