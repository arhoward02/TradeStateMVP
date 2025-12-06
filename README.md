# TradeState - Secure Trading Dashboard 🚀

A modern, **production-ready** trading dashboard with secure Tradovate OAuth integration. Built with Svelte frontend and Supabase Edge Functions backend.

## 🎯 What Makes This Different?

Unlike typical OAuth implementations that expose secrets in the browser, **TradeState uses a secure backend architecture** to protect your credentials:

### ❌ Insecure (Most Implementations)
```javascript
// Client-side - SECRET EXPOSED!
fetch('https://tradovate.com/token', {
  body: { client_secret: 'secret123' } // 🚨 Visible in browser!
});
```

### ✅ Secure (TradeState)
```javascript
// Client-side - NO SECRETS
fetch('https://your-backend/oauth-callback', {
  body: { code: 'auth_code' } // ✅ Backend handles secret!
});
```

## ✨ Features

### 🔐 Security First
- ✅ **Server-side OAuth** - Client secrets never exposed to browser
- ✅ **CSRF Protection** - Built-in state validation
- ✅ **Encrypted Token Storage** - PostgreSQL database with RLS
- ✅ **API Proxy** - All requests authenticated through backend

### 🎨 Modern UI
- Clean, responsive design
- TradingView-inspired dark theme
- Smooth animations and transitions
- Mobile-friendly interface

### 🚀 Production Ready
- Supabase Edge Functions (serverless)
- PostgreSQL database
- CDN-distributed globally
- Free tier supports 500K requests/month

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Svelte 4, Tailwind CSS, Vite |
| **Backend** | Supabase Edge Functions (Deno) |
| **Database** | PostgreSQL (Supabase) |
| **API** | Tradovate REST API |
| **Auth** | OAuth 2.0 (server-side) |

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │  Svelte + Tailwind
│   (Browser)     │  No secrets exposed
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────────────────────┐
│  Supabase Edge Functions        │  OAuth flow handler
│  (Backend - TypeScript/Deno)    │  Token exchange
│                                 │  API proxy
│  • oauth-initiate               │  Secure by default
│  • oauth-callback               │
│  • tradovate-proxy              │
└────────┬─────────────┬──────────┘
         │             │
         ▼             ▼
┌──────────────┐ ┌─────────────┐
│  Tradovate   │ │ PostgreSQL  │  Token storage
│  REST API    │ │ (Supabase)  │  Session mgmt
└──────────────┘ └─────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Tradovate account (demo or live)
- Supabase account (free tier works!)

### 1. Clone & Install
```bash
git clone https://github.com/arhoward02/TradeStateMVP.git
cd TradeStateMVP
npm install
```

### 2. Set Up Supabase Backend

**📖 Follow the complete guide:** [QUICKSTART_BACKEND.md](QUICKSTART_BACKEND.md)

**Quick version:**
```bash
# Install Supabase CLI
scoop install supabase  # Windows
brew install supabase   # Mac

# Login and setup
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set secrets
supabase secrets set TRADOVATE_CLIENT_ID=your_id
supabase secrets set TRADOVATE_CLIENT_SECRET=your_secret
# ... (more in guide)

# Deploy functions
npm run supabase:deploy:win  # Windows
npm run supabase:deploy      # Mac/Linux
```

### 3. Configure Frontend

Create `.env` file:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_TRADOVATE_ENVIRONMENT=demo
VITE_TRADOVATE_REDIRECT_URI=http://localhost:3000/callback
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📚 Complete Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART_BACKEND.md](QUICKSTART_BACKEND.md) | 🚀 Get started in 15 minutes |
| [SUPABASE_SETUP.md](SUPABASE_SETUP.md) | 🔧 Complete Supabase configuration |
| [BACKEND_README.md](BACKEND_README.md) | 🏗️ Architecture and API docs |
| [BACKEND_IMPLEMENTATION.md](BACKEND_IMPLEMENTATION.md) | 📝 What we built and why |
| [ENV_VARIABLES.md](ENV_VARIABLES.md) | ⚙️ Configuration reference |
| [DEPLOYMENT.md](DEPLOYMENT.md) | 🌐 Production deployment |

