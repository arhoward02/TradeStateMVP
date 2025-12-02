# Project Structure Overview

## Complete File Structure

```
FrontendMVP/
│
├── 📁 public/                      # Static assets
│   └── vite.svg                    # Default favicon
│
├── 📁 src/                         # Source code
│   ├── 📁 components/              # Reusable Svelte components
│   │   └── Header.svelte           # Navigation header with logout
│   │
│   ├── 📁 lib/                     # Utility libraries
│   │   └── 📁 auth/
│   │       └── tradovate.js        # Tradovate OAuth implementation
│   │
│   ├── 📁 routes/                  # Page components
│   │   ├── Login.svelte            # Login page with OAuth button
│   │   ├── Dashboard.svelte        # Protected dashboard page
│   │   └── OAuthCallback.svelte    # OAuth redirect handler
│   │
│   ├── 📁 stores/                  # Svelte stores (state management)
│   │   └── auth.js                 # Authentication state store
│   │
│   ├── App.svelte                  # Main app component with routing
│   ├── main.js                     # Application entry point
│   └── app.css                     # Global styles with Tailwind
│
├── 📁 node_modules/                # Dependencies (auto-generated)
│
├── 📁 dist/                        # Production build output (auto-generated)
│
├── 📄 index.html                   # HTML template
├── 📄 package.json                 # Dependencies and scripts
├── 📄 package-lock.json            # Dependency lock file
│
├── 📄 vite.config.js               # Vite configuration
├── 📄 svelte.config.js             # Svelte configuration
├── 📄 tailwind.config.js           # Tailwind CSS configuration
├── 📄 postcss.config.js            # PostCSS configuration
│
├── 📄 .gitignore                   # Git ignore rules
│
├── 📄 README.md                    # Main documentation
├── 📄 QUICKSTART.md                # Quick start guide
├── 📄 DEPLOYMENT.md                # Deployment instructions
└── 📄 PROJECT_STRUCTURE.md         # This file
```

## Key Files Explained

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Project metadata, dependencies, and npm scripts |
| `vite.config.js` | Vite bundler configuration (dev server, build settings) |
| `svelte.config.js` | Svelte compiler configuration |
| `tailwind.config.js` | Tailwind CSS customization (colors, themes) |
| `postcss.config.js` | PostCSS configuration for CSS processing |
| `.gitignore` | Files/folders to exclude from Git |

### Source Files

#### Core Application (`src/`)

**`main.js`**
- Application entry point
- Imports global styles
- Mounts the Svelte app to the DOM

**`App.svelte`**
- Main component with router configuration
- Defines all application routes
- Handles route protection logic

**`app.css`**
- Global CSS with Tailwind directives
- Custom utility classes
- Base styling for the application

#### Routes (`src/routes/`)

**`Login.svelte`**
- Landing/login page
- "Connect to Tradovate" button
- Initiates OAuth flow
- Displays feature benefits

**`Dashboard.svelte`**
- Protected route (requires authentication)
- Shows connection status
- Displays account statistics
- Handles token refresh
- Placeholder for future features

**`OAuthCallback.svelte`**
- Handles OAuth redirect from Tradovate
- Exchanges authorization code for tokens
- Fetches user profile
- Redirects to dashboard on success
- Shows error messages on failure

#### Components (`src/components/`)

**`Header.svelte`**
- Navigation bar
- Logo and branding
- User status display
- Logout functionality
- Responsive design

#### Authentication (`src/lib/auth/`)

**`tradovate.js`**
- OAuth 2.0 implementation
- Functions:
  - `initiateLogin()` - Start OAuth flow
  - `handleCallback()` - Exchange code for tokens
  - `refreshAccessToken()` - Refresh expired tokens
  - `fetchUserProfile()` - Get user data from API
  - `shouldRefreshToken()` - Check if refresh needed

#### State Management (`src/stores/`)

**`auth.js`**
- Svelte writable store
- Manages authentication state
- Persists to localStorage
- Functions:
  - `login()` - Save auth data
  - `logout()` - Clear auth data
  - `updateToken()` - Update tokens
  - `checkExpiration()` - Verify token validity

## Application Flow

### 1. Initial Load
```
index.html → main.js → App.svelte → Router → Login.svelte
```

### 2. OAuth Login Flow
```
Login.svelte 
  → initiateLogin() 
  → Tradovate OAuth Page
  → User Approves
  → OAuthCallback.svelte
  → handleCallback()
  → fetchUserProfile()
  → authStore.login()
  → Dashboard.svelte
```

### 3. Protected Route Access
```
Router checks authStore
  → If authenticated: Show Dashboard
  → If not authenticated: Redirect to Login
```

### 4. Token Refresh
```
Dashboard mounts
  → Check token expiration
  → If expiring soon: refreshAccessToken()
  → Update authStore
  → Continue session
```

### 5. Logout
```
Header.svelte
  → User clicks Logout
  → authStore.logout()
  → Clear localStorage
  → Redirect to Login
```

## Data Flow

```
Component
    ↓
Svelte Store (authStore)
    ↓
localStorage (persistence)
    ↓
OAuth Functions (tradovate.js)
    ↓
Tradovate API
```

## Styling Architecture

### Tailwind CSS Layers

1. **Base Layer**: Global element styles
2. **Components Layer**: Reusable component classes (btn-primary, card)
3. **Utilities Layer**: Tailwind utility classes

### Custom Classes

- `.btn-primary` - Primary action button (blue)
- `.btn-secondary` - Secondary action button (gray)
- `.card` - Content card with shadow and padding

### Color Palette

- **Primary**: Blue shades (#0ea5e9 family)
- **Success**: Green shades
- **Error**: Red shades
- **Neutral**: Gray shades

## Environment Variables

Required in `.env` file:

```env
VITE_TRADOVATE_CLIENT_ID          # OAuth Client ID
VITE_TRADOVATE_CLIENT_SECRET      # OAuth Client Secret
VITE_TRADOVATE_REDIRECT_URI       # OAuth Callback URL
VITE_API_ENVIRONMENT              # demo or live
```

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production (output: dist/) |
| `npm run preview` | Preview production build locally |

## Technology Versions

- **Svelte**: 4.2.8
- **Vite**: 5.0.8
- **Tailwind CSS**: 3.4.0
- **svelte-spa-router**: 4.0.1

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Security Features

1. **OAuth 2.0**: Industry-standard authentication
2. **State Parameter**: CSRF protection
3. **Token Storage**: Secure localStorage implementation
4. **Token Refresh**: Automatic before expiration
5. **Route Protection**: Authentication required for sensitive pages

## Future Expansion Points

1. **Additional Brokerages**: 
   - Create similar OAuth files (e.g., `interactivebrokers.js`)
   - Add new login options in `Login.svelte`

2. **Supabase Integration**:
   - Add Supabase client in `src/lib/supabase.js`
   - Store user sessions and preferences

3. **Real-time Data**:
   - WebSocket connections in `src/lib/websocket.js`
   - Real-time price updates

4. **Trading Features**:
   - Order placement components
   - Position tracking
   - Portfolio analytics

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Make changes**: Edit `.svelte` files
3. **Hot reload**: Changes appear instantly
4. **Test locally**: Use demo OAuth credentials
5. **Build**: `npm run build` when ready
6. **Deploy**: Upload `dist/` to hosting

## Getting Help

- **Main docs**: [README.md](README.md)
- **Quick start**: [QUICKSTART.md](QUICKSTART.md)
- **Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Svelte docs**: https://svelte.dev
- **Tradovate API**: https://api.tradovate.com

---

*Last updated: December 2, 2025*

