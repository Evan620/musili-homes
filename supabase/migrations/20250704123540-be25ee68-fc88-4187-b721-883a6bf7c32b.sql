
-- Update the existing users with the correct passwords that match the login form
UPDATE public.users
SET password = 'admin123'
WHERE email = 'admin@musilli.co.ke';

UPDATE public.users
SET password = 'agent123'
WHERE email = 'sarah@musilli.co.ke';

UPDATE public.users
SET password = 'agent123'
WHERE email = 'david@musilli.co.ke';

UPDATE public.users
SET password = 'agent123'
WHERE email = 'lisa@musilli.co.ke';

-- Verify the credentials are set correctly
SELECT email, password, role FROM public.users;
