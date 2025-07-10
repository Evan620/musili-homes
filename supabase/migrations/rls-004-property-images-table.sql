-- RLS-004: Create RLS policy for property_images table
-- Property images should follow the same access pattern as properties
-- Public can view all images, agents can manage images for their properties

-- Drop existing policies for property_images table
DROP POLICY IF EXISTS "Property images are viewable by everyone" ON public.property_images;
DROP POLICY IF EXISTS "Allow all access to property_images" ON public.property_images;
DROP POLICY IF EXISTS "property_images_public_select" ON public.property_images;
DROP POLICY IF EXISTS "property_images_agents_manage" ON public.property_images;

-- 1. PUBLIC SELECT policy: Property images are publicly viewable
-- This allows everyone to view property images (needed for public property listings)
CREATE POLICY "property_images_public_select" ON public.property_images
  FOR SELECT 
  USING (true); -- Allow EVERYONE to view property images

-- 2. AGENT INSERT policy: Agents can add images to their properties
CREATE POLICY "property_images_agents_insert" ON public.property_images
  FOR INSERT 
  WITH CHECK (
    -- Service role can insert anything
    auth.role() = 'service_role'
    -- Agents can add images to their own properties
    OR (
      auth.role() = 'authenticated' 
      AND property_id IN (
        SELECT id FROM public.properties 
        WHERE auth.jwt() ->> 'email' IN (
          SELECT email FROM public.users WHERE id = properties.agent_id
        )
      )
    )
  );

-- 3. AGENT UPDATE policy: Agents can update images for their properties
CREATE POLICY "property_images_agents_update" ON public.property_images
  FOR UPDATE 
  USING (
    -- Service role can update anything
    auth.role() = 'service_role'
    -- Agents can update images for their own properties
    OR (
      auth.role() = 'authenticated' 
      AND property_id IN (
        SELECT id FROM public.properties 
        WHERE auth.jwt() ->> 'email' IN (
          SELECT email FROM public.users WHERE id = properties.agent_id
        )
      )
    )
  )
  WITH CHECK (
    -- Service role can update anything
    auth.role() = 'service_role'
    -- Agents can update images for their own properties
    OR (
      auth.role() = 'authenticated' 
      AND property_id IN (
        SELECT id FROM public.properties 
        WHERE auth.jwt() ->> 'email' IN (
          SELECT email FROM public.users WHERE id = properties.agent_id
        )
      )
    )
  );

-- 4. ADMIN ALL policy: Admins can do everything with property images
CREATE POLICY "property_images_admins_all" ON public.property_images
  FOR ALL 
  USING (
    -- Service role can do everything
    auth.role() = 'service_role'
    -- Admins can do everything
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  )
  WITH CHECK (
    -- Service role can do everything
    auth.role() = 'service_role'
    -- Admins can do everything
    OR (
      auth.role() = 'authenticated' 
      AND auth.jwt() ->> 'email' IN (
        SELECT email FROM public.users WHERE role = 'admin'
      )
    )
  );

-- 5. AGENT DELETE policy: Agents can delete images from their properties
CREATE POLICY "property_images_agents_delete" ON public.property_images
  FOR DELETE 
  USING (
    -- Service role can delete anything
    auth.role() = 'service_role'
    -- Agents can delete images from their own properties
    OR (
      auth.role() = 'authenticated' 
      AND property_id IN (
        SELECT id FROM public.properties 
        WHERE auth.jwt() ->> 'email' IN (
          SELECT email FROM public.users WHERE id = properties.agent_id
        )
      )
    )
  );

-- Grant necessary permissions
-- CRITICAL: Grant SELECT to anon users for public image viewing
GRANT SELECT ON public.property_images TO anon;
GRANT SELECT ON public.property_images TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_images TO authenticated;

-- Test the policy
SELECT 'Testing property_images table policy:' as info;
SELECT 'Property images count:' as test, count(*) as result FROM public.property_images;

-- Show sample property images to verify access
SELECT 'Sample property images:' as info;
SELECT id, property_id, image_url FROM public.property_images LIMIT 5;

-- Show the policies
SELECT 'Property images table policies:' as info;
SELECT policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'property_images';
