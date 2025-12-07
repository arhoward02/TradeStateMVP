# TradeState Backend Architecture

## Overview

This project now uses **Supabase Edge Functions** as a secure backend to handle Tradovate OAuth authentication. This architecture ensures that sensitive credentials (`client_secret`) are never exposed to the browser.

## Architecture Diagram

```
┌─────────────────┐
│   Frontend      │
│   (Svelte)      │
└────────┬────────┘
         │
         │ HTTPS
         │
         ▼
┌─────────────────────────────────────┐
│   Supabase Edge Functions           │
│   (Backend - TypeScript/Deno)       │
│                                     │
│  • oauth-initiate                   │
│  • oauth-callback                   │
│  • tradovate-proxy                  │
└────────┬───────────────┬───────────┘
         │               │
         │               │
         ▼               ▼
┌──────────────┐  ┌──────────────┐
│  Tradovate   │  │  Supabase    │
│  API         │  │  Database    │
└──────────────┘  └──────────────┘
```

## Why This Architecture?

### ❌ Previous Problem: Client-Side OAuth

```javascript
// 🚨 INSECURE - client_secret exposed in browser!
const response = await fetch('https://tradovate.com/token', {
  body: JSON.stringify({
    client_id: 'public_id',
    client_secret: 'secret_key_123', // ⚠️ EXPOSED!
  })
});
```

### ✅ New Solution: Server-Side OAuth

```javascript
// ✅ SECURE - secret stays on backend
const response = await fetch('https://your-project.supabase.co/functions/v1/oauth-callback', {
  body: JSON.stringify({
    code: authCode,
    state: csrfState,
  })
});
// Backend handles client_secret securely
```

## Edge Functions

### 1. `oauth-initiate`

**Purpose:** Generate OAuth authorization URL with CSRF protection

**Endpoint:** `GET /functions/v1/oauth-initiate`

**Flow:**
1. Frontend calls this endpoint
2. Backend generates secure `state` parameter
3. Returns Tradovate OAuth URL
4. Frontend stores state and redirects user

**Example Response:**
```json
{
  "authUrl": "https://trader.tradovate.com/oauth?client_id=...&state=...",
  "state": "abc123def456..."
}
```

### 2. `oauth-callback`

**Purpose:** Exchange authorization code for access tokens securely

**Endpoint:** `POST /functions/v1/oauth-callback`

**Request Body:**
```json
{
  "code": "authorization_code_from_tradovate",
  "state": "csrf_state_token",
  "oauth_username": "Google:111638896328056101555"
}
```

**Flow:**
1. Tradovate redirects user back with `code`
2. Frontend calls this endpoint with code
3. Backend exchanges code for tokens using `client_secret` (secure!)
4. Backend stores tokens in database
5. Returns tokens to frontend for session management

