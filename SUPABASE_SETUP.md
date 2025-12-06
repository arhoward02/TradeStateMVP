# Supabase Backend Setup Guide

This guide will help you set up the Supabase backend for secure Tradovate OAuth authentication.

## Why We Need a Backend

Tradovate OAuth requires a `client_secret` that **must never** be exposed in browser code. By using Supabase Edge Functions, we:
- ✅ Keep `client_secret` secure on the server
- ✅ Properly exchange OAuth codes for tokens
- ✅ Store tokens in a secure database
- ✅ Proxy API requests to Tradovate

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name:** TradeState Backend
   - **Database Password:** (generate a strong password and save it)
   - **Region:** Choose closest to your users
4. Wait for project to initialize (~2 minutes)

## Step 2: Get Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon/public key:** `eyJhbGc...` (starts with eyJ)
   - **service_role key:** `eyJhbGc...` (different from anon key)

## Step 3: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase/migrations/20231205_create_tradovate_sessions.sql`
4. Click **Run** to create the `tradovate_sessions` table

## Step 4: Deploy Edge Functions

### Install Supabase CLI

**Windows (PowerShell):**
```powershell
# Install Scoop (if not already installed)
iwr -useb get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

### Login to Supabase
```bash
supabase login
```

### Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Find your **project-ref** in: Settings → General → Reference ID

### Set Edge Function Secrets

```bash
# Tradovate OAuth credentials
supabase secrets set TRADOVATE_CLIENT_ID=your_client_id
supabase secrets set TRADOVATE_CLIENT_SECRET=your_client_secret
supabase secrets set TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
supabase secrets set TRADOVATE_ENVIRONMENT=demo

# Supabase credentials (for database access)
supabase secrets set SUPABASE_URL=https://xxxxx.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Deploy Functions

```bash
# Deploy all functions
supabase functions deploy oauth-initiate
supabase functions deploy oauth-callback
supabase functions deploy tradovate-proxy
```

## Step 5: Configure Frontend Environment

Create a `.env` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Tradovate Configuration (frontend reference)
VITE_TRADOVATE_ENVIRONMENT=demo
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
```

## Step 6: Update Tradovate OAuth App

1. Go to [Tradovate API Portal](https://trader.tradovate.com)
2. Navigate to your OAuth app settings
3. Update **Redirect URI** to match your callback URL:
   - Development: `http://localhost:3000/callback`
   - Production: `https://yourdomain.com/callback`

## Step 7: Get Your OAuth Username

Tradovate requires an "OAuth-linked username" in the format: `Provider:ID`

**To find yours:**

1. Log in to [trader.tradovate.com](https://trader.tradovate.com) with your OAuth provider (Google/etc)
2. Open browser console (F12)
3. Run this code:
```javascript
// Check local storage
console.log(localStorage);
// Or check your user profile API call
```

4. Look for a username like: `Google:111638896328056101555`
5. Store this value - you'll need it for authentication

**Alternative Method:**
- On first login, the app will prompt you to enter your OAuth username
- It will be stored in localStorage for future use

## Step 8: Test the Integration

1. Start your development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000`
3. Click "Connect to Tradovate"
4. Complete OAuth flow
5. Check Supabase dashboard → Database → `tradovate_sessions` table to see stored tokens

## Production Deployment

### Update Environment Variables

1. In Supabase: Settings → Edge Functions → Update secrets with production values
2. Update `TRADOVATE_REDIRECT_URI` to your production domain
3. In your frontend `.env`, update Supabase URL to production

### Update CORS (if needed)

If you have a custom domain, update CORS in Edge Functions:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  // ...
};
```

## Troubleshooting

### "Missing required environment variables"
- Check that all secrets are set: `supabase secrets list`
- Redeploy functions after setting secrets

### "OAuth callback failed"
- Verify Tradovate redirect URI matches exactly
- Check that OAuth username is correct format
- Look at Edge Function logs: Supabase Dashboard → Edge Functions → Logs

### "Failed to fetch user profile"
- Ensure access token is valid
- Check Tradovate API status
- Verify environment (demo vs live) matches your account

## Security Notes

⚠️ **Critical Security Rules:**
1. NEVER commit `.env` files to Git
2. NEVER expose `TRADOVATE_CLIENT_SECRET` in frontend code
3. Keep `service_role_key` secure (backend only)
4. Use Row Level Security (RLS) policies in production
5. Rotate secrets periodically

## Cost Considerations

Supabase Free Tier includes:
- 500MB database space
- 2GB file storage
- 500K Edge Function invocations/month
- 2GB egress/month

This is more than enough for development and small-scale production!

## Next Steps

Once setup is complete:
1. Test OAuth flow end-to-end
2. Implement additional Tradovate API calls via proxy
3. Add token refresh logic
4. Set up production monitoring
5. Configure custom domain (optional)

---

🎉 **You're all set!** Your Tradovate OAuth is now secure and production-ready.


