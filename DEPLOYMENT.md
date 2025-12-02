# Deployment Guide for tradestate.io

This guide covers deploying your TradeState frontend application to your domain `tradestate.io`.

## Pre-Deployment Checklist

- [ ] Tradovate OAuth app configured with production redirect URI
- [ ] Production environment variables ready
- [ ] Domain (tradestate.io) DNS configured
- [ ] SSL certificate ready (most hosts provide free SSL)
- [ ] Application tested locally

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel offers excellent performance for Svelte/Vite applications with automatic deployments.

#### Steps:

1. **Push your code to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Vite configuration

3. **Configure Environment Variables** in Vercel:
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_TRADOVATE_CLIENT_ID=your_client_id
     VITE_TRADOVATE_CLIENT_SECRET=your_client_secret
     VITE_TRADOVATE_REDIRECT_URI=https://tradestate.io/callback
     VITE_API_ENVIRONMENT=live
     ```

4. **Configure Custom Domain**:
   - Go to Project Settings → Domains
   - Add `tradestate.io` and `www.tradestate.io`
   - Update your DNS records as instructed by Vercel

5. **Deploy**:
   - Vercel automatically deploys on every push to main branch
   - Or manually trigger deployment from Vercel dashboard

### Option 2: Netlify

Similar to Vercel, Netlify is great for static sites and SPAs.

#### Steps:

1. **Build the project**:
```bash
npm run build
```

2. **Deploy via Netlify CLI**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

3. **Or use Netlify's Git integration**:
   - Connect your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables in Site Settings

4. **Configure custom domain** in Netlify dashboard

### Option 3: AWS S3 + CloudFront

For full control and scalability.

#### Steps:

1. **Build the application**:
```bash
npm run build
```

2. **Create S3 bucket**:
   - Name: `tradestate.io`
   - Enable static website hosting
   - Set index document to `index.html`
   - Set error document to `index.html` (for SPA routing)

3. **Upload files**:
```bash
aws s3 sync dist/ s3://tradestate.io --delete
```

4. **Create CloudFront distribution**:
   - Origin: Your S3 bucket
   - Enable HTTPS
   - Custom SSL certificate for tradestate.io
   - Default root object: `index.html`
   - Error pages: Route 404/403 to `/index.html` (for SPA routing)

5. **Configure Route 53**:
   - Create A record for `tradestate.io` → CloudFront distribution
   - Create A record for `www.tradestate.io` → CloudFront distribution

### Option 4: Traditional Web Hosting (cPanel, etc.)

If you have traditional shared hosting:

1. **Build the application**:
```bash
npm run build
```

2. **Upload `dist` folder contents** to your web server:
   - Via FTP/SFTP
   - Or through hosting control panel file manager
   - Upload to public_html or www directory

3. **Configure .htaccess** for SPA routing:

Create a `.htaccess` file in the root directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. **Ensure HTTPS is enabled** in your hosting control panel

## Environment Variables for Production

Update your production environment variables:

```env
VITE_TRADOVATE_CLIENT_ID=your_production_client_id
VITE_TRADOVATE_CLIENT_SECRET=your_production_client_secret
VITE_TRADOVATE_REDIRECT_URI=https://tradestate.io/callback
VITE_API_ENVIRONMENT=live
```

**Important**: 
- Use `live` environment for production trading accounts
- Use `demo` if you want to keep testing with demo accounts in production

## Update Tradovate OAuth Settings

Before going live, update your Tradovate OAuth application:

1. Log in to Tradovate
2. Go to API/Developer settings
3. Edit your OAuth application
4. Add production redirect URI: `https://tradestate.io/callback`
5. Add allowed origin: `https://tradestate.io`
6. Save changes

## DNS Configuration

Point your domain to your hosting provider:

### For Vercel/Netlify:
Follow their custom domain setup instructions (they provide specific DNS records)

### For CloudFront:
- Type: A (or ALIAS)
- Name: @ (or tradestate.io)
- Value: CloudFront distribution URL

### For traditional hosting:
- Type: A
- Name: @
- Value: Your server IP address

## SSL Certificate

All modern browsers require HTTPS for secure authentication:

- **Vercel/Netlify**: Automatic SSL via Let's Encrypt
- **CloudFront**: Use AWS Certificate Manager (free)
- **Traditional hosting**: Enable Let's Encrypt in cPanel or use provider's SSL

## Post-Deployment Testing

1. **Test OAuth flow**:
   - Visit https://tradestate.io
   - Click "Connect to Tradovate"
   - Complete OAuth flow
   - Verify redirect back to dashboard

2. **Test on multiple devices**:
   - Desktop browsers (Chrome, Firefox, Safari, Edge)
   - Mobile browsers (iOS Safari, Android Chrome)
   - Different network conditions

3. **Check browser console** for errors

4. **Verify HTTPS** is working correctly

## Continuous Deployment (Optional)

Set up automatic deployments on code changes:

### GitHub Actions Example:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      env:
        VITE_TRADOVATE_CLIENT_ID: ${{ secrets.VITE_TRADOVATE_CLIENT_ID }}
        VITE_TRADOVATE_CLIENT_SECRET: ${{ secrets.VITE_TRADOVATE_CLIENT_SECRET }}
        VITE_TRADOVATE_REDIRECT_URI: https://tradestate.io/callback
        VITE_API_ENVIRONMENT: live
      run: npm run build
      
    - name: Deploy to Server
      # Add your deployment steps here
      run: echo "Deploy to your hosting provider"
```

Add secrets in GitHub repository settings.

## Monitoring

After deployment, consider setting up:

1. **Error tracking**: Sentry, Rollbar, or LogRocket
2. **Analytics**: Google Analytics, Plausible, or Fathom
3. **Uptime monitoring**: UptimeRobot or Pingdom
4. **Performance monitoring**: Lighthouse CI

## Rollback Plan

If issues occur:

### Vercel/Netlify:
- Instantly rollback to previous deployment in dashboard

### S3/CloudFront:
- Keep previous build in separate folder
- Upload previous version if needed
- Invalidate CloudFront cache

### Traditional hosting:
- Keep backup of previous `dist` folder
- Replace files via FTP if needed

## Security Best Practices

- [ ] Never commit `.env` files to Git
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up Content Security Policy headers
- [ ] Enable CORS only for necessary domains
- [ ] Regularly update dependencies
- [ ] Monitor OAuth token usage

## Performance Optimization

- [ ] Enable Gzip/Brotli compression
- [ ] Set up CDN (CloudFront, Cloudflare)
- [ ] Configure browser caching headers
- [ ] Optimize images and assets
- [ ] Monitor bundle size

## Support

If you encounter deployment issues:

1. Check hosting provider documentation
2. Verify all environment variables are set correctly
3. Test OAuth redirect URIs match exactly
4. Check browser console for errors
5. Review Tradovate API logs

---

Good luck with your deployment! 🚀

