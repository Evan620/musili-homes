-- RLS-003: Create RLS policy for properties table
-- This is the CRITICAL policy that fixes our main data fetching issue
-- Properties should be publicly viewable, agents can manage their own, admins can manage all

-- Drop existing policies for properties table
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON public.properties;
DROP POLICY IF EXISTS "Allow all access to properties" ON public.properties;
DROP POLICY IF EXISTS "properties_public_select" ON public.properties;
DROP POLICY IF EXISTS "properties_agents_insert" ON public.properties;
DROP POLICY IF EXISTS "properties_agents_update" ON public.properties;
DROP POLICY IF EXISTS "properties_admins_all" ON public.properties;

-- 1. PUBLIC SELECT policy: Properties are publicly viewable (CRITICAL FIX)
-- This allows anonymous users and everyone to view properties
CREATE POLICY "properties_public_select" ON public.properties
  FOR SELECT 
  USING (true); -- Allow EVERYONE to view properties (public listings)

-- 2. AGENT INSERT policy: Agents can create new properties
CREATE POLICY "properties_agents_insert" ON public.properties
  FOR INSERT 
  WITH CHECK (
    -- Service role can insert anything
    auth.role() = 'service_role'
    -- Authenticated agents can insert properties assigned to them
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users 
        WHERE id = agent_id AND role = 'agent'
      )
    )
  );

-- 3. AGENT UPDATE policy: Agents can update their own properties
CREATE POLICY "properties_agents_update" ON public.properties
  FOR UPDATE 
  USING (
    -- Service role can update anything
    auth.role() = 'service_role'
    -- Agents can update properties assigned to them
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users 
        WHERE id = agent_id
      )
    )
  )
  WITH CHECK (
    -- Service role can update anything
    auth.role() = 'service_role'
    -- Agents can update properties assigned to them
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users 
        WHERE id = agent_id
      )
    )
  );

-- 4. ADMIN ALL policy: Admins can do everything with properties
CREATE POLICY "properties_admins_all" ON public.properties
  FOR ALL 
  USING (
    -- Service role can do everything
    auth.role() = 'service_role'
    -- Admins can do everything
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  )
  WITH CHECK (
    -- Service role can do everything
    auth.role() = 'service_role'
    -- Admins can do everything
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- 5. AGENT DELETE policy: Agents can delete their own properties
CREATE POLICY "properties_agents_delete" ON public.properties
  FOR DELETE 
  USING (
    -- Service role can delete anything
    auth.role() = 'service_role'
    -- Agents can delete their own properties
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users 
        WHERE id = agent_id
      )
    )
  );

-- Grant necessary permissions
-- CRITICAL: Grant SELECT to anon users for public property viewing
GRANT SELECT ON public.properties TO anon;
GRANT SELECT ON public.properties TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.properties TO authenticated;

-- Test the policy (this should work now!)
SELECT 'Testing properties table policy:' as info;
SELECT 'Properties count:' as test, count(*) as result FROM public.properties;
SELECT 'Featured properties count:' as test, count(*) as result FROM public.properties WHERE featured = true;

-- Show sample properties to verify access
SELECT 'Sample properties:' as info;
SELECT id, title, location, featured, status FROM public.properties LIMIT 3;

-- Show the policies
SELECT 'Properties table policies:' as info;
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'properties';
