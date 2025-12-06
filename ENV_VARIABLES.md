# Environment Variables Configuration

## Frontend (.env)

Create a `.env` file in the project root with these variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Tradovate Configuration (for frontend reference only)
VITE_TRADOVATE_ENVIRONMENT=demo
# IMPORTANT: Must match Supabase env and Tradovate registration
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html
```

## Supabase Edge Functions

Set these in your Supabase project dashboard under **Settings > Edge Functions > Secrets**:

```bash
# Tradovate OAuth Credentials (BACKEND ONLY - DO NOT EXPOSE IN FRONTEND)
TRADOVATE_CLIENT_ID=your_tradovate_client_id
TRADOVATE_CLIENT_SECRET=your_tradovate_client_secret
# CRITICAL: This MUST match EXACTLY what you registered with Tradovate
TRADOVATE_REDIRECT_URI=http://localhost:3000/callback.html
TRADOVATE_ENVIRONMENT=demo

# Supabase (for Edge Functions to access database)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Security Note

⚠️ **CRITICAL:** Never commit actual credentials to Git!
- `TRADOVATE_CLIENT_SECRET` must ONLY exist in Supabase Edge Functions
- Frontend should NEVER have access to client_secret
- Use `.gitignore` to exclude `.env` files


