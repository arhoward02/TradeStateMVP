# Environment Variables Setup Guide

## Creating Your `.env` File

### Step 1: Create the File

In the root of your project (`FrontendMVP/`), create a file named `.env`

**Windows PowerShell:**
```powershell
New-Item -Path ".env" -ItemType File
```

**Windows CMD:**
```cmd
type nul > .env
```

**Or manually:**
- Right-click in the project folder
- New → Text Document
- Name it `.env` (remove the .txt extension)

### Step 2: Add Your Configuration

Open the `.env` file in a text editor and add:

```env
VITE_TRADOVATE_CLIENT_ID=your_client_id_here
VITE_TRADOVATE_CLIENT_SECRET=your_client_secret_here
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
VITE_API_ENVIRONMENT=demo
```

### Step 3: Get Tradovate Credentials

#### For Demo/Testing:

1. Visit: https://trader.tradovate.com/
2. Sign up for a free demo account
3. Navigate to Settings → API or Developer section
4. Create a new OAuth application:
   - **Name**: TradeState
   - **Redirect URI**: `http://localhost:3000/callback`
   - **Scopes**: trading (or full access)
5. Copy the generated **Client ID** and **Client Secret**

#### For Production/Live Trading:

1. Visit: https://live.tradovate.com/
2. Log in with your live trading account
3. Follow the same steps as demo
4. **Important**: Production accounts require funded trading accounts

### Step 4: Update Your `.env` File

Replace the placeholder values:

```env
# Example with real-looking values (these won't work, use your actual credentials)
VITE_TRADOVATE_CLIENT_ID=abc123def456ghi789
VITE_TRADOVATE_CLIENT_SECRET=xyz789uvw456rst123
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
VITE_API_ENVIRONMENT=demo
```

### Step 5: Restart Development Server

After creating or modifying `.env`:

1. Stop the current dev server (Ctrl+C in terminal)
2. Start it again: `npm run dev`
3. The new environment variables will be loaded

## Environment Variable Explanations

### `VITE_TRADOVATE_CLIENT_ID`
- **What it is**: Your OAuth application's public identifier
- **Where to get it**: Tradovate Developer/API settings
- **Example**: `abc123def456ghi789`
- **Required**: Yes

### `VITE_TRADOVATE_CLIENT_SECRET`
- **What it is**: Your OAuth application's secret key
- **Where to get it**: Tradovate Developer/API settings (shown once)
- **Example**: `xyz789uvw456rst123`
- **Required**: Yes
- **Security**: Never share this or commit it to Git

### `VITE_TRADOVATE_REDIRECT_URI`
- **What it is**: URL where Tradovate redirects after authentication
- **Development**: `http://localhost:3000/callback`
- **Production**: `https://tradestate.io/callback`
- **Required**: Yes
- **Important**: Must match exactly with Tradovate OAuth app settings

### `VITE_API_ENVIRONMENT`
- **What it is**: Which Tradovate API environment to use
- **Options**: 
  - `demo` - For testing with demo accounts
  - `live` - For real trading with funded accounts
- **Development**: Use `demo`
- **Production**: Use `live` (only with real accounts)
- **Default**: `demo`

## Example Configurations

### Local Development (Demo)
```env
VITE_TRADOVATE_CLIENT_ID=your_demo_client_id
VITE_TRADOVATE_CLIENT_SECRET=your_demo_client_secret
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
VITE_API_ENVIRONMENT=demo
```

### Local Development (Testing with Live)
```env
VITE_TRADOVATE_CLIENT_ID=your_live_client_id
VITE_TRADOVATE_CLIENT_SECRET=your_live_client_secret
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
VITE_API_ENVIRONMENT=live
```

### Production Deployment
```env
VITE_TRADOVATE_CLIENT_ID=your_production_client_id
VITE_TRADOVATE_CLIENT_SECRET=your_production_client_secret
VITE_TRADOVATE_REDIRECT_URI=https://tradestate.io/callback
VITE_API_ENVIRONMENT=live
```

## Troubleshooting

### Problem: "Client ID is undefined"

**Cause**: `.env` file not found or variables not loading

**Solutions**:
1. Verify `.env` file exists in project root (same folder as `package.json`)
2. Check file name is exactly `.env` (not `.env.txt`)
3. Restart dev server after creating `.env`
4. Verify no typos in variable names

### Problem: "Redirect URI mismatch"

**Cause**: Redirect URI in `.env` doesn't match Tradovate OAuth app

**Solutions**:
1. Copy exact redirect URI from Tradovate OAuth app
2. Ensure protocol matches (http vs https)
3. Ensure port matches (3000)
4. Check for trailing slashes
5. Update Tradovate OAuth app if needed

### Problem: "Invalid client credentials"

**Cause**: Wrong Client ID or Secret

**Solutions**:
1. Double-check you copied the full Client ID and Secret
2. Verify no extra spaces before/after values
3. Ensure you're using credentials from correct environment (demo vs live)
4. Try regenerating credentials in Tradovate

### Problem: Environment variables not updating

**Cause**: Dev server needs restart to load new values

**Solution**:
1. Stop dev server (Ctrl+C)
2. Run `npm run dev` again
3. Hard refresh browser (Ctrl+Shift+R)

## Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already configured)
- Use demo environment for testing
- Store production secrets securely
- Use different credentials for dev and production
- Regularly rotate secrets

### ❌ DON'T:
- Commit `.env` to Git
- Share your Client Secret
- Use production credentials in development
- Hardcode credentials in source code
- Post credentials in public forums

## Checking If It's Working

### 1. Verify File Exists
```powershell
# PowerShell
Test-Path .env
# Should return: True
```

### 2. Verify Variables Load
Add temporary debug to `src/lib/auth/tradovate.js`:

```javascript
console.log('Client ID:', import.meta.env.VITE_TRADOVATE_CLIENT_ID);
```

Check browser console - should show your Client ID (remove after testing)

### 3. Test OAuth Flow
1. Start dev server: `npm run dev`
2. Open: http://localhost:3000
3. Click "Connect to Tradovate"
4. Should redirect to Tradovate login

## Different Environments

### Development (.env)
```env
VITE_API_ENVIRONMENT=demo
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
```

### Staging (.env.staging)
```env
VITE_API_ENVIRONMENT=demo
VITE_TRADOVATE_REDIRECT_URI=https://staging.tradestate.io/callback
```

### Production (on hosting platform)
```env
VITE_API_ENVIRONMENT=live
VITE_TRADOVATE_REDIRECT_URI=https://tradestate.io/callback
```

## Getting Help

If you're still having issues:

1. Check Tradovate OAuth app settings match your `.env`
2. Verify redirect URI is exactly the same in both places
3. Check browser console for specific error messages
4. Review Tradovate API documentation
5. Try with a fresh OAuth application

## Quick Reference

| Variable | Development | Production |
|----------|-------------|------------|
| `CLIENT_ID` | Demo app ID | Live app ID |
| `CLIENT_SECRET` | Demo secret | Live secret |
| `REDIRECT_URI` | `http://localhost:3000/callback` | `https://tradestate.io/callback` |
| `API_ENVIRONMENT` | `demo` | `live` |

---

**Next Steps After Setup:**
1. Restart dev server
2. Open http://localhost:3000
3. Click "Connect to Tradovate"
4. Test the complete OAuth flow

Good luck! 🚀

