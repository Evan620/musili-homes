-- IMG-001: Set up Supabase Storage bucket for property images
-- This migration creates the storage bucket and initial configuration

-- Create the property-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true, -- Public bucket for property images
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create folder structure for organization
-- Properties will be organized as: property-images/{property_id}/{image_name}
-- This allows easy management and cleanup when properties are deleted

-- Grant necessary permissions for the bucket
-- These policies will be refined in the next migration (IMG-002)

SELECT 'Property images storage bucket created successfully!' as result;
SELECT 'Bucket configuration:' as info;
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'property-images';

-- Show storage schema for reference
SELECT 'Storage schema tables:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'storage' 
ORDER BY table_name;
