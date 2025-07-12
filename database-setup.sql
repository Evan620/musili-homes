-- Musili Homes Database Setup Script
-- Run this in your Supabase SQL Editor to set up the database schema

-- First, let's ensure we have the proper structure for all tables

-- Create users table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  phone VARCHAR,
  photo VARCHAR,
  role VARCHAR NOT NULL CHECK (role IN ('admin', 'agent')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id INTEGER PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT
);

-- Create admins table
CREATE TABLE IF NOT EXISTS public.admins (
  id INTEGER PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  location VARCHAR NOT NULL,
  address VARCHAR NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC NOT NULL,
  size INTEGER,
  featured BOOLEAN DEFAULT false,
  status VARCHAR NOT NULL CHECK (status IN ('For Sale', 'For Rent', 'Sold', 'Rented')),
  agent_id INTEGER NOT NULL REFERENCES public.agents(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS public.property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL
);

-- Create agent_properties junction table
CREATE TABLE IF NOT EXISTS public.agent_properties (
  agent_id INTEGER NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, property_id)
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT,
  priority VARCHAR NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
  status VARCHAR NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed')),
  due_date DATE,
  agent_id INTEGER NOT NULL REFERENCES public.agents(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES public.users(id),
  receiver_id INTEGER NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTE: With Supabase Auth, users will be created through the authentication system
-- The users table will be populated automatically when users sign up
-- For now, we'll create some sample properties without specific agent assignments

-- We'll create some placeholder entries that can be updated later
-- These will be replaced when real users sign up through Supabase Auth

-- For now, we'll create properties without agent assignments
-- These will be assigned to agents when they sign up through Supabase Auth

-- First, let's create a temporary "unassigned" agent entry
-- This will be replaced when real agents sign up
INSERT INTO public.users (id, name, email, password, phone, photo, role) VALUES
(999, 'Unassigned Agent', 'unassigned@musilli.co.ke', 'temp', NULL, NULL, 'agent')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.agents (id, bio) VALUES
(999, 'Temporary placeholder for unassigned properties.')
ON CONFLICT (id) DO NOTHING;

-- Insert sample properties (assigned to temporary agent for now)
INSERT INTO public.properties (id, title, description, price, location, address, bedrooms, bathrooms, size, featured, status, agent_id) VALUES
(1, 'Luxurious Lakefront Villa', 'Experience unparalleled luxury in this stunning lakefront villa with panoramic views of Lake Naivasha. This architectural masterpiece features soaring ceilings, floor-to-ceiling windows, and exquisite finishes throughout.', 250000000, 'Naivasha', 'Lake View Estate, Moi South Lake Road, Naivasha', 6, 7, 8500, true, 'For Sale', 999),
(2, 'Modern Penthouse in Westlands', 'Elevate your lifestyle with this sophisticated penthouse featuring breathtaking views of the Nairobi skyline.', 120000000, 'Nairobi', 'Westlands Towers, Waiyaki Way, Westlands', 4, 4.5, 3800, true, 'For Sale', 999),
(3, 'Elegant Colonial Estate in Karen', 'This magnificent colonial estate sits on 2.5 acres of prime land in Karen.', 350000000, 'Nairobi', 'Karen Country Club Road, Karen', 7, 8, 12000, true, 'For Sale', 999)
ON CONFLICT (id) DO NOTHING;

-- Insert property images
INSERT INTO public.property_images (property_id, image_url) VALUES
(1, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80'),
(1, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80'),
(1, 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80'),
(2, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80'),
(2, 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80'),
(2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80'),
(3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80'),
(3, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80'),
(3, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&q=80')
ON CONFLICT DO NOTHING;

-- Insert agent_properties relationships (using temporary agent)
INSERT INTO public.agent_properties (agent_id, property_id) VALUES
(999, 1), (999, 2), (999, 3)
ON CONFLICT DO NOTHING;

-- Insert sample tasks (assigned to temporary agent)
INSERT INTO public.tasks (title, description, priority, status, due_date, agent_id) VALUES
('Client follow-up - Naivasha Villa', 'Follow up with Mr. Johnson regarding the lakefront villa viewing', 'High', 'Pending', '2024-05-15', 999),
('Property inspection - Karen Estate', 'Complete inspection of the colonial estate in Karen', 'Medium', 'In Progress', '2024-05-20', 999),
('Update listing photos - Westlands Penthouse', 'Take new professional photos of the penthouse after renovations', 'Medium', 'Pending', '2024-05-25', 999)
ON CONFLICT DO NOTHING;

-- Reset sequences to proper values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('properties_id_seq', (SELECT MAX(id) FROM properties));
SELECT setval('property_images_id_seq', (SELECT MAX(id) FROM property_images));
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic policies for now - will be refined later)
-- Users can see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = id::text OR auth.jwt() ->> 'email' = email);

-- Properties are viewable by everyone (public listings)
CREATE POLICY "Properties are viewable by everyone" ON public.properties
  FOR SELECT USING (true);

-- Property images are viewable by everyone
CREATE POLICY "Property images are viewable by everyone" ON public.property_images
  FOR SELECT USING (true);

-- Agents can view their own data
CREATE POLICY "Agents can view own data" ON public.agents
  FOR SELECT USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM public.users WHERE id = agents.id
  ));

-- Tasks are viewable by the assigned agent
CREATE POLICY "Agents can view own tasks" ON public.tasks
  FOR SELECT USING (auth.jwt() ->> 'email' IN (
    SELECT email FROM public.users WHERE id = tasks.agent_id
  ));

-- Messages are viewable by sender and receiver
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM public.users WHERE id = messages.sender_id OR id = messages.receiver_id
    )
  );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
