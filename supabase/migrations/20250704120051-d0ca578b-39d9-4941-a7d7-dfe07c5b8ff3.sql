
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

-- Insert sample data to match your existing mock data
INSERT INTO public.users (id, name, email, password, phone, photo, role) VALUES
(1, 'John Musili', 'admin@musili.co.ke', 'admin123', NULL, NULL, 'admin'),
(2, 'Sarah Kimani', 'sarah@musili.co.ke', 'agent123', '+254 712 345 678', '/agent1.jpg', 'agent'),
(3, 'David Ochieng', 'david@musili.co.ke', 'agent123', '+254 723 456 789', '/agent2.jpg', 'agent'),
(4, 'Lisa Wanjiku', 'lisa@musili.co.ke', 'agent123', '+254 734 567 890', '/agent3.jpg', 'agent')
ON CONFLICT (email) DO NOTHING;

-- Insert into admins table
INSERT INTO public.admins (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Insert into agents table
INSERT INTO public.agents (id, bio) VALUES
(2, 'Sarah specializes in luxury residential properties in Nairobi and Naivasha.'),
(3, 'David focuses on high-end apartments and penthouses in Nairobi''s upmarket areas.'),
(4, 'Lisa specializes in exclusive estates and vacation properties.')
ON CONFLICT (id) DO NOTHING;

-- Insert properties
INSERT INTO public.properties (id, title, description, price, location, address, bedrooms, bathrooms, size, featured, status, agent_id) VALUES
(1, 'Luxurious Lakefront Villa', 'Experience unparalleled luxury in this stunning lakefront villa with panoramic views of Lake Naivasha. This architectural masterpiece features soaring ceilings, floor-to-ceiling windows, and exquisite finishes throughout.', 250000000, 'Naivasha', 'Lake View Estate, Moi South Lake Road, Naivasha', 6, 7, 8500, true, 'For Sale', 2),
(2, 'Modern Penthouse in Westlands', 'Elevate your lifestyle with this sophisticated penthouse featuring breathtaking views of the Nairobi skyline.', 120000000, 'Nairobi', 'Westlands Towers, Waiyaki Way, Westlands', 4, 4.5, 3800, true, 'For Sale', 3),
(3, 'Elegant Colonial Estate in Karen', 'This magnificent colonial estate sits on 2.5 acres of prime land in Karen.', 350000000, 'Nairobi', 'Karen Country Club Road, Karen', 7, 8, 12000, true, 'For Sale', 4)
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

-- Insert agent_properties relationships
INSERT INTO public.agent_properties (agent_id, property_id) VALUES
(2, 1), (2, 4), (3, 2), (3, 5), (4, 3), (4, 6)
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO public.tasks (title, description, priority, status, due_date, agent_id) VALUES
('Client follow-up - Naivasha Villa', 'Follow up with Mr. Johnson regarding the lakefront villa viewing', 'High', 'Pending', '2024-05-15', 2),
('Property inspection - Karen Estate', 'Complete inspection of the colonial estate in Karen', 'Medium', 'In Progress', '2024-05-20', 4),
('Update listing photos - Westlands Penthouse', 'Take new professional photos of the penthouse after renovations', 'Medium', 'Pending', '2024-05-25', 3)
ON CONFLICT DO NOTHING;

-- Reset sequences to proper values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('properties_id_seq', (SELECT MAX(id) FROM properties));
SELECT setval('property_images_id_seq', (SELECT MAX(id) FROM property_images));
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages));
