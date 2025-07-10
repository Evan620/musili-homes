-- RLS-006: Create RLS policy for messages table
-- Users can see only their own conversations (messages they sent or received)

-- Drop existing policies for messages table
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
DROP POLICY IF EXISTS "messages_participants" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;
DROP POLICY IF EXISTS "messages_delete" ON public.messages;

-- Create comprehensive policies for messages table

-- 1. SELECT policy: Users can see messages they sent or received
CREATE POLICY "messages_participants" ON public.messages
  FOR SELECT 
  USING (
    -- Service role can see everything
    auth.role() = 'service_role'
    -- Users can see messages they sent or received
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users 
        WHERE id = messages.sender_id OR id = messages.receiver_id
      )
    )
    -- Admins can see all messages (for moderation)
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- 2. INSERT policy: Authenticated users can send messages
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT 
  WITH CHECK (
    -- Service role can insert everything
    auth.role() = 'service_role'
    -- Authenticated users can send messages (sender must be themselves)
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = messages.sender_id
      )
    )
  );

-- 3. UPDATE policy: Users can update their own sent messages (for editing)
CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE 
  USING (
    -- Service role can update everything
    auth.role() = 'service_role'
    -- Users can update messages they sent
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = messages.sender_id
      )
    )
    -- Admins can update all messages (for moderation)
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
    -- Users can update messages they sent
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = messages.sender_id
      )
    )
    -- Admins can update all messages (for moderation)
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- 4. DELETE policy: Users can delete their own sent messages, admins can delete any
CREATE POLICY "messages_delete" ON public.messages
  FOR DELETE 
  USING (
    -- Service role can delete everything
    auth.role() = 'service_role'
    -- Users can delete messages they sent
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE id = messages.sender_id
      )
    )
    -- Admins can delete all messages (for moderation)
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- Grant necessary permissions
GRANT SELECT ON public.messages TO authenticated;
GRANT INSERT ON public.messages TO authenticated;
GRANT UPDATE ON public.messages TO authenticated;
GRANT DELETE ON public.messages TO authenticated;

-- Test the policy
SELECT 'Testing messages table policy:' as info;
SELECT 'Messages count:' as test, count(*) as result FROM public.messages;

-- Show the policies
SELECT 'Messages table policies:' as info;
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'messages';
