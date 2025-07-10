-- FULL MIGRATION: Convert user-related IDs from integer to uuid for Supabase Auth compatibility
-- WARNING: Test this on a backup database first!

-- 1. Add a new uuid column to users table
ALTER TABLE public.users ADD COLUMN auth_id uuid UNIQUE;

-- 2. Manually map each user's Supabase Auth UUID to users.auth_id
-- Example:
-- UPDATE public.users SET auth_id = '<supabase-auth-uuid>' WHERE email = '<user-email>';
-- Repeat for all users. This step is CRITICAL.

-- 3. Add new uuid columns to referencing tables
ALTER TABLE public.agents ADD COLUMN user_auth_id uuid;
ALTER TABLE public.properties ADD COLUMN agent_auth_id uuid;
ALTER TABLE public.messages ADD COLUMN sender_auth_id uuid;
ALTER TABLE public.messages ADD COLUMN receiver_auth_id uuid;
ALTER TABLE public.tasks ADD COLUMN agent_auth_id uuid;

-- 4. Populate new uuid columns based on relationships
UPDATE public.agents SET user_auth_id = u.auth_id FROM public.users u WHERE agents.id = u.id;
UPDATE public.properties SET agent_auth_id = a.user_auth_id FROM public.agents a WHERE properties.agent_id = a.id;
UPDATE public.messages SET sender_auth_id = u.auth_id FROM public.users u WHERE messages.sender_id = u.id;
UPDATE public.messages SET receiver_auth_id = u.auth_id FROM public.users u WHERE messages.receiver_id = u.id;
UPDATE public.tasks SET agent_auth_id = a.user_auth_id FROM public.agents a WHERE tasks.agent_id = a.id;

-- 5. Add foreign key constraints for new uuid columns
ALTER TABLE public.agents ADD CONSTRAINT agents_user_auth_id_fkey FOREIGN KEY (user_auth_id) REFERENCES public.users(auth_id);
ALTER TABLE public.properties ADD CONSTRAINT properties_agent_auth_id_fkey FOREIGN KEY (agent_auth_id) REFERENCES public.agents(user_auth_id);
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_auth_id_fkey FOREIGN KEY (sender_auth_id) REFERENCES public.users(auth_id);
ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_auth_id_fkey FOREIGN KEY (receiver_auth_id) REFERENCES public.users(auth_id);
ALTER TABLE public.tasks ADD CONSTRAINT tasks_agent_auth_id_fkey FOREIGN KEY (agent_auth_id) REFERENCES public.agents(user_auth_id);

-- 6. (Optional) Remove old integer columns and constraints after verifying everything works
-- Example:
-- ALTER TABLE public.agents DROP CONSTRAINT agents_id_fkey;
-- ALTER TABLE public.agents DROP COLUMN id;
-- (Repeat for all referencing tables)

-- 7. (Optional) Set new uuid columns as PRIMARY KEY if desired
-- Example:
-- ALTER TABLE public.users DROP CONSTRAINT users_pkey;
-- ALTER TABLE public.users ADD PRIMARY KEY (auth_id);

-- 8. Update RLS policies to use auth.uid()

-- USERS: Only see/update your own record
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);

-- AGENTS: Only see/update your own record
DROP POLICY IF EXISTS "agents_select_own" ON public.agents;
DROP POLICY IF EXISTS "agents_update_own" ON public.agents;
CREATE POLICY "agents_select_own" ON public.agents
  FOR SELECT USING (auth.uid() = user_auth_id);
CREATE POLICY "agents_update_own" ON public.agents
  FOR UPDATE USING (auth.uid() = user_auth_id) WITH CHECK (auth.uid() = user_auth_id);

-- PROPERTIES: Public can view, agents/admins can manage their own/all
DROP POLICY IF EXISTS "properties_public_select" ON public.properties;
DROP POLICY IF EXISTS "properties_agents_manage" ON public.properties;
CREATE POLICY "properties_public_select" ON public.properties
  FOR SELECT USING (true);
CREATE POLICY "properties_agents_manage" ON public.properties
  FOR ALL USING (
    auth.uid() = agent_auth_id OR
    (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'))
  );

-- TASKS: Only see/update your own, admins can see all
DROP POLICY IF EXISTS "tasks_agents_own" ON public.tasks;
DROP POLICY IF EXISTS "tasks_agents_update" ON public.tasks;
CREATE POLICY "tasks_agents_own" ON public.tasks
  FOR SELECT USING (
    auth.uid() = agent_auth_id OR
    (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'))
  );
CREATE POLICY "tasks_agents_update" ON public.tasks
  FOR UPDATE USING (auth.uid() = agent_auth_id) WITH CHECK (auth.uid() = agent_auth_id);

-- MESSAGES: Only see your own, admins can see all
DROP POLICY IF EXISTS "messages_participants" ON public.messages;
CREATE POLICY "messages_participants" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_auth_id OR
    auth.uid() = receiver_auth_id OR
    (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'))
  );

-- PROPERTY IMAGES: Public can view, agents/admins can manage their own/all
DROP POLICY IF EXISTS "property_images_public_select" ON public.property_images;
DROP POLICY IF EXISTS "property_images_agents_manage" ON public.property_images;
CREATE POLICY "property_images_public_select" ON public.property_images
  FOR SELECT USING (true);
CREATE POLICY "property_images_agents_manage" ON public.property_images
  FOR ALL USING (
    (EXISTS (SELECT 1 FROM public.properties WHERE id = property_id AND agent_auth_id = auth.uid())) OR
    (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin'))
  );

-- Grant permissions
GRANT SELECT ON public.properties TO anon, authenticated;
GRANT SELECT ON public.property_images TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
