# Quick OAuth Fix Checklist

## What I Fixed For You ✅

1. ✅ Removed invalid `scope` parameter from oauth-initiate function
2. ✅ Updated documentation with correct redirect URI format (`/callback.html`)
3. ✅ Verified backend is using correct Tradovate OAuth flow

## What You Need To Do (5 Minutes)

### 1️⃣ Check Your .env File

Open your `.env` file and make sure it has:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TRADOVATE_ENVIRONMENT=demo
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html
```

**Important:** The redirect URI MUST be `http://localhost:3000/callback.html`

### 2️⃣ Set Supabase Secrets

```powershell
supabase secrets set TRADOVATE_CLIENT_ID=your_client_id
supabase secrets set TRADOVATE_CLIENT_SECRET=your_client_secret
supabase secrets set TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html
supabase secrets set TRADOVATE_ENVIRONMENT=demo
```

Verify:
```powershell
supabase secrets list
```

### 3️⃣ Verify Tradovate Registration

Make sure Tradovate has this EXACT redirect URI registered:
```
http://localhost:3000/callback.html
```

If not, contact Tradovate support to update it.

### 4️⃣ Deploy Updated Functions

```powershell
cd supabase
.\deploy.ps1
```

### 5️⃣ Test It!

```powershell
npm run dev
```

Then:
1. Go to http://localhost:3000
2. Click "Connect to Tradovate"
3. Log in with Google/Apple
4. You should be redirected back!

## If It Doesn't Work

Check the logs:
```powershell
npm run supabase:logs
```

Look in browser console (F12) for errors.

Read the full troubleshooting guide: `OAUTH_FLOW_FIX.md`

## The Key Issue

Based on the Tradovate OAuth documentation you provided, the main problems were:

1. **Scope parameter** - Tradovate doesn't use this, but we were sending it
2. **Redirect URI** - Needs to be exactly `callback.html` not just `callback`
3. **Configuration consistency** - All three places (frontend .env, backend secrets, Tradovate registration) must match EXACTLY

## Expected Flow

```
User clicks button 
  → Backend generates OAuth URL
  → Redirects to Tradovate
  → User logs in
  → Tradovate redirects to callback.html?code=XXX&state=YYY
  → callback.html redirects to /#/callback?code=XXX&state=YYY
  → App exchanges code for token
  → Success! 🎉
```

## OAuth Username

After first successful login, you'll need to provide your OAuth username:
- Format: `Google:111638896328056101555` or `Apple:001234.567890`
- This is stored and reused for future logins
- You only need to enter it once

## Still Stuck?

1. Read: `OAUTH_FLOW_FIX.md` (comprehensive guide)
2. Check: Supabase logs with `npm run supabase:logs`
3. Verify: Network tab in browser DevTools
4. Test: Each step individually

The backend code is correct (it's already using Tradovate's custom OAuth flow). The issue is likely just configuration mismatches.


