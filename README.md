# TradeState - Brokerage Connection Platform

A modern frontend web application built with Svelte and Tailwind CSS that enables users to connect their brokerage accounts via OAuth 2.0. Currently supports Tradovate integration with plans to expand to additional brokerages.

## Features

- 🔐 Secure OAuth 2.0 authentication with Tradovate
- 🎨 Modern, responsive UI built with Tailwind CSS
- ⚡ Fast and lightweight Svelte framework
- 🔄 Token management with automatic refresh
- 🛡️ Protected routes and authentication state management
- 📱 Mobile-responsive design
- 🚀 Ready for deployment to tradestate.io

## Tech Stack

- **Framework**: Svelte 4.x
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.x
- **Routing**: svelte-spa-router
- **Authentication**: OAuth 2.0 (Tradovate API)

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Tradovate OAuth credentials (Client ID and Client Secret)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_TRADOVATE_CLIENT_ID=your_client_id_here
VITE_TRADOVATE_CLIENT_SECRET=your_client_secret_here
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
VITE_API_ENVIRONMENT=demo
```

**Note**: 
- Use `demo` environment for testing with Tradovate demo accounts
- Use `live` environment for production trading accounts
- Make sure your redirect URI matches the one configured in your Tradovate OAuth app

### 3. Obtain Tradovate OAuth Credentials

1. Log in to your Tradovate account
2. Navigate to the API/Developer section
3. Create a new OAuth application
4. Set the redirect URI to match your `.env` configuration
5. Copy the Client ID and Client Secret to your `.env` file

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Project Structure

```
frontendmvp/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable Svelte components
│   │   └── Header.svelte
│   ├── lib/
│   │   └── auth/        # Authentication logic
│   │       └── tradovate.js
│   ├── routes/          # Page components
│   │   ├── Login.svelte
│   │   ├── Dashboard.svelte
│   │   └── OAuthCallback.svelte
│   ├── stores/          # Svelte stores for state management
│   │   └── auth.js
│   ├── App.svelte       # Main app component with routing
│   ├── app.css          # Global styles with Tailwind
│   └── main.js          # Application entry point
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── README.md
```

## Key Features Explained

### OAuth 2.0 Flow

1. User clicks "Connect to Tradovate" on the login page
2. Application redirects to Tradovate OAuth authorization page
3. User approves the connection
4. Tradovate redirects back to `/callback` with authorization code
5. Application exchanges code for access and refresh tokens
6. User is redirected to the dashboard

### Authentication State Management

- Authentication state is managed using Svelte stores
- Tokens are stored in localStorage for persistence
- Automatic token refresh before expiration
- Protected routes require authentication

### Route Protection

Routes are protected using svelte-spa-router's `wrap` function with condition checking. Unauthenticated users are automatically redirected to the login page.

## Deployment

### Deploying to tradestate.io

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Update environment variables** for production:
   - Set `VITE_TRADOVATE_REDIRECT_URI` to `https://tradestate.io/callback`
   - Use `live` environment for production

3. **Deploy the `dist` folder** to your hosting provider:
   - **Vercel**: Connect your Git repository and Vercel will auto-deploy
   - **Netlify**: Drag and drop the `dist` folder or connect via Git
   - **AWS S3 + CloudFront**: Upload `dist` contents to S3 bucket
   - **Other**: Upload `dist` contents to your web server

4. **Configure DNS**:
   - Point tradestate.io to your hosting provider
   - Ensure HTTPS is enabled (most providers include free SSL)

5. **Update Tradovate OAuth settings**:
   - Add production redirect URI: `https://tradestate.io/callback`
   - Ensure your production domain is authorized

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_TRADOVATE_CLIENT_ID` | OAuth Client ID from Tradovate | `your_client_id` |
| `VITE_TRADOVATE_CLIENT_SECRET` | OAuth Client Secret from Tradovate | `your_client_secret` |
| `VITE_TRADOVATE_REDIRECT_URI` | Redirect URI after OAuth | `http://localhost:3000/callback` |
| `VITE_API_ENVIRONMENT` | API environment (demo/live) | `demo` |

## Future Enhancements

- [ ] Integration with Supabase backend
- [ ] Support for additional brokerages (Interactive Brokers, TD Ameritrade, etc.)
- [ ] Real-time market data display
- [ ] Portfolio tracking and analytics
- [ ] Trade execution capabilities
- [ ] Multi-account management
- [ ] Advanced charting and technical analysis

## Security Considerations

- OAuth tokens are stored in localStorage (consider using httpOnly cookies for production)
- CSRF protection using state parameter in OAuth flow
- Automatic token refresh to maintain secure sessions
- Environment variables keep sensitive credentials out of source code

## Troubleshooting

### OAuth Redirect Issues
- Ensure redirect URI in `.env` matches exactly with Tradovate OAuth app settings
- Check that the redirect URI includes the correct protocol (http/https)

### Token Expiration
- Tokens automatically refresh 5 minutes before expiration
- If refresh fails, user will be logged out and redirected to login

### CORS Issues
- Tradovate API should allow requests from your domain
- Check Tradovate OAuth app settings for allowed origins

## Support

For issues or questions:
- Check Tradovate API documentation: https://api.tradovate.com
- Review OAuth 2.0 specification: https://oauth.net/2/

## License

Private - All rights reserved

---

Built with ❤️ for TradeState

