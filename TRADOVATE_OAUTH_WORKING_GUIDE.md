# Tradovate OAuth Implementation Guide

## ✅ Working Configuration

This document explains the CORRECT way to implement Tradovate OAuth after fixing multiple critical issues.

---

## 1. OAuth Initiation

### Endpoint
```
https://trader.tradovate.com/oauth
```

### Parameters (Query String)
```javascript
{
  response_type: "code",
  client_id: "YOUR_CLIENT_ID",
  redirect_uri: "http://localhost:3000/callback.html",  // Must be EXACT
  state: "RANDOM_STATE_STRING"
}
```

### ⚠️ Critical Notes
- **DO NOT** include `scope` parameter - Tradovate doesn't use it
- Redirect URI must match EXACTLY what's registered with Tradovate
- Include `.html` extension if using static callback page

---

## 2. Token Exchange

### ⚠️ CRITICAL: Use the OAuth Token Endpoint

**CORRECT Endpoint:**
```
POST https://demo.tradovateapi.com/auth/oauthtoken
```

**❌ WRONG Endpoint (Don't Use):**
```
POST https://demo.tradovateapi.com/v1/auth/accesstokenrequest
```
*This is for username/password login, NOT OAuth!*

### Request Format

**Content-Type:** `application/x-www-form-urlencoded`

**Body (Form-Encoded):**
```javascript
{
  grant_type: "authorization_code",
  client_id: "YOUR_CLIENT_ID",
  client_secret: "YOUR_CLIENT_SECRET",
  redirect_uri: "http://localhost:3000/callback.html",  // Must match initial request
  code: "AUTHORIZATION_CODE_FROM_CALLBACK"
}
```

### Example (Deno/TypeScript)
```typescript
const requestBody = {
  grant_type: "authorization_code",
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uri: redirectUri,
  code: code,
};

const formBody = new URLSearchParams(requestBody).toString();

const response = await fetch("https://demo.tradovateapi.com/auth/oauthtoken", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: formBody,
});
```

---

## 3. Token Response

### Response Format (snake_case!)
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### ⚠️ Important
- Tradovate returns **snake_case** (`access_token`), not camelCase
- Make sure to handle both formats:
```javascript
const accessToken = data.access_token || data.accessToken;
const refreshToken = data.refresh_token || data.refreshToken;
const expiresIn = data.expires_in || data.expiresIn;
```

---

## 4. Fetching User Profile

### Endpoint
```
GET https://demo.tradovateapi.com/v1/auth/me
```

**❌ WRONG:** `/user/syncrequest` or `/v1/user/me`

### Request Headers
```javascript
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Accept": "application/json"
}
```

### Example Response
```json
{
  "userId": 12345,
  "fullName": "John Doe",
  "email": "user@example.com",
  "emailVerified": true,
  "isTrial": false
}
```

---

## 5. Environment URLs

### Demo Environment
- OAuth page: `https://trader.tradovate.com/oauth`
- Token endpoint: `https://demo.tradovateapi.com/auth/oauthtoken`
- API base: `https://demo.tradovateapi.com/v1`

### Live Environment
- OAuth page: `https://trader.tradovate.com/oauth`
- Token endpoint: `https://live.tradovateapi.com/auth/oauthtoken`
- API base: `https://live.tradovateapi.com/v1`

---

## 6. Common Pitfalls to Avoid

### ❌ Don't Do This:
1. **Adding scope parameter** - Tradovate OAuth doesn't use scopes
2. **Using `/auth/accesstokenrequest`** - That's for username/password login
3. **Sending JSON instead of form-encoded** - OAuth uses form encoding
4. **Looking for camelCase fields** - Tradovate returns snake_case
5. **Wrong redirect_uri** - Must match exactly (including `.html`)
6. **Using wrong profile endpoint** - Use `/auth/me` not `/user/syncrequest`

### ✅ Do This Instead:
1. No scope parameter at all
2. Use `/auth/oauthtoken` for token exchange
3. Use `application/x-www-form-urlencoded`
4. Parse `access_token` (snake_case)
5. Match redirect_uri exactly as registered
6. Use `/auth/me` for user profile

---

## 7. OAuth Username Requirement

After successful OAuth login, Tradovate requires the **OAuth-linked username** for subsequent API calls.

### Format
```
Google:111638896328056101555
Apple:001234.567890abcdef
```

### Where to Find It
- Log into https://trader.tradovate.com with OAuth
- Go to Profile/Account Settings
- Look for "OAuth Username" or "Connected Account"

### Usage
- Store this username after first login
- NOT needed for token exchange (that uses the authorization code)
- May be needed for other API endpoints

---

## 8. Complete Flow Summary

```
1. Redirect to Tradovate OAuth
   └─> https://trader.tradovate.com/oauth?response_type=code&client_id=...

2. User logs in with Google/Apple
   └─> Tradovate handles authentication

3. Redirect back with code
   └─> http://localhost:3000/callback.html?code=ABC123&state=XYZ789

4. Exchange code for token
   └─> POST /auth/oauthtoken (form-encoded)
   └─> Returns { "access_token": "...", "refresh_token": "..." }

5. Fetch user profile
   └─> GET /auth/me (with Bearer token)
   └─> Returns user data

6. Success! User is authenticated
```

---

## 9. Key Differences from Standard OAuth

| Standard OAuth 2.0 | Tradovate OAuth |
|-------------------|-----------------|
| Usually supports scopes | ❌ No scope parameter |
| Token endpoint varies | ✅ `/auth/oauthtoken` |
| Usually returns JSON | ⚠️ Returns JSON but snake_case |
| Profile endpoint varies | ✅ `/auth/me` |
| Usually camelCase | ⚠️ snake_case response |

---

## 10. Testing Checklist

- [ ] Redirect URI matches exactly (including .html)
- [ ] No scope parameter in OAuth initiation
- [ ] Using `/auth/oauthtoken` for token exchange
- [ ] Request is form-encoded, not JSON
- [ ] Parsing `access_token` (snake_case)
- [ ] Using `/auth/me` for user profile
- [ ] Bearer token in Authorization header
- [ ] Testing with fresh authorization code (they expire fast!)

---

## Environment Variables Needed

### Frontend (.env)
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_TRADOVATE_ENVIRONMENT=demo
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html
```

### Backend (Supabase Secrets)
```bash
TRADOVATE_CLIENT_ID=your_client_id
TRADOVATE_CLIENT_SECRET=your_client_secret
TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html
TRADOVATE_ENVIRONMENT=demo
```

---

## 11. Demo vs Live Environments

### ✅ VERIFIED: Single OAuth App Handles Both!

**Great News:** Your OAuth application automatically works with **BOTH** demo and live accounts using the **same credentials**!

**What Works:**
- ✅ Demo accounts (paper trading)
- ✅ **Prop firm funded accounts** (TopStep, Earn2Trade, etc.)
- ✅ **Live personal accounts**

### How It Works

Tradovate's OAuth system intelligently:
1. Detects which account type the user is logging in with
2. Routes to the correct API environment automatically
3. Returns the appropriate access token

**No special configuration needed!** 🎉

### Account Types Explained

**Demo Environment (uses demo API):**
- Regular paper trading accounts
- **Prop firm funded accounts** (they trade real money but use demo API)

**Live Environment (uses live API):**
- Personal brokerage accounts
- Real money (non-prop firm) accounts

### Implementation Note

Even though you set `TRADOVATE_ENVIRONMENT=demo` in your config, the OAuth system handles routing correctly based on the actual account the user logs in with. Your backend's `environment` variable primarily affects which base URL to use for subsequent API calls, but the OAuth flow itself is environment-agnostic.

### Best Practice

Keep your current setup:
```bash
TRADOVATE_ENVIRONMENT=demo
```

The OAuth flow will automatically work for all account types. Users just log in with their account credentials, and Tradovate handles the rest!

---

## Conclusion

The key to making Tradovate OAuth work is:
1. Use the **correct OAuth endpoint** (`/auth/oauthtoken`)
2. Use **form-encoded** request format
3. Parse **snake_case** response fields
4. Use **correct profile endpoint** (`/auth/me`)
5. **No scope parameter**
6. **Exact redirect URI match**
7. **Understand demo vs live** for prop firm accounts

Follow these rules and it will work reliably! ✅

