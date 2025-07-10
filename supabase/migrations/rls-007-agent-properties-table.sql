-- RLS-007: Create RLS policy for agent_properties table
-- Agents can see only their own property assignments, admins can see all

-- Drop existing policies for agent_properties table
DROP POLICY IF EXISTS "agent_properties_select" ON public.agent_properties;
DROP POLICY IF EXISTS "agent_properties_insert" ON public.agent_properties;
DROP POLICY IF EXISTS "agent_properties_update" ON public.agent_properties;
DROP POLICY IF EXISTS "agent_properties_delete" ON public.agent_properties;

-- Create comprehensive policies for agent_properties table

-- 1. SELECT policy: Agents see their own assignments, admins see all
CREATE POLICY "agent_properties_select" ON public.agent_properties
  FOR SELECT 
  USING (
    -- Service role can see everything
    auth.role() = 'service_role'
    -- Agents can see their own property assignments
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = agent_properties.agent_id
      )
    )
    -- Admins can see all property assignments
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
    -- Public access for property listings (to show which agent handles which property)
    OR auth.role() = 'anon'
  );

-- 2. INSERT policy: Admins can assign properties to agents
CREATE POLICY "agent_properties_insert" ON public.agent_properties
  FOR INSERT 
  WITH CHECK (
    -- Service role can insert everything
    auth.role() = 'service_role'
    -- Admins can assign properties to agents
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
    -- Agents can assign themselves to properties (self-assignment)
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = agent_properties.agent_id
      )
    )
  );

-- 3. UPDATE policy: Only admins can update property assignments
CREATE POLICY "agent_properties_update" ON public.agent_properties
  FOR UPDATE 
  USING (
    -- Service role can update everything
    auth.role() = 'service_role'
    -- Admins can update all property assignments
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  )
  WITH CHECK (
    -- Service role can update everything
    auth.role() = 'service_role'
    -- Admins can update all property assignments
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- 4. DELETE policy: Admins can remove assignments, agents can remove themselves
CREATE POLICY "agent_properties_delete" ON public.agent_properties
  FOR DELETE 
  USING (
    -- Service role can delete everything
    auth.role() = 'service_role'
    -- Admins can remove any property assignment
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
    -- Agents can remove themselves from property assignments
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = agent_properties.agent_id
      )
    )
  );

-- Grant necessary permissions
GRANT SELECT ON public.agent_properties TO anon, authenticated;
GRANT INSERT ON public.agent_properties TO authenticated;
GRANT UPDATE ON public.agent_properties TO authenticated;
GRANT DELETE ON public.agent_properties TO authenticated;

-- Test the policy
SELECT 'Testing agent_properties table policy:' as info;
SELECT 'Agent-Property assignments count:' as test, count(*) as result FROM public.agent_properties;

-- Show the policies
SELECT 'Agent_properties table policies:' as info;
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'agent_properties';
