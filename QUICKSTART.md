# Quick Start Guide

## Setting Up Tradovate OAuth

### Step 1: Get Tradovate OAuth Credentials

1. **Sign up for a Tradovate account** (if you don't have one):
   - Demo account: https://trader.tradovate.com/
   - Live account: https://live.tradovate.com/

2. **Access the API/Developer section**:
   - Log in to your Tradovate account
   - Navigate to **Settings** → **API** or **Developer Portal**
   - Look for "OAuth Applications" or "API Credentials"

3. **Create a new OAuth application**:
   - Click "Create New Application" or similar button
   - Fill in the application details:
     - **Name**: TradeState Frontend
     - **Redirect URI**: `http://localhost:3000/callback`
     - **Scopes**: Select "trading" or "full access" based on your needs
   
4. **Save your credentials**:
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Keep these secure!

### Step 2: Configure Your Environment

1. **Create a `.env` file** in the project root:

```bash
# In your terminal (Git Bash, PowerShell, or CMD)
# Copy the template
cp .env.template .env

# Or manually create a .env file
```

2. **Edit the `.env` file** with your credentials:

```env
VITE_TRADOVATE_CLIENT_ID=your_actual_client_id_here
VITE_TRADOVATE_CLIENT_SECRET=your_actual_client_secret_here
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
VITE_API_ENVIRONMENT=demo
```

### Step 3: Start the Development Server

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

### Step 4: Test the OAuth Flow

1. Open your browser to `http://localhost:3000`
2. Click **"Connect to Tradovate"**
3. You'll be redirected to Tradovate's OAuth page
4. Log in with your Tradovate credentials
5. Approve the connection
6. You'll be redirected back to the dashboard

### Troubleshooting

#### Redirect URI Mismatch Error

**Error**: "redirect_uri mismatch"

**Solution**: 
- Ensure the redirect URI in your `.env` file exactly matches the one configured in your Tradovate OAuth app
- Include the protocol: `http://localhost:3000/callback`
- Port number must match (default is 3000)

#### Missing Client ID/Secret

**Error**: "invalid_client" or undefined errors

**Solution**:
- Verify you've created the `.env` file (not `.env.template`)
- Check that there are no typos in your Client ID and Secret
- Restart the dev server after changing `.env` files

#### CORS Errors

**Error**: CORS policy blocking requests

**Solution**:
- Use Tradovate's demo environment: `VITE_API_ENVIRONMENT=demo`
- Check that your domain is allowed in Tradovate OAuth app settings
- Ensure you're using the correct API endpoints

#### Token Expiration Issues

**Issue**: Logged out unexpectedly

**Solution**:
- Tokens expire after a set time (usually 30-60 minutes)
- The app automatically refreshes tokens before expiration
- If refresh fails, you'll need to log in again

### Next Steps

1. **Customize the UI**: Edit components in `src/components/` and `src/routes/`
2. **Add Supabase integration**: Connect to your backend database
3. **Deploy to production**: See deployment section in README.md
4. **Add more brokerages**: Extend OAuth support to other platforms

### Production Deployment Checklist

Before deploying to tradestate.io:

- [ ] Update `VITE_TRADOVATE_REDIRECT_URI` to `https://tradestate.io/callback`
- [ ] Change `VITE_API_ENVIRONMENT` to `live` (for production trading)
- [ ] Add production redirect URI to Tradovate OAuth app
- [ ] Use environment variables in your hosting platform (don't commit `.env` to Git)
- [ ] Test OAuth flow with production URLs
- [ ] Enable HTTPS (most hosting providers include free SSL)

### Support Resources

- **Tradovate API Docs**: https://api.tradovate.com
- **OAuth 2.0 Specification**: https://oauth.net/2/
- **Svelte Documentation**: https://svelte.dev
- **Tailwind CSS**: https://tailwindcss.com

---

**Need Help?** Check the main [README.md](README.md) for detailed documentation.

