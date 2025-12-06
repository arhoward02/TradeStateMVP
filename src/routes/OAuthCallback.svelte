<script>
  import { onMount } from 'svelte';
  import { handleCallback, fetchUserProfile } from '../lib/auth/tradovate';
  import { authStore } from '../stores/auth';
  
  let loading = true;
  let error = null;
  let needsUsername = false;
  let oauthUsername = '';
  let code = '';
  let state = '';
  
  onMount(async () => {
    // Parse URL parameters from hash (for hash-based routing)
    // Extract query string from hash: /#/callback?code=...&state=...
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    code = params.get('code');
    state = params.get('state');
    const errorParam = params.get('error');
    
    console.log('OAuth Callback - Hash:', hash);
    console.log('OAuth Callback - Query String:', queryString);
    console.log('OAuth Callback - Code:', code);
    console.log('OAuth Callback - State:', state);
    console.log('OAuth Callback - Error:', errorParam);
    
    if (errorParam) {
      error = `OAuth error: ${errorParam}`;
      loading = false;
      return;
    }
    
    if (!code || !state) {
      error = `Missing authorization code or state parameter. Hash: ${hash}`;
      loading = false;
      console.error('Missing OAuth parameters!', { hash, queryString, code, state });
      return;
    }
    
    // Check if we have stored OAuth username
    const storedUsername = localStorage.getItem('tradovate_oauth_username');
    
    if (!storedUsername) {
      // Need to ask user for OAuth username
      needsUsername = true;
      loading = false;
      return;
    }
    
    // Proceed with authentication
    await completeAuthentication(storedUsername);
  });
  
  async function completeAuthentication(username) {
    loading = true;
    error = null;
    
    try {
      // Exchange code for tokens
      const tokens = await handleCallback(code, state, username);
      
      // Fetch user profile
      const userProfile = await fetchUserProfile(tokens.accessToken);
      
      // Store authentication data
      authStore.login({
        user: userProfile,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      });
      
      // Redirect to dashboard
      window.location.hash = '/dashboard';
    } catch (err) {
      console.error('OAuth callback error:', err);
      error = err.message || 'Failed to complete authentication';
      loading = false;
    }
  }
  
  function handleUsernameSubmit() {
    if (!oauthUsername.trim()) {
      error = 'Please enter your OAuth username';
      return;
    }
    
    // Store for future use
    localStorage.setItem('tradovate_oauth_username', oauthUsername);
    
    // Complete authentication
    completeAuthentication(oauthUsername);
  }
  
  function redirectToLogin() {
    window.location.hash = '/login';
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
  <div class="max-w-md w-full px-6">
    <div class="card">
      {#if loading}
        <!-- Loading State -->
        <div class="py-8 text-center">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">Connecting to Tradovate</h2>
          <p class="text-gray-600">Please wait while we complete your authentication...</p>
        </div>
      {:else if needsUsername}
        <!-- OAuth Username Input -->
        <div class="py-8">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 class="text-2xl font-semibold text-gray-800 mb-2">One More Step</h2>
            <p class="text-gray-600 mb-4">Please enter your Tradovate OAuth username</p>
          </div>
          
          <div class="mb-6">
            <label for="oauth-username" class="block text-sm font-medium text-gray-700 mb-2 text-left">
              OAuth Username
            </label>
            <input
              id="oauth-username"
              type="text"
              bind:value={oauthUsername}
              placeholder="e.g., Google:111638896328056101555"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              on:keypress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
            />
            <p class="text-xs text-gray-500 mt-2 text-left">
              Format: <code class="bg-gray-100 px-1 py-0.5 rounded">Provider:ID</code>
              <br />
              (e.g., Google:123456789 or Apple:987654321)
            </p>
          </div>
          
          {#if error}
            <div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{error}</p>
            </div>
          {/if}
          
          <button on:click={handleUsernameSubmit} class="btn-primary w-full mb-3">
            Continue
          </button>
          <button on:click={redirectToLogin} class="btn-secondary w-full">
            Back to Login
          </button>
          
          <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <p class="text-sm font-medium text-blue-900 mb-2">Where to find this?</p>
            <ol class="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>Log in to trader.tradovate.com with your OAuth provider</li>
              <li>Open browser console (F12)</li>
              <li>Look for your OAuth-linked username in localStorage or profile API</li>
            </ol>
          </div>
        </div>
      {:else if error}
        <!-- Error State -->
        <div class="py-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">Authentication Failed</h2>
          <p class="text-gray-600 mb-6">{error}</p>
          <button on:click={redirectToLogin} class="btn-primary">
            Back to Login
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

