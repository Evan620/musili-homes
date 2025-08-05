# Supabase Setup Guide for Musilli Homes

## Current Issue: Authentication 400 Error

The application is experiencing a 400 error when trying to authenticate. This is typically caused by a Site URL configuration issue in Supabase.

## Quick Fix Steps:

### 1. Check Supabase Dashboard Settings

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/exnfbzgvonbaszpbmxva
2. Navigate to **Authentication** → **URL Configuration**
3. Ensure the following settings:

**Site URL:** `http://localhost:8080`
**Additional Redirect URLs:** 
- `http://localhost:8080`
- `http://localhost:8080/auth/callback`
- `http://localhost:8080/login`

### 2. Environment Variables Check

Verify your `.env.local` file contains:
```
VITE_SUPABASE_URL=https://exnfbzgvonbaszpbmxva.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4bmZiemd2b25iYXN6cGJteHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTYwMzksImV4cCI6MjA2NzM3MjAzOX0.cC4MR84S43-qPhSvZEiAeu9AJ-qXb2WX893cHmGALgI
```

### 3. Test Authentication

Use the debug panels that are now visible in development mode:

1. **Green Panel (Top Left):** Supabase Test Panel
   - Click "Check Env" to verify environment variables
   - Click "Test Connection" to verify Supabase connectivity
   - Try "Test Signup" to create a test account
   - Try "Test Login" to test authentication

2. **Blue Panel (Bottom Right):** Auth Debug Panel
   - Shows current authentication state
   - Provides test login functionality
   - Shows session and user information

### 4. Create Test Account

If no accounts exist, create one using either:

**Option A: Using the debug panel**
1. Use the green "Supabase Test Panel"
2. Click "Test Signup"
3. Check your email for verification (if email confirmation is enabled)

**Option B: Using Supabase Dashboard**
1. Go to Authentication → Users in your Supabase dashboard
2. Click "Add User"
3. Create a user with:
   - Email: `admin@musillihomes.co.ke`
   - Password: `admin123`
   - Email Confirm: `true`

### 5. Database Setup

Ensure your database has the required tables and RLS policies:

**Required Tables:**
- `users` - User profiles
- `properties` - Property listings
- `property_images` - Property images
- `agents` - Agent information
- `admins` - Admin users

**RLS Policies:**
- Properties should have public SELECT access
- Property images should have public SELECT access
- Users table should have appropriate access controls

### 6. Common Issues and Solutions

**Issue: 400 Error on Token Endpoint**
- **Cause:** Site URL mismatch
- **Solution:** Update Site URL in Supabase dashboard to match your development URL

**Issue: User shows as SIGNED_IN but gets errors**
- **Cause:** Invalid session or token refresh issues
- **Solution:** Clear browser storage and try logging in again

**Issue: Cannot access protected routes**
- **Cause:** User role not set correctly
- **Solution:** Check user metadata in Supabase dashboard

**Issue: Database connection errors**
- **Cause:** RLS policies blocking access
- **Solution:** Review and update RLS policies

### 7. Testing Checklist

- [ ] Environment variables are set correctly
- [ ] Supabase Site URL matches development URL
- [ ] Can create new user account
- [ ] Can log in with test credentials
- [ ] User session persists across page refreshes
- [ ] Can access protected routes based on user role
- [ ] Database queries work correctly

### 8. Production Deployment

When deploying to production:

1. Update Site URL in Supabase to your production domain
2. Add production domain to Additional Redirect URLs
3. Update environment variables for production
4. Test authentication flow in production environment

### 9. Debug Information

The debug panels provide detailed information about:
- Current authentication state
- Session and token information
- Environment configuration
- Database connectivity
- Error messages and stack traces

Use this information to identify and resolve authentication issues.

### 10. Support

If issues persist:
1. Check browser console for additional error messages
2. Review Supabase logs in the dashboard
3. Verify network connectivity to Supabase
4. Check for any CORS issues
5. Ensure all required dependencies are installed

## Current Status

The application has been enhanced with comprehensive debug tools to help identify and resolve authentication issues. The debug panels will only appear in development mode and provide real-time information about the authentication state and Supabase connectivity.
