-- RLS-002: Create RLS policy for agents table
-- Agents can see their own profile and basic info of other agents

-- Drop existing policies for agents table
DROP POLICY IF EXISTS "Agents can view own data" ON public.agents;
DROP POLICY IF EXISTS "agents_select_own" ON public.agents;
DROP POLICY IF EXISTS "agents_update_own" ON public.agents;
DROP POLICY IF EXISTS "agents_insert_own" ON public.agents;

-- Create comprehensive policies for agents table

-- 1. SELECT policy: Agents can see their own profile + basic info of others
CREATE POLICY "agents_select_own" ON public.agents
  FOR SELECT 
  USING (
    -- Agent can see their own profile via Supabase Auth UID
    auth.uid()::text = id::text 
    -- Agent can see their own profile via email match
    OR auth.jwt() ->> 'email' IN (
      SELECT email FROM public.users WHERE id = agents.id
    )
    -- Service role can see everything (for admin operations)
    OR auth.role() = 'service_role'
    -- Authenticated users can see basic agent info (for public agent listings)
    OR (auth.role() = 'authenticated' AND id IS NOT NULL)
    -- Anonymous users can see basic agent info (for public agent listings)
    OR auth.role() = 'anon'
  );

-- 2. UPDATE policy: Agents can only update their own profile
CREATE POLICY "agents_update_own" ON public.agents
  FOR UPDATE 
  USING (
    auth.uid()::text = id::text 
    OR auth.jwt() ->> 'email' IN (
      SELECT email FROM public.users WHERE id = agents.id
    )
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.uid()::text = id::text 
    OR auth.jwt() ->> 'email' IN (
      SELECT email FROM public.users WHERE id = agents.id
    )
    OR auth.role() = 'service_role'
  );

-- 3. INSERT policy: Allow new agent profile creation
CREATE POLICY "agents_insert_own" ON public.agents
  FOR INSERT 
  WITH CHECK (
    -- Allow service role to insert (for admin operations)
    auth.role() = 'service_role'
    -- Allow authenticated users to create their own agent profile
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = agents.id AND role = 'agent'
      )
    )
  );

-- 4. DELETE policy: Only service role can delete agents
CREATE POLICY "agents_delete_service" ON public.agents
  FOR DELETE 
  USING (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON public.agents TO anon, authenticated;
GRANT INSERT ON public.agents TO authenticated;
GRANT UPDATE ON public.agents TO authenticated;

-- Test the policy
SELECT 'Testing agents table policy:' as info;
SELECT 'Agents count:' as test, count(*) as result FROM public.agents;

-- Show the policies
SELECT 'Agents table policies:' as info;
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'agents';
