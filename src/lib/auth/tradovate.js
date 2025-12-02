// Tradovate OAuth Configuration
const TRADOVATE_CONFIG = {
  clientId: import.meta.env.VITE_TRADOVATE_CLIENT_ID,
  clientSecret: import.meta.env.VITE_TRADOVATE_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_TRADOVATE_REDIRECT_URI || 'http://localhost:3000/callback',
  environment: import.meta.env.VITE_API_ENVIRONMENT || 'demo',
};

// Tradovate OAuth endpoints
const getBaseUrl = () => {
  return TRADOVATE_CONFIG.environment === 'demo'
    ? 'https://demo.tradovateapi.com/v1'
    : 'https://live.tradovateapi.com/v1';
};

const OAUTH_ENDPOINTS = {
  authorize: 'https://trader.tradovateapi.com/auth/oauthauthorize',
  token: 'https://trader.tradovateapi.com/auth/oauthtoken',
};

/**
 * Generate a random state string for CSRF protection
 */
function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Initiate Tradovate OAuth login flow
 */
export function initiateLogin() {
  const state = generateState();
  
  // Store state in sessionStorage for verification on callback
  sessionStorage.setItem('oauth_state', state);
  
  // Build OAuth authorization URL
  const params = new URLSearchParams({
    client_id: TRADOVATE_CONFIG.clientId,
    redirect_uri: TRADOVATE_CONFIG.redirectUri,
    response_type: 'code',
    state: state,
    scope: 'trading', // Adjust scopes as needed
  });
  
  const authUrl = `${OAUTH_ENDPOINTS.authorize}?${params.toString()}`;
  
  // Redirect to Tradovate OAuth page
  window.location.href = authUrl;
}

/**
 * Handle OAuth callback and exchange authorization code for tokens
 */
export async function handleCallback(code, state) {
  // Verify state to prevent CSRF attacks
  const storedState = sessionStorage.getItem('oauth_state');
  
  if (!storedState || storedState !== state) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }
  
  // Clear stored state
  sessionStorage.removeItem('oauth_state');
  
  // Exchange authorization code for access token
  try {
    const response = await fetch(OAUTH_ENDPOINTS.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: TRADOVATE_CONFIG.clientId,
        client_secret: TRADOVATE_CONFIG.clientSecret,
        redirect_uri: TRADOVATE_CONFIG.redirectUri,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Token exchange failed: ${errorData}`);
    }
    
    const data = await response.json();
    
    // Calculate token expiration time
    const expiresAt = Date.now() + (data.expires_in * 1000);
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: expiresAt,
      tokenType: data.token_type,
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(OAUTH_ENDPOINTS.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: TRADOVATE_CONFIG.clientId,
        client_secret: TRADOVATE_CONFIG.clientSecret,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    
    const data = await response.json();
    const expiresAt = Date.now() + (data.expires_in * 1000);
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt: expiresAt,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

/**
 * Fetch user profile from Tradovate API
 */
export async function fetchUserProfile(accessToken) {
  try {
    const response = await fetch(`${getBaseUrl()}/user/syncrequest`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch user profile error:', error);
    throw error;
  }
}

/**
 * Check if token needs refresh (5 minutes before expiration)
 */
export function shouldRefreshToken(expiresAt) {
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() >= (expiresAt - fiveMinutes);
}

