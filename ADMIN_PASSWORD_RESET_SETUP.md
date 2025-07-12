# Admin Password Reset Setup Guide

## Current Issue Fixed

The admin password reset functionality has been updated to properly reset agent passwords in the Supabase Auth system. Previously, it was only generating new passwords without actually updating them in the authentication system.

## How It Works Now

The system now supports two modes for password reset:

### Mode 1: Service Role Key (Recommended for Production)
- **Requires**: Supabase Service Role Key in environment variables
- **Behavior**: Directly updates the agent's password in Supabase Auth
- **Result**: Admin gets the new password to share with the agent
- **Advantage**: Immediate password change, agent can login right away

### Mode 2: Password Reset Email (Current Fallback)
- **Requires**: No additional setup
- **Behavior**: Sends a password reset email to the agent
- **Result**: Agent receives an email with a reset link
- **Advantage**: More secure, agent sets their own password

## Setting Up Service Role Key (Optional)

To enable direct password updates (Mode 1), follow these steps:

### 1. Get Your Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)

### 2. Add to Environment Variables

Add this line to your `.env.local` file:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Important Security Notes:**
- The service role key has full database access
- Never commit this key to version control
- Only use in secure server environments
- For client-side apps, the email reset method is more secure

### 3. Restart Your Application

After adding the environment variable, restart your development server.

## Current Behavior

**Without Service Role Key (Current Setup):**
- Admin clicks "Reset Password" 
- System sends password reset email to agent
- Agent receives email and follows reset link
- Agent sets new password
- Admin sees message: "A password reset email has been sent..."

**With Service Role Key:**
- Admin clicks "Reset Password"
- System generates new password and updates it immediately
- Admin sees the new password to share with agent
- Agent can login immediately with new password

## Testing the Fix

1. **Test Password Reset**: Go to Admin Dashboard → Agents → Select an agent → View Credentials → Reset Password
2. **Verify Email Sent**: Check that the agent receives a password reset email
3. **Test Login**: Have the agent follow the reset link and set a new password
4. **Confirm Login**: Verify the agent can login with the new password

## Troubleshooting

### Agent Not Receiving Reset Email
- Check spam/junk folder
- Verify email address is correct in agent profile
- Check Supabase email settings in dashboard

### Reset Link Not Working
- Ensure the redirect URL is configured correctly in Supabase
- Check that the reset link hasn't expired (usually 1 hour)

### Service Role Key Issues
- Verify the key is correct and has proper permissions
- Check environment variable name is exactly: `VITE_SUPABASE_SERVICE_ROLE_KEY`
- Restart the application after adding the key

## Security Best Practices

1. **Use Email Reset for Production**: More secure than direct password updates
2. **Rotate Service Role Keys**: Regularly update service role keys
3. **Monitor Access**: Keep track of who has admin access
4. **Audit Logs**: Monitor password reset activities

## Next Steps

The current implementation with email reset is secure and functional. Consider adding the service role key only if you need immediate password updates for operational efficiency.
