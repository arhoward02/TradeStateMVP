// Import Supabase client
import { getEdgeFunctionUrl } from '../supabase.js';

// Tradovate OAuth Configuration (frontend only needs environment)
const TRADOVATE_CONFIG = {
  environment: import.meta.env.VITE_TRADOVATE_ENVIRONMENT || 'demo',
};

// Backend API endpoints (Supabase Edge Functions)
const API_ENDPOINTS = {
  oauthInitiate: getEdgeFunctionUrl('oauth-initiate'),
  oauthCallback: getEdgeFunctionUrl('oauth-callback'),
  tradovateProxy: getEdgeFunctionUrl('tradovate-proxy'),
};

/**
 * Generate a random state string for CSRF protection
 */
function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Initiate Tradovate OAuth login flow (via backend)
 */
export async function initiateLogin() {
  try {
    // Call backend to get OAuth URL and state
    const response = await fetch(API_ENDPOINTS.oauthInitiate, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initiate OAuth');
    }

    const { authUrl, state } = await response.json();
    
    // Store state in sessionStorage for verification on callback
    sessionStorage.setItem('oauth_state', state);
    
    // Redirect to Tradovate OAuth page
    window.location.href = authUrl;
  } catch (error) {
    console.error('OAuth initiation error:', error);
    throw error;
  }
}

/**
 * Handle OAuth callback (via backend)
 * Note: oauth_username not needed for standard OAuth flow
 * The authorization code contains all necessary user information
 */
export async function handleCallback(code, state) {
  // Verify state to prevent CSRF attacks
  const storedState = sessionStorage.getItem('oauth_state');
  
  console.log('State verification:', { 
    storedState, 
    receivedState: state, 
    match: storedState === state 
  });
  
  if (!storedState || storedState !== state) {
    console.error('State mismatch!', { storedState, receivedState: state });
    throw new Error('Invalid state parameter - possible CSRF attack');
  }
  
  // Clear stored state
  sessionStorage.removeItem('oauth_state');
  
  try {
    // Call backend to exchange code for tokens
    // Backend handles client_secret securely
    const response = await fetch(API_ENDPOINTS.oauthCallback, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
      }),
    });
    
    const responseText = await response.text();
    console.log('Backend callback response:', { status: response.status, body: responseText });
    
    if (!response.ok) {
      const errorData = JSON.parse(responseText);
      throw new Error(errorData.error || 'OAuth callback failed');
    }
    
    const data = JSON.parse(responseText);
    
    // Return token data
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: new Date(data.expiresAt).getTime(),
      tokenType: data.tokenType || 'Bearer',
      userId: data.userId,
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
 * Fetch user profile from Tradovate API (via backend proxy)
 */
export async function fetchUserProfile(accessToken) {
  try {
    if (!accessToken) {
      throw new Error('Access token is undefined or null');
    }
    
    // Use /auth/me endpoint as per Tradovate OAuth documentation
    const endpoint = '/auth/me';
    const url = `${API_ENDPOINTS.tradovateProxy}?endpoint=${encodeURIComponent(endpoint)}`;
    
    console.log('Fetching user profile via proxy:', { endpoint, accessToken: accessToken.substring(0, 10) + '...' });
    
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

