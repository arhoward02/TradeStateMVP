# Deploying to tradestate.io (Squarespace Domain)

## Overview

Since you own `tradestate.io` through Squarespace, you'll need to:
1. Choose a hosting platform for your Svelte application
2. Deploy your code to that platform
3. Point your Squarespace domain to the hosting platform

**Important**: Squarespace is great for Squarespace websites, but you can't host custom Svelte code directly on Squarespace. You need a separate hosting platform and then connect your domain to it.

## Recommended Approach: Vercel (Easiest & Best for This App)

Vercel is perfect for Svelte/Vite applications and offers:
- ✅ Free hosting (generous free tier)
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN (fast worldwide)
- ✅ Automatic deployments from Git
- ✅ Easy domain connection
- ✅ Built-in support for environment variables

---

## Complete Step-by-Step Guide

### Phase 1: Prepare Your Code

#### Step 1: Create a GitHub Account (if you don't have one)

1. Go to https://github.com
2. Sign up for free
3. Verify your email

#### Step 2: Push Your Code to GitHub

Open a terminal in your project folder and run:

```bash
# Initialize Git repository
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - TradeState frontend"

# Create new repository on GitHub
# Go to https://github.com/new
# Name it: tradestate-frontend
# Don't initialize with README (your code already has one)
# Click "Create repository"

# Back in terminal, connect to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/tradestate-frontend.git

# Push code
git branch -M main
git push -u origin main
```

**Tip**: If Git asks for credentials, use a GitHub Personal Access Token instead of password.

---

### Phase 2: Deploy to Vercel

#### Step 3: Sign Up for Vercel

1. Go to https://vercel.com/signup
2. Click **"Continue with GitHub"** (easiest option)
3. Authorize Vercel to access your GitHub account
4. Complete the signup

#### Step 4: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find and select your `tradestate-frontend` repository
3. Click **"Import"**

#### Step 5: Configure Project Settings

Vercel will auto-detect Vite configuration. Configure these settings:

**Framework Preset**: Vite (should auto-detect)
**Root Directory**: `./` (leave as default)
**Build Command**: `npm run build`
**Output Directory**: `dist`

#### Step 6: Add Environment Variables

**CRITICAL**: Add your environment variables before deploying!

In the Vercel project setup page, click **"Environment Variables"**:

Add these 4 variables:

| Name | Value |
|------|-------|
| `VITE_TRADOVATE_CLIENT_ID` | Your Tradovate Client ID |
| `VITE_TRADOVATE_CLIENT_SECRET` | Your Tradovate Client Secret |
| `VITE_TRADOVATE_REDIRECT_URI` | `https://tradestate.io/callback` |
| `VITE_API_ENVIRONMENT` | `demo` (or `live` for production) |

**Select**: Production, Preview, and Development (all three)

#### Step 7: Deploy

1. Click **"Deploy"**
2. Wait 1-2 minutes for build to complete
3. You'll get a temporary URL like: `https://tradestate-frontend-abc123.vercel.app`
4. Test this URL first to make sure everything works!

---

### Phase 3: Update Tradovate OAuth Settings

Before connecting your domain, update your Tradovate OAuth app:

1. Log in to Tradovate
2. Go to Settings → API/Developer
3. Edit your OAuth application
4. Add **two** redirect URIs:
   - `https://tradestate.io/callback`
   - `https://www.tradestate.io/callback` (include www version too)
5. Add allowed origins:
   - `https://tradestate.io`
   - `https://www.tradestate.io`
6. Save changes

---

### Phase 4: Connect Squarespace Domain to Vercel

This is where you connect your Squarespace domain to your Vercel deployment.

#### Step 8: Add Domain in Vercel

1. In your Vercel project dashboard, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter: `tradestate.io`
4. Click **"Add"**
5. Also add: `www.tradestate.io`
6. Click **"Add"** again

Vercel will show you DNS configuration instructions.

#### Step 9: Configure DNS in Squarespace

Now you need to update DNS settings in Squarespace:

1. Log in to your Squarespace account
2. Go to **Settings** → **Domains**
3. Click on **tradestate.io**
4. Click **"Advanced Settings"**
5. Click **"DNS Settings"** or **"Manage DNS"**

#### Step 10: Update DNS Records

You'll need to add/update these DNS records:

**Option A: Using A Records (Recommended)**

Delete any existing A records, then add:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 3600 |
| CNAME | www | `cname.vercel-dns.com.` | 3600 |

