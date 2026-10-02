# Email Authentication Setup for Kitchen Food

## Problem
Sign-up requires email confirmation, but emails aren't being sent. This is because Supabase email provider isn't configured.

## Solution Options

### Option 1: Disable Email Verification (Fastest - For Development)
1. Go to Supabase Dashboard: https://app.supabase.com
2. Navigate to your project: `ruwndgtsequulazlbfhd`
3. **Authentication → Providers → Email**
4. Turn OFF "Confirm email"
5. Click **Save**

**Result**: Users can sign up and immediately access the app without email verification.

---

### Option 2: Enable Email Service (For Production)
1. Go to Supabase Dashboard
2. **Email → SMTP Settings**
3. Set up one of:
   - **Supabase SMTP** (built-in) - Enable in Settings
   - **Custom SMTP** - Gmail, SendGrid, or other provider
4. Set **From Email**: `noreply@yourapp.com`
5. Configure Redirect URLs:
   - Add: `http://localhost:5501` (local development)
   - Add: `https://yourdomain.vercel.app` (production)

---

### Option 3: Enable OAuth Instead (Recommended)
1. Go to Supabase Dashboard
2. **Authentication → Providers**
3. Enable Google OAuth:
   - Google Console: Create OAuth 2.0 credentials
   - Add redirect: `https://ruwndgtsequulazlbfhd.supabase.co/auth/v1/callback`
4. Users can now sign in with Google - no email setup needed!

---

## Quick Fix (Right Now)
**Run this in Supabase SQL Editor:**
```sql
-- Disable email confirmation requirement
UPDATE auth.config 
SET require_email_confirmation = false 
WHERE id = '1';
```

Or use the Dashboard UI (Option 1 above - it's easier).

---

## Vercel Deployment
After fixing email setup locally, update Vercel environment variables:
1. Go to Vercel Project Settings
2. Add environment variable:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ruwndgtsequulazlbfhd.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your anon key)
3. Redeploy

---

## Status
- ✅ Local development: http://localhost:5501
- ✅ All features working (recipe generation with Ollama)
- ⚠️ Email authentication: Needs Supabase configuration

Choose **Option 1** (disable email verification) to test immediately, then move to **Option 2 or 3** for production.
