-- Enable real-time for all tables to support live updates across the application

-- Enable real-time for properties table
ALTER PUBLICATION supabase_realtime ADD TABLE public.properties;

-- Enable real-time for property_images table
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_images;

-- Enable real-time for agents table
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;

-- Enable real-time for users table (affects agents)
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Enable real-time for tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Enable real-time for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable real-time for admins table
ALTER PUBLICATION supabase_realtime ADD TABLE public.admins;

-- Enable real-time for agent_properties table (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'agent_properties' AND table_schema = 'public') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_properties;
        RAISE NOTICE 'Added agent_properties table to real-time publication';
    ELSE
        RAISE NOTICE 'agent_properties table does not exist, skipping';
    END IF;
END $$;

-- Verify which tables are enabled for real-time
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;