## 🔐 Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| Client Secret Protection | ✅ | Stored server-side only |
| CSRF Protection | ✅ | State parameter validation |
| Token Encryption | ✅ | Encrypted database storage |
| Row Level Security | ✅ | Multi-tenant isolation |
| API Proxy | ✅ | Request/response logging |
| Environment Isolation | ✅ | Separate dev/prod configs |

## 🔄 OAuth Flow

1. User clicks **"Connect to Tradovate"**
2. Frontend requests OAuth URL from backend
3. User redirected to Tradovate login
4. User authenticates and approves
5. Tradovate redirects back with auth code
6. Frontend sends code to backend
7. **Backend exchanges code + secret for tokens** 🔐
8. Backend stores tokens in database
9. Frontend receives access token
10. User redirected to dashboard ✅

## 📁 Project Structure

```
TradeStateMVP/
├── src/                    # Frontend
│   ├── components/         # UI components
│   ├── routes/             # Page components
│   ├── lib/
│   │   ├── auth/           # OAuth logic
│   │   └── supabase.js     # Supabase client
│   └── stores/             # State management
│
├── supabase/               # Backend
│   ├── functions/          # Edge Functions
│   │   ├── oauth-initiate/
│   │   ├── oauth-callback/
│   │   └── tradovate-proxy/
│   ├── migrations/         # Database schema
│   └── deploy.ps1/sh       # Deployment scripts
│
├── docs/                   # Documentation
└── package.json
```

## 📝 NPM Scripts

```bash
# Development
npm run dev                    # Start dev server

# Build
npm run build                  # Build for production
npm run preview                # Preview production build

# Supabase
npm run supabase:login         # Login to Supabase
npm run supabase:link          # Link to project
npm run supabase:deploy:win    # Deploy functions (Windows)
npm run supabase:deploy        # Deploy functions (Mac/Linux)
npm run supabase:logs          # View function logs
```

## 💰 Cost Breakdown

### Free Tier (Supabase)
- ✅ 500K Edge Function calls/month (~16K/day)
- ✅ 500MB PostgreSQL database
- ✅ 2GB bandwidth/month
- ✅ **Perfect for development & 100+ users!**

### Production Scale
- 10K users: ~$25/month (Supabase Pro)
- 100K users: Custom pricing
- Frontend hosting: $0-20/month (Vercel/Netlify)

**Total for MVP: $0/month** 🎉

## 🚀 Deployment

### Frontend
```bash
npm run build
# Deploy dist/ to Vercel, Netlify, etc.
```

### Backend
```bash
npm run supabase:deploy
# Edge Functions auto-deploy!
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for production setup.

## 🐛 Troubleshooting

### "Missing environment variables"
- Check `.env` file exists with all required variables
- Restart dev server after changes

### "OAuth callback failed"
```bash
# Verify secrets are set
supabase secrets list

# Check logs
npm run supabase:logs
```

### "CORS error"
- Verify `VITE_SUPABASE_URL` in `.env`
- Ensure Supabase anon key is correct

**More:** [SUPABASE_SETUP.md#troubleshooting](SUPABASE_SETUP.md#troubleshooting)

## 🧪 Testing

### Current Status
- ✅ Manual testing workflow
- ⏳ Unit tests (TODO)
- ⏳ Integration tests (TODO)
- ⏳ E2E tests (TODO)

```bash
# Manual testing
npm run dev
# Test OAuth flow in browser
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- [Tradovate](https://tradovate.com) - Trading platform API
- [Supabase](https://supabase.com) - Backend infrastructure
- [Svelte](https://svelte.dev) - Frontend framework
- [TailwindCSS](https://tailwindcss.com) - Styling framework

## 📞 Support & Resources

- 📖 [Full Documentation](QUICKSTART_BACKEND.md)
- 🐛 [Report Issues](https://github.com/arhoward02/TradeStateMVP/issues)
- 💬 [Discussions](https://github.com/arhoward02/TradeStateMVP/discussions)
- 📧 Email: support@tradestate.io

---

## ⭐ Star History

If this project helped you, please give it a star! ⭐

---

**Status:** ✅ Ready for deployment  
**Version:** 2.0.0 (Supabase Backend)  
**Last Updated:** December 5, 2024

Built with ❤️ by the TradeState team
