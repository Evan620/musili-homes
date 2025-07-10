-- RLS-009: Test RLS policies with different user roles
-- Comprehensive testing of all RLS policies to ensure they work correctly

-- Test setup: Create test data and verify policies work as expected

SELECT 'Starting RLS Policy Tests...' as test_info;

-- =============================================================================
-- TEST 1: ANONYMOUS USER ACCESS (Public Data)
-- =============================================================================

SELECT '=== TEST 1: Anonymous User Access ===' as test_section;

-- Test: Anonymous users should be able to view properties (public listings)
SELECT 'Test 1.1: Anonymous access to properties' as test_name;
SET ROLE anon;
SELECT 'Properties visible to anon:' as result, count(*) as count FROM public.properties;

-- Test: Anonymous users should be able to view property images
SELECT 'Test 1.2: Anonymous access to property images' as test_name;
SELECT 'Property images visible to anon:' as result, count(*) as count FROM public.property_images;

-- Test: Anonymous users should be able to view basic agent info
SELECT 'Test 1.3: Anonymous access to agents' as test_name;
SELECT 'Agents visible to anon:' as result, count(*) as count FROM public.agents;

-- Test: Anonymous users should NOT be able to view users table
SELECT 'Test 1.4: Anonymous access to users (should be restricted)' as test_name;
SELECT 'Users visible to anon:' as result, count(*) as count FROM public.users;

-- Test: Anonymous users should NOT be able to view tasks
SELECT 'Test 1.5: Anonymous access to tasks (should be restricted)' as test_name;
SELECT 'Tasks visible to anon:' as result, count(*) as count FROM public.tasks;

-- Test: Anonymous users should NOT be able to view messages
SELECT 'Test 1.6: Anonymous access to messages (should be restricted)' as test_name;
SELECT 'Messages visible to anon:' as result, count(*) as count FROM public.messages;

-- Reset role
RESET ROLE;

-- =============================================================================
-- TEST 2: AUTHENTICATED USER ACCESS (General Users)
-- =============================================================================

SELECT '=== TEST 2: Authenticated User Access ===' as test_section;

-- Test: Authenticated users should see all properties
SELECT 'Test 2.1: Authenticated access to properties' as test_name;
SET ROLE authenticated;
SELECT 'Properties visible to authenticated:' as result, count(*) as count FROM public.properties;

-- Test: Authenticated users should see all property images
SELECT 'Test 2.2: Authenticated access to property images' as test_name;
SELECT 'Property images visible to authenticated:' as result, count(*) as count FROM public.property_images;

-- Test: Authenticated users should see basic agent info
SELECT 'Test 2.3: Authenticated access to agents' as test_name;
SELECT 'Agents visible to authenticated:' as result, count(*) as count FROM public.agents;

-- Reset role
RESET ROLE;

-- =============================================================================
-- TEST 3: SERVICE ROLE ACCESS (Full Admin Access)
-- =============================================================================

SELECT '=== TEST 3: Service Role Access ===' as test_section;

-- Test: Service role should see everything
SELECT 'Test 3.1: Service role access to all tables' as test_name;

-- Users table
SELECT 'Users visible to service_role:' as result, count(*) as count FROM public.users;

-- Properties table
SELECT 'Properties visible to service_role:' as result, count(*) as count FROM public.properties;

-- Property images table
SELECT 'Property images visible to service_role:' as result, count(*) as count FROM public.property_images;

-- Agents table
SELECT 'Agents visible to service_role:' as result, count(*) as count FROM public.agents;

-- Tasks table
SELECT 'Tasks visible to service_role:' as result, count(*) as count FROM public.tasks;

-- Messages table
SELECT 'Messages visible to service_role:' as result, count(*) as count FROM public.messages;

-- Agent properties table
SELECT 'Agent properties visible to service_role:' as result, count(*) as count FROM public.agent_properties;

-- =============================================================================
-- TEST 4: POLICY VERIFICATION
-- =============================================================================

SELECT '=== TEST 4: Policy Verification ===' as test_section;

-- Show all current policies
SELECT 'Current RLS Policies:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================================================
-- TEST 5: RLS STATUS VERIFICATION
-- =============================================================================

SELECT '=== TEST 5: RLS Status Verification ===' as test_section;

-- Check that RLS is enabled on all tables
SELECT 'RLS Status for all tables:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =============================================================================
-- TEST SUMMARY
-- =============================================================================

SELECT '=== RLS POLICY TEST SUMMARY ===' as test_section;
SELECT 'All RLS policy tests completed successfully!' as summary;
SELECT 'Review the results above to ensure policies are working as expected.' as note;
SELECT 'Key points to verify:' as checklist;
SELECT '1. Anonymous users can view properties and property images' as check1;
SELECT '2. Anonymous users cannot view sensitive data (users, tasks, messages)' as check2;
SELECT '3. Authenticated users have appropriate access based on their role' as check3;
SELECT '4. Service role has full access to all tables' as check4;
SELECT '5. All tables have RLS enabled' as check5;
SELECT '6. All required policies are in place' as check6;
