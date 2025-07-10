
-- Update the existing users with the correct passwords that match the login form
UPDATE public.users 
SET password = 'admin123' 
WHERE email = 'admin@musili.co.ke';

UPDATE public.users 
SET password = 'agent123' 
WHERE email = 'sarah@musili.co.ke';

UPDATE public.users 
SET password = 'agent123' 
WHERE email = 'david@musili.co.ke';

UPDATE public.users 
SET password = 'agent123' 
WHERE email = 'lisa@musili.co.ke';

-- Verify the credentials are set correctly
SELECT email, password, role FROM public.users;
