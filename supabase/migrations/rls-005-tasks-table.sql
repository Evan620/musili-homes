-- RLS-005: Create RLS policy for tasks table
-- Agents can see only their own tasks, admins can see all tasks

-- Drop existing policies for tasks table
DROP POLICY IF EXISTS "Agents can view own tasks" ON public.tasks;
DROP POLICY IF EXISTS "tasks_agents_own" ON public.tasks;
DROP POLICY IF EXISTS "tasks_agents_update" ON public.tasks;
DROP POLICY IF EXISTS "tasks_agents_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_admins_all" ON public.tasks;

-- Create comprehensive policies for tasks table

-- 1. SELECT policy: Agents see their own tasks, admins see all
CREATE POLICY "tasks_agents_own" ON public.tasks
  FOR SELECT 
  USING (
    -- Service role can see everything
    auth.role() = 'service_role'
    -- Agents can see only their own tasks
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = tasks.agent_id
      )
    )
    -- Admins can see all tasks
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- 2. UPDATE policy: Agents can update their own tasks, admins can update all
CREATE POLICY "tasks_agents_update" ON public.tasks
  FOR UPDATE 
  USING (
    -- Service role can update everything
    auth.role() = 'service_role'
    -- Agents can update their own tasks
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = tasks.agent_id
      )
    )
    -- Admins can update all tasks
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
    -- Agents can update their own tasks
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = tasks.agent_id
      )
    )
    -- Admins can update all tasks
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- 3. INSERT policy: Admins can create tasks for agents
CREATE POLICY "tasks_admins_insert" ON public.tasks
  FOR INSERT 
  WITH CHECK (
    -- Service role can insert everything
    auth.role() = 'service_role'
    -- Admins can create tasks for any agent
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
    -- Agents can create tasks for themselves
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = tasks.agent_id
      )
    )
  );

-- 4. DELETE policy: Admins can delete tasks, agents can delete their own
CREATE POLICY "tasks_delete" ON public.tasks
  FOR DELETE 
  USING (
    -- Service role can delete everything
    auth.role() = 'service_role'
    -- Admins can delete all tasks
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
    -- Agents can delete their own tasks
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = tasks.agent_id
      )
    )
  );

-- Grant necessary permissions
GRANT SELECT ON public.tasks TO authenticated;
GRANT INSERT ON public.tasks TO authenticated;
GRANT UPDATE ON public.tasks TO authenticated;
GRANT DELETE ON public.tasks TO authenticated;

-- Test the policy
SELECT 'Testing tasks table policy:' as info;
SELECT 'Tasks count:' as test, count(*) as result FROM public.tasks;

-- Show the policies
SELECT 'Tasks table policies:' as info;
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'tasks';
