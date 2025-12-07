# Task: Remove OAuth Username Requirement

**Context for AI Agent:**

---

## 🎯 Current Situation

The Tradovate OAuth flow is **WORKING** on both local (localhost:3000) and production (https://trade-state-mvp-4e3g.vercel.app).

**Problem:** After users log in with Tradovate (using Google/Apple OAuth), they are prompted to enter their "OAuth username" (e.g., `Google:111638896328056101555`).

**Goal:** Remove this step entirely. Users should go directly to the dashboard after OAuth login, just like TradeZella does.

---

## ✅ What's Working Right Now

- OAuth initiation (✅)
- Tradovate login page (✅)
- Redirect back to app (✅)
- Token exchange with Tradovate (✅)
- **BUT:** Asks for OAuth username before completing (❌)
- Dashboard loads with user data (✅)

---

## 🐛 Why It's Asking for OAuth Username

This is a **leftover from an earlier bug fix**. We were using the wrong Tradovate endpoint (`/auth/accesstokenrequest`) which required the OAuth username. 

We've since fixed it to use the **correct endpoint** (`/auth/oauthtoken`), which does **NOT** need the OAuth username. The authorization code contains all necessary information.

**The OAuth username is completely unnecessary!**

---

## 📝 Files That Need to Be Modified

### **1. Frontend: `src/routes/OAuthCallback.svelte`**

**Current behavior:**
- Checks if OAuth username is stored in localStorage
- If not found, shows a form asking user to enter it
- Only after entering it, completes authentication

**What to change:**
- Remove the username check (lines ~42-50)
- Remove the `needsUsername` state
- Remove the username input form (lines ~112-165)
- Call `completeAuthentication()` directly without username parameter

**Specifically:**
```javascript
// REMOVE THIS:
const storedUsername = localStorage.getItem('tradovate_oauth_username');
if (!storedUsername) {
  needsUsername = true;
  loading = false;
  return;
}
await completeAuthentication(storedUsername);

// REPLACE WITH:
await completeAuthentication();
```

---

### **2. Frontend: `src/lib/auth/tradovate.js`**

**Current behavior:**
- `handleCallback()` function accepts `oauthUsername` parameter
- Sends it to backend in the request body
- Stores it in localStorage

**What to change:**

**Function signature (line ~57):**
```javascript
// REMOVE oauth_username parameter:
export async function handleCallback(code, state, oauthUsername)

// CHANGE TO:
export async function handleCallback(code, state)
```

**Request body (lines ~76-80):**
```javascript
// REMOVE oauth_username from body:
body: JSON.stringify({
  code,
  state,
  oauth_username: oauthUsername || localStorage.getItem('tradovate_oauth_username'),
}),

// CHANGE TO:
body: JSON.stringify({
  code,
  state,
}),
```

**Remove localStorage code (lines ~93-96):**
```javascript
// DELETE THIS:
if (oauthUsername) {
  localStorage.setItem('tradovate_oauth_username', oauthUsername);
}
```

---

### **3. Backend: `supabase/functions/oauth-callback/index.ts`**

**Current behavior:**
- Receives `oauth_username` from request body
- Doesn't actually use it in the standard OAuth token exchange
- Stores it in database (unnecessary)

**What to change:**

**Request body parsing (line ~36):**
```typescript
// CURRENT:
const { code, state, oauth_username } = await req.json();

// CHANGE TO:
const { code, state } = await req.json();
```

**Add comment:**
```typescript
// Note: oauth_username not needed for standard OAuth flow
// The authorization code contains all necessary user information
```

**Database storage (lines ~100-107):**
```typescript
// REMOVE oauth_username from insert:
await supabase.from("tradovate_sessions").insert({
  oauth_username: oauth_username,  // DELETE THIS LINE
  access_token: accessToken,
  refresh_token: refreshToken,
  expires_at: expiresAt.toISOString(),
  user_id: userId,
  created_at: new Date().toISOString(),
});
```

---

## 🧪 Testing Steps

After making the changes:

### **1. Deploy Backend:**
```bash
supabase functions deploy oauth-callback --no-verify-jwt
```

### **2. Test Locally:**
```bash
# Make sure dev server is running
npm run dev

# In browser:
1. Go to http://localhost:3000
2. Clear browser data: sessionStorage.clear(); localStorage.clear();
3. Click "Connect to Tradovate"
4. Log in with Google/Apple
5. Should redirect directly to dashboard (no username prompt!)
```

### **3. Commit and Push:**
```bash
git add .
git commit -m "Remove OAuth username requirement - match TradeZella UX"
git push
```

### **4. Test Production:**
```bash
# After Vercel rebuilds:
1. Go to https://trade-state-mvp-4e3g.vercel.app
2. Clear browser data
3. Test OAuth flow
4. Should work without username prompt!
```

---

## ⚠️ Important Configuration

**Backend Secrets (Supabase):**
```bash
TRADOVATE_CLIENT_ID=8748
TRADOVATE_CLIENT_SECRET=(your secret)
TRADOVATE_REDIRECT_URI=https://trade-state-mvp-4e3g.vercel.app/callback.html  # For production
# OR
TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html  # For local testing
```

**Note:** You can only have ONE redirect URI at a time in Tradovate (limitation of their OAuth app). Switch between local and production as needed.

---

## 📚 Reference Documents

- `TRADOVATE_OAUTH_WORKING_GUIDE.md` - Complete OAuth implementation guide
- `PRODUCTION_OAUTH_CONFIG.md` - Current working configuration
- `OAUTH_FIX_SUMMARY.md` - History of fixes applied

---

## ✅ Expected Result

After this change, the OAuth flow will be:
```
1. User clicks "Connect to Tradovate"
2. Redirects to Tradovate login
3. User logs in with Google/Apple
4. Redirects back to app
5. Token exchange happens automatically
6. User immediately sees dashboard
   (NO username prompt!)
```

**This will match TradeZella's smooth UX!** 🎉

---

## 🔒 Rollback Plan

If something goes wrong:
```bash
git revert HEAD
git push
supabase functions deploy oauth-callback --no-verify-jwt
```

Or restore from checkpoint commit: `d69666c`

---

**Status:** Ready for next agent to implement  
**Estimated Time:** 10-15 minutes  
**Risk Level:** Low (have checkpoint to rollback)  
**Expected Outcome:** Improved UX matching TradeZella

