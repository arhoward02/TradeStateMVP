# 🚀 Quick Start: Backend Setup

Complete guide to get TradeState running with secure Supabase backend.

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Tradovate account (demo or live)
- ✅ Tradovate OAuth app created
- ✅ Git installed

## Step 1: Clone & Install

```bash
git clone https://github.com/yourusername/tradestate.git
cd tradestate
npm install
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Click **"New Project"**
3. Fill in details:
   - **Name:** TradeState
   - **Database Password:** (save this!)
   - **Region:** Choose closest to you
4. Wait ~2 minutes for setup

## Step 3: Get Supabase Credentials

1. In Supabase dashboard, go to **Settings → API**
2. Copy:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public key** (starts with `eyJ...`)
   - **service_role key** (different from anon key)

## Step 4: Set Up Database

1. In Supabase, go to **SQL Editor**
2. Click **"New Query"**
3. Copy contents of `supabase/migrations/20231205_create_tradovate_sessions.sql`
4. Paste and click **"Run"**
5. Verify: **Database → Tables** should show `tradovate_sessions`

## Step 5: Install Supabase CLI

**Windows (PowerShell as Admin):**
```powershell
# Install Scoop package manager
iwr -useb get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Mac:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.deb -o supabase.deb
sudo dpkg -i supabase.deb
```

Verify installation:
```bash
supabase --version
```

## Step 6: Link Supabase Project

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF
```

**Find your project-ref:**
- Supabase Dashboard → Settings → General → **Reference ID**

## Step 7: Configure Edge Function Secrets

```bash
# Tradovate OAuth credentials
supabase secrets set TRADOVATE_CLIENT_ID="your_tradovate_client_id"
supabase secrets set TRADOVATE_CLIENT_SECRET="your_tradovate_client_secret"
supabase secrets set TRADOVATE_REDIRECT_URI="http://localhost:3000/callback"
supabase secrets set TRADOVATE_ENVIRONMENT="demo"

# Supabase credentials (for database access)
supabase secrets set SUPABASE_URL="https://abcdefgh.supabase.co"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

**Where to get Tradovate credentials:**
1. Go to [trader.tradovate.com](https://trader.tradovate.com)
2. Navigate to **API Settings** or **OAuth Apps**
3. Create new OAuth app if needed
4. Copy **Client ID** and **Client Secret**

## Step 8: Deploy Edge Functions

**Windows:**
```powershell
npm run supabase:deploy:win
```

**Mac/Linux:**
```bash
npm run supabase:deploy
```

Or manually:
```bash
supabase functions deploy oauth-initiate --no-verify-jwt
supabase functions deploy oauth-callback --no-verify-jwt
supabase functions deploy tradovate-proxy --no-verify-jwt
```

## Step 9: Configure Frontend

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Tradovate Configuration
VITE_TRADOVATE_ENVIRONMENT=demo
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
```

**Important:** Replace with YOUR actual Supabase URL and anon key!

## Step 10: Update Tradovate Redirect URI

1. Go to your Tradovate OAuth app settings
2. Update **Redirect URI** to: `http://localhost:3000/callback`
3. Save changes

## Step 11: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 12: Test OAuth Flow

1. Click **"Connect to Tradovate"**
2. You'll be redirected to Tradovate login
3. Sign in with your Tradovate credentials
4. Authorize the app
5. You'll be redirected back to your app
6. If first time, enter your OAuth username (format: `Provider:ID`)
7. Should redirect to dashboard! 🎉

### Finding Your OAuth Username

**Method 1: Browser Console**
1. Log in to [trader.tradovate.com](https://trader.tradovate.com)
2. Press F12 to open console
3. Run: `console.log(localStorage)`
4. Look for username like: `Google:111638896328056101555`

**Method 2: Network Tab**
1. Log in to [trader.tradovate.com](https://trader.tradovate.com)
2. Open Network tab (F12 → Network)
3. Look for API calls to `/auth/` endpoints
4. Check request/response for OAuth username

## Troubleshooting

### ❌ "Module not found: @supabase/supabase-js"

**Solution:**
```bash
npm install @supabase/supabase-js
```

### ❌ "Missing required environment variables"

**Solution:**
1. Verify `.env` file exists in project root
2. Check all variables are set correctly
3. Restart dev server: `Ctrl+C` then `npm run dev`

### ❌ "Failed to deploy functions"

**Solution:**
1. Verify you're logged in: `supabase projects list`
2. Check project is linked: `supabase status`
3. Re-link if needed: `supabase link --project-ref YOUR_REF`

### ❌ "OAuth callback failed"

**Solution:**
1. Check Tradovate redirect URI matches exactly
2. Verify secrets are set: `supabase secrets list`
3. Check Edge Function logs: `npm run supabase:logs`
4. Ensure OAuth username format is correct: `Provider:ID`

### ❌ "CORS error"

**Solution:**
1. Verify Supabase URL in `.env` is correct
2. Check anon key is correct
3. Restart dev server

## Verify Installation

### ✅ Checklist

- [ ] Supabase project created
- [ ] Database table created (`tradovate_sessions`)
- [ ] Supabase CLI installed and logged in
- [ ] Project linked to CLI
- [ ] All secrets set in Supabase
- [ ] Edge Functions deployed
- [ ] `.env` file created with correct values
- [ ] Tradovate redirect URI updated
- [ ] Dev server running
- [ ] OAuth flow working

### Test Each Component

**1. Frontend:**
```bash
npm run dev
# Should open on http://localhost:3000
```

**2. Database:**
```bash
# Check table exists
supabase db diff --linked
```

**3. Edge Functions:**
```bash
# List deployed functions
supabase functions list

# Check logs
npm run supabase:logs
```

**4. OAuth Flow:**
- Visit app → Click "Connect to Tradovate"
- Should redirect to Tradovate
- After login, should redirect back
- Should see callback page

## Next Steps

### 🎨 Customize UI
- Edit components in `src/components/`
- Modify styles in `src/app.css`
- Update Tailwind config in `tailwind.config.js`

### 🔌 Add API Features
- Create new Edge Functions in `supabase/functions/`
- Add API calls in `src/lib/auth/tradovate.js`
- Use the proxy pattern for all Tradovate API calls

### 🚀 Deploy to Production

**Frontend (Vercel/Netlify):**
1. Push code to GitHub
2. Connect to Vercel/Netlify
3. Set environment variables
4. Deploy!

**Backend (Supabase):**
1. Update secrets with production values
2. Update redirect URIs
3. Redeploy Edge Functions
4. Done!

See `DEPLOYMENT.md` for detailed production deployment guide.

## Support

- 📖 [Full Documentation](BACKEND_README.md)
- 📖 [Supabase Setup Guide](SUPABASE_SETUP.md)
- 🐛 [Report Issues](https://github.com/yourusername/tradestate/issues)

---

**Estimated setup time:** 15-20 minutes  
**Difficulty:** Intermediate

Happy trading! 🚀📈