**Option B: Using CNAME (if Squarespace doesn't allow A records)**

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | @ | `cname.vercel-dns.com.` | 3600 |
| CNAME | www | `cname.vercel-dns.com.` | 3600 |

**Note**: Vercel will show you the exact records in their dashboard. Use those if different from above.

#### Step 11: Save and Wait

1. Save DNS changes in Squarespace
2. DNS propagation takes **10 minutes to 48 hours** (usually 1-2 hours)
3. Vercel will automatically verify the domain
4. Vercel will automatically provision SSL certificate

---

### Phase 5: Verify Deployment

#### Step 12: Test Your Live Site

Once DNS propagates (check status in Vercel dashboard):

1. Open https://tradestate.io in your browser
2. You should see your login page
3. Click **"Connect to Tradovate"**
4. Complete OAuth flow
5. Verify you're redirected to dashboard

**If you see errors:**
- Wait longer for DNS to propagate
- Clear browser cache (Ctrl + Shift + Delete)
- Try incognito/private browsing mode
- Check Vercel deployment logs

---

## Alternative Option: Netlify

If you prefer Netlify over Vercel:

### Deploy to Netlify

1. Go to https://netlify.com
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your GitHub repository
5. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables in **Site settings** → **Environment variables**
7. Deploy

### Connect Domain to Netlify

1. In Netlify, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter `tradestate.io`
4. Netlify will show DNS instructions
5. Update Squarespace DNS with Netlify's records:
   - A record: `75.2.60.5` (Netlify's IP)
   - CNAME for www: `your-site.netlify.app`

---

## Troubleshooting

### Problem: "Domain not verified" in Vercel

**Solution**: 
- DNS changes take time (up to 48 hours)
- Check DNS propagation: https://www.whatsmydns.net/#A/tradestate.io
- Verify DNS records are correct in Squarespace
- Contact Squarespace support if records aren't saving

### Problem: "OAuth redirect_uri mismatch"

**Solution**:
- Ensure you added `https://tradestate.io/callback` to Tradovate OAuth app
- Include both `tradestate.io` and `www.tradestate.io` versions
- Update `VITE_TRADOVATE_REDIRECT_URI` in Vercel environment variables
- Redeploy after changing environment variables

### Problem: Environment variables not working

**Solution**:
- Verify all 4 environment variables are set in Vercel
- Make sure they're set for "Production" environment
- Redeploy the project after adding variables
- Check Vercel deployment logs for errors

### Problem: "This site can't be reached"

**Solution**:
- DNS hasn't propagated yet - wait longer
- Verify DNS records are correct in Squarespace
- Try accessing the temporary Vercel URL to confirm app works
- Clear browser cache

### Problem: Squarespace won't let me change DNS

**Solution**:
- Some Squarespace plans limit DNS control
- You might need to transfer domain to another registrar (Google Domains, Namecheap, etc.)
- Or use Vercel/Netlify's nameservers instead
- Contact Squarespace support for clarification

---

## DNS Record Quick Reference

### What You Need in Squarespace DNS

**For Root Domain (tradestate.io):**
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21 (Vercel's IP)
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com.
```

**Note**: Always include the trailing dot (.) in CNAME values if required by Squarespace.

---

## Testing DNS Propagation

Check if DNS changes have propagated:

1. **Online tool**: https://www.whatsmydns.net
   - Enter: `tradestate.io`
   - Type: `A`
   - Should show: `76.76.21.21`

2. **Command line**:
```bash
# Windows PowerShell
nslookup tradestate.io

# Should show Vercel's IP address
```

---

## Cost Breakdown

| Service | Cost | What's Included |
|---------|------|-----------------|
| **Vercel** | FREE | Unlimited bandwidth, automatic SSL, CDN |
| **GitHub** | FREE | Unlimited public repositories |
| **Squarespace Domain** | $20-30/year | Domain registration (you already have this) |

**Total ongoing cost**: Just your domain renewal (~$20-30/year)

---

## Post-Deployment Checklist

After successful deployment:

- [ ] https://tradestate.io loads correctly
- [ ] https://www.tradestate.io redirects to https://tradestate.io
- [ ] SSL certificate is active (🔒 padlock in browser)
- [ ] OAuth login flow works end-to-end
- [ ] Dashboard appears after successful login
- [ ] No console errors in browser DevTools
- [ ] Test on mobile devices
- [ ] Update `VITE_API_ENVIRONMENT` to `live` when ready for production

---

## Future Updates

When you want to update your website:

1. Make changes to your code locally
2. Test with `npm run dev`
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel **automatically deploys** the changes!
5. Changes go live in 1-2 minutes

---

## Getting Help

**Vercel Support**: https://vercel.com/support
**Squarespace DNS Help**: https://support.squarespace.com/hc/en-us/articles/205812378-Connecting-a-domain-to-your-site
**DNS Propagation Checker**: https://www.whatsmydns.net

---

## Summary

1. ✅ Push code to GitHub
2. ✅ Deploy to Vercel (with environment variables)
3. ✅ Update Tradovate OAuth redirect URIs
4. ✅ Add domain in Vercel
5. ✅ Update DNS records in Squarespace
6. ✅ Wait for DNS propagation
7. ✅ Test live site at https://tradestate.io

**Estimated Time**: 30-60 minutes + DNS propagation wait (1-48 hours)

**Next step**: Start with Phase 1 (pushing to GitHub) above! 👆

