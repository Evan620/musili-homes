-- IMG-002: Configure storage policies for image access
-- This migration sets up RLS policies for the property-images storage bucket

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public read access for property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can update their property images" ON storage.objects;
DROP POLICY IF EXISTS "Agents can delete their property images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all property images" ON storage.objects;

-- 1. PUBLIC READ ACCESS: Anyone can view property images
CREATE POLICY "Public read access for property images" ON storage.objects
  FOR SELECT 
  USING (
    bucket_id = 'property-images'
  );

-- 2. AUTHENTICATED UPLOAD: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload property images" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
    -- Images must be in a property folder structure: {property_id}/{filename}
    AND (storage.foldername(name))[1] ~ '^[0-9]+$' -- Property ID must be numeric
  );

-- 3. AGENT UPDATE: Agents can update images for their properties
CREATE POLICY "Agents can update their property images" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
    AND (
      -- Service role can update anything
      auth.role() = 'service_role'
      -- Agents can update images for properties they own
      OR (
        auth.jwt() ->> 'email' IN (
          SELECT u.email 
          FROM public.users u
          JOIN public.properties p ON u.id = p.agent_id
          WHERE p.id::text = (storage.foldername(name))[1]
        )
      )
      -- Admins can update all images
      OR (
        auth.jwt() ->> 'email' IN (
          SELECT email FROM public.users WHERE role = 'admin'
        )
      )
    )
  );

-- 4. AGENT DELETE: Agents can delete images for their properties
CREATE POLICY "Agents can delete their property images" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'property-images'
    AND auth.role() = 'authenticated'
    AND (
      -- Service role can delete anything
      auth.role() = 'service_role'
      -- Agents can delete images for properties they own
      OR (
        auth.jwt() ->> 'email' IN (
          SELECT u.email 
          FROM public.users u
          JOIN public.properties p ON u.id = p.agent_id
          WHERE p.id::text = (storage.foldername(name))[1]
        )
      )
      -- Admins can delete all images
      OR (
        auth.jwt() ->> 'email' IN (
          SELECT email FROM public.users WHERE role = 'admin'
        )
      )
    )
  );

-- 5. ADMIN FULL ACCESS: Admins have full access to all images
CREATE POLICY "Admins can manage all property images" ON storage.objects
  FOR ALL 
  USING (
    bucket_id = 'property-images'
    AND (
      auth.role() = 'service_role'
      OR (
        auth.role() = 'authenticated'
        AND auth.jwt() ->> 'email' IN (
          SELECT email FROM public.users WHERE role = 'admin'
        )
      )
    )
  );

-- Grant necessary permissions
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;

-- Grant permissions on storage.buckets
GRANT SELECT ON storage.buckets TO anon, authenticated;

-- Test the policies
SELECT 'Testing storage policies:' as info;
SELECT 'Storage objects count:' as test, count(*) as result FROM storage.objects WHERE bucket_id = 'property-images';

-- Show the policies
SELECT 'Storage policies:' as info;
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'
AND policyname LIKE '%property images%';

-- Show bucket configuration
SELECT 'Property images bucket:' as info;
SELECT id, name, public, file_size_limit, allowed_mime_types 
FROM storage.buckets 
WHERE id = 'property-images';