**Example Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "refreshToken": "def456...",
  "expiresAt": "2024-12-06T10:30:00Z",
  "tokenType": "Bearer",
  "userId": 12345
}
```

### 3. `tradovate-proxy`

**Purpose:** Proxy authenticated API requests to Tradovate

**Endpoint:** `GET/POST /functions/v1/tradovate-proxy?endpoint=/user/syncrequest`

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Flow:**
1. Frontend makes API call through proxy
2. Backend forwards request to Tradovate
3. Returns response to frontend

**Why Proxy?**
- Centralized logging and monitoring
- Rate limiting control
- Request/response transformation if needed
- Future extensibility (caching, analytics, etc.)

## Database Schema

### `tradovate_sessions` Table

Stores OAuth tokens and session data:

```sql
CREATE TABLE tradovate_sessions (
  id UUID PRIMARY KEY,
  oauth_username TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Features:**
- Row Level Security (RLS) enabled
- Automatic `updated_at` timestamp
- Indexed for fast lookups
- Cleanup function for expired sessions

## Security Features

### 🔐 What's Secure Now

1. **Client Secret Protection**
   - ✅ Stored only in Supabase Edge Function secrets
   - ✅ Never exposed to browser
   - ✅ Never in frontend code or environment variables

2. **CSRF Protection**
   - ✅ Random state parameter generated per OAuth flow
   - ✅ State verified on callback
   - ✅ Prevents cross-site request forgery attacks

3. **Token Storage**
   - ✅ Access tokens stored in backend database
   - ✅ Row Level Security policies
   - ✅ Automatic expiration handling

4. **Environment Isolation**
   - ✅ Development vs Production environments
   - ✅ Separate credentials per environment
   - ✅ No hardcoded credentials

### 🔒 Best Practices Implemented

- **Principle of Least Privilege:** Frontend only gets what it needs
- **Defense in Depth:** Multiple layers of security
- **Secure by Default:** All functions require explicit configuration
- **Audit Trail:** All requests logged in Supabase

## Environment Configuration

### Frontend (.env)

```bash
# Public - safe to expose
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Reference only
VITE_TRADOVATE_ENVIRONMENT=demo
```

### Backend (Supabase Secrets)

```bash
# Private - never exposed
TRADOVATE_CLIENT_ID=your_client_id
TRADOVATE_CLIENT_SECRET=your_client_secret
TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
TRADOVATE_ENVIRONMENT=demo
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Deployment

### Quick Deploy

**Windows:**
```powershell
cd supabase
.\deploy.ps1
```

**Mac/Linux:**
```bash
cd supabase
chmod +x deploy.sh
./deploy.sh
```

### Manual Deploy

```bash
# Login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set TRADOVATE_CLIENT_ID=your_id
supabase secrets set TRADOVATE_CLIENT_SECRET=your_secret

# Deploy functions
supabase functions deploy oauth-initiate
supabase functions deploy oauth-callback
supabase functions deploy tradovate-proxy
```

## Testing

### Local Testing

1. Start Supabase locally:
```bash
supabase start
```

2. Deploy functions locally:
```bash
supabase functions serve
```

3. Update frontend `.env`:
```bash
VITE_SUPABASE_URL=http://localhost:54321
```

4. Test OAuth flow

### Production Testing

1. Deploy to Supabase
2. Update frontend with production Supabase URL
3. Test full OAuth flow
4. Monitor logs in Supabase dashboard

## Monitoring & Debugging

### View Logs

```bash
# Real-time logs
supabase functions logs oauth-callback --follow

# Historical logs
supabase functions logs oauth-callback --limit 100
```

### Dashboard

View in Supabase Dashboard:
- **Edge Functions** → Select function → **Logs** tab
- **Database** → `tradovate_sessions` table
- **API** → Request logs

### Common Issues

**"Missing required environment variables"**
- Solution: Set secrets in Supabase dashboard
- Verify: `supabase secrets list`

**"OAuth callback failed"**
- Check Tradovate redirect URI matches exactly
- Verify OAuth username format: `Provider:ID`
- Check Edge Function logs

**"Failed to fetch user profile"**
- Verify access token is valid
- Check Tradovate environment (demo vs live)
- Look for errors in proxy logs

## Future Enhancements

- [ ] Token refresh automation
- [ ] Rate limiting per user
- [ ] API response caching
- [ ] Webhook support for real-time updates
- [ ] Multi-user account management
- [ ] Session management and revocation
- [ ] Analytics and usage tracking

## Cost Breakdown

### Supabase Free Tier
- 500MB database: ✅ Plenty for tokens
- 2GB storage: ✅ More than enough
- 500K Edge Function calls/month: ✅ ~16K/day
- $0/month

### Estimated Usage
- OAuth flow: ~3 function calls per login
- API calls: ~10-100/user/day
- **Total cost for 100 active users:** $0/month (within free tier)

## Contributing

When adding new Edge Functions:
1. Create function directory in `supabase/functions/`
2. Add `index.ts` with Deno serve handler
3. Update `supabase/config.toml`
4. Deploy with `supabase functions deploy`
5. Update this README

## Support

- 📖 [Supabase Docs](https://supabase.com/docs)
- 📖 [Tradovate API Docs](https://api.tradovate.com)
- 🐛 [Report Issues](https://github.com/yourusername/tradestate/issues)

---

**Built with:**
- [Supabase](https://supabase.com) - Backend as a Service
- [Deno](https://deno.land) - Edge Function runtime
- [Svelte](https://svelte.dev) - Frontend framework
- [Tradovate](https://tradovate.com) - Trading platform



