# OAuth Flow Fix Guide

## What Was Fixed

Based on the Tradovate OAuth documentation, I've identified and fixed several critical issues:

### 1. ✅ Removed Scope Parameter
**Issue:** The oauth-initiate function was adding `scope: "trading"` parameter  
**Fix:** Tradovate's OAuth flow doesn't use scope parameters - removed it  
**File:** `supabase/functions/oauth-initiate/index.ts`

### 2. ✅ Corrected Redirect URI Format  
**Issue:** Configuration showed `/callback` instead of `/callback.html`  
**Fix:** Updated documentation to use correct `/callback.html` endpoint  
**Files:** `ENV_VARIABLES.md`

### 3. ✅ Verified Tradovate Custom OAuth Flow
Your backend is already correctly using Tradovate's non-standard OAuth implementation:
- ✅ Uses `/auth/accesstokenrequest` endpoint (not standard OAuth token endpoint)
- ✅ Sends `name` (OAuth username) and `password` (authorization code)
- ✅ Includes `appId`, `appVersion`, `deviceId`, `cid`, `sec` parameters

## What You Need to Do Now

### Step 1: Verify Your Environment Variables

#### Frontend (.env file in project root)
Create or update your `.env` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Tradovate Configuration
VITE_TRADOVATE_ENVIRONMENT=demo
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html
```

**CRITICAL:** Make sure you use the EXACT URL: `http://localhost:3000/callback.html`

#### Backend (Supabase Edge Functions Secrets)
Run these commands to set your backend environment variables:

```powershell
# Login to Supabase (if not already)
supabase login

# Link to your project (if not already)
supabase link --project-ref YOUR_PROJECT_REF

# Set the secrets
supabase secrets set TRADOVATE_CLIENT_ID=your_client_id_from_tradovate
supabase secrets set TRADOVATE_CLIENT_SECRET=your_client_secret_from_tradovate
supabase secrets set TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html
supabase secrets set TRADOVATE_ENVIRONMENT=demo
supabase secrets set SUPABASE_URL=https://your-project.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

To verify secrets are set:
```powershell
supabase secrets list
```

### Step 2: Register Redirect URI with Tradovate

**CRITICAL:** You must register the **exact** redirect URI with Tradovate:

```
http://localhost:3000/callback.html
```

Contact Tradovate support or check your application settings to ensure:
- ✅ Redirect URI is `http://localhost:3000/callback.html`
- ✅ OAuth is enabled for your application
- ✅ You have valid CLIENT_ID and CLIENT_SECRET

### Step 3: Deploy Updated Edge Functions

```powershell
# Deploy the updated oauth-initiate function
cd supabase
.\deploy.ps1

# Or if on Mac/Linux:
./deploy.sh
```

### Step 4: Restart Dev Server

```powershell
# Stop current server (Ctrl+C)
# Start fresh
npm run dev
```

## Understanding the OAuth Flow

Here's exactly what happens when it works correctly:

```
1. User clicks "Connect to Tradovate"
   └─> Frontend calls: GET /oauth-initiate
   
2. Backend generates OAuth URL:
   └─> https://trader.tradovate.com/oauth?
       response_type=code&
       client_id=YOUR_ID&
       redirect_uri=http://localhost:3000/callback.html&
       state=RANDOM_STATE
   
3. User redirected to Tradovate login
   └─> User logs in with Google/Apple
   
4. Tradovate redirects back:
   └─> http://localhost:3000/callback.html?code=AUTH_CODE&state=SAME_STATE
   
5. callback.html extracts code/state:
   └─> Redirects to: http://localhost:3000/#/callback?code=AUTH_CODE&state=SAME_STATE
   
6. OAuthCallback.svelte receives code:
   └─> Calls: POST /oauth-callback with { code, state, oauth_username }
   
7. Backend exchanges code for token:
   └─> POST to Tradovate: /auth/accesstokenrequest
       {
         name: "Google:123456789",  // OAuth username
         password: "AUTH_CODE",     // The authorization code
         appId: "TradeState",
         cid: "YOUR_CLIENT_ID",
         sec: "YOUR_CLIENT_SECRET"
       }
   
8. Backend returns access token:
   └─> Frontend stores token and redirects to dashboard
```

