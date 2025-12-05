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

// Tradovate OAuth endpoints (correct URLs from their example repo)
const OAUTH_ENDPOINTS = {
  authorize: 'https://trader.tradovate.com/oauth',
  // Tradovate OAuth uses the authorization code directly as the access token
  // No separate token exchange endpoint needed
  token: () => {
    return TRADOVATE_CONFIG.environment === 'demo'
      ? 'https://demo.tradovateapi.com/v1/auth/oauthtokenrequest'
      : 'https://live.tradovateapi.com/v1/auth/oauthtokenrequest';
  },
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
 * Handle OAuth callback - Tradovate's custom OAuth token request
 */
export async function handleCallback(code, state) {
  // Verify state to prevent CSRF attacks
  const storedState = sessionStorage.getItem('oauth_state');
  
  if (!storedState || storedState !== state) {
    throw new Error('Invalid state parameter - possible CSRF attack');
  }
  
  // Clear stored state
  sessionStorage.removeItem('oauth_state');
  
  try {
    // Tradovate's custom OAuth access token request
    // For OAuth-linked accounts, the username is in format "Provider:ID"
    // We need to get this from the user or store it after first auth
    const oauthUsername = "Google:111638896328056101555"; // TODO: Get this dynamically
    
    const tokenUrl = `${getBaseUrl()}/auth/accesstokenrequest`;
    const requestBody = {
      name: oauthUsername, // OAuth-linked username
      password: code, // Authorization code as password
      appId: "TradeState",
      appVersion: "1.0.0",
      deviceId: generateDeviceId(),
      cid: TRADOVATE_CONFIG.clientId,
      sec: TRADOVATE_CONFIG.clientSecret,
    };
    
    console.log('Tradovate token request:', { url: tokenUrl, body: requestBody });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const responseText = await response.text();
    console.log('Token response status:', response.status);
    console.log('Token response:', responseText);
    
    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} - ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
    
    // Calculate token expiration time
    const expiresAt = Date.now() + (data.expirationTime || 8 * 60 * 60 * 1000);
    
    return {
      accessToken: data.accessToken || data.token,
      refreshToken: data.refreshToken,
      expiresAt: expiresAt,
      tokenType: 'Bearer',
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
}

/**
 * Generate a consistent device ID for this browser
 */
function generateDeviceId() {
  let deviceId = localStorage.getItem('tradovate_device_id');
  if (!deviceId) {
    deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('tradovate_device_id', deviceId);
  }
  return deviceId;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(OAUTH_ENDPOINTS.token(), {
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
    const url = `${getBaseUrl()}/user/syncrequest`;
    console.log('Fetching user profile:', { url, accessToken });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('User profile response status:', response.status);
    const responseText = await response.text();
    console.log('User profile response:', responseText);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status} - ${responseText}`);
    }
    
    const data = JSON.parse(responseText);
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