## Troubleshooting

### Issue: "OAuth callback failed" or "Missing authorization code"

**Possible causes:**
1. Redirect URI mismatch between:
   - Your .env file
   - Supabase secrets
   - Tradovate registration
   
**Fix:** Ensure ALL three locations use `http://localhost:3000/callback.html`

### Issue: "Invalid state parameter"

**Possible causes:**
- SessionStorage cleared between steps
- Browser blocking cross-origin cookies

**Fix:** 
1. Don't open OAuth flow in new window/tab
2. Check browser console for errors
3. Verify callback.html is working

### Issue: "Token exchange failed"

**Possible causes:**
1. Missing or incorrect OAuth username
2. Invalid client credentials
3. Authorization code already used (single-use!)

**Fix:**
1. Check Supabase logs: `npm run supabase:logs`
2. Verify secrets: `supabase secrets list`
3. Get fresh authorization code (restart OAuth flow)

### Issue: Need OAuth Username

After successful Tradovate login, you'll need your OAuth username format:
- Google: `Google:111638896328056101555`
- Apple: `Apple:001234.567890abcdef`

**How to find it:**
1. Log into trader.tradovate.com directly with OAuth
2. Open browser console (F12)
3. Go to Application/Storage > Local Storage
4. Look for user profile data
5. Find the OAuth-linked username

**OR** contact Tradovate support for your OAuth username.

## Testing Checklist

- [ ] Environment variables set in `.env`
- [ ] Supabase secrets configured
- [ ] Redirect URI registered with Tradovate
- [ ] Edge functions deployed
- [ ] Dev server running on port 3000
- [ ] Can click "Connect to Tradovate"
- [ ] Redirects to Tradovate login
- [ ] After login, returns to callback.html
- [ ] callback.html redirects to /#/callback
- [ ] OAuthCallback.svelte shows loading spinner
- [ ] Either prompts for OAuth username OR exchanges token
- [ ] Successfully redirects to dashboard

## Quick Debug Commands

```powershell
# Check if Edge Functions are deployed
supabase functions list

# View real-time logs
npm run supabase:logs

# Test oauth-initiate endpoint directly
curl https://your-project.supabase.co/functions/v1/oauth-initiate

# Verify dev server port
# Should say "running on http://localhost:3000"
```

## Common Mistakes

❌ **Wrong:** `http://localhost:3000/callback`  
✅ **Right:** `http://localhost:3000/callback.html`

❌ **Wrong:** Using `http://127.0.0.1:3000/callback.html`  
✅ **Right:** Using `http://localhost:3000/callback.html`

❌ **Wrong:** Adding scope parameter to OAuth URL  
✅ **Right:** Only use: response_type, client_id, redirect_uri, state

❌ **Wrong:** Storing CLIENT_SECRET in frontend .env  
✅ **Right:** CLIENT_SECRET only in Supabase secrets

## Next Steps

1. **For Development:**
   - Complete the checklist above
   - Test the full OAuth flow
   - Document your OAuth username for future use

2. **For Production:**
   - Update redirect URI to your production domain
   - Register production redirect URI with Tradovate
   - Update Supabase secrets for production
   - See DEPLOYMENT.md for full production setup

## Need Help?

If you're still having issues:

1. **Check Logs:**
   ```powershell
   npm run supabase:logs
   ```

2. **Verify Network Tab:**
   - Open browser DevTools → Network
   - Watch the OAuth flow
   - Check which step fails

3. **Common Errors:**
   - 400 Bad Request → Check redirect URI
   - 401 Unauthorized → Check client credentials
   - 404 Not Found → Edge function not deployed
   - CORS error → Check Supabase URL in .env

## Resources

- [Tradovate OAuth Docs](https://api.tradovate.com/#section/Authentication/OAuth)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- Project docs: `QUICKSTART_BACKEND.md`

---

**Status:** ✅ OAuth flow fixes applied  
**Next:** Configure environment variables and test  
**Last Updated:** December 6, 2024

