<script>
  import { onMount } from 'svelte';
  import { handleCallback, fetchUserProfile } from '../lib/auth/tradovate';
  import { authStore } from '../stores/auth';
  
  let loading = true;
  let error = null;
  
  onMount(async () => {
    // Parse URL parameters from hash (for hash-based routing)
    // Extract query string from hash: /#/callback?code=...&state=...
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    const code = params.get('code');
    const state = params.get('state');
    const errorParam = params.get('error');
    
    if (errorParam) {
      error = `OAuth error: ${errorParam}`;
      loading = false;
      return;
    }
    
    if (!code || !state) {
      error = 'Missing authorization code or state parameter';
      loading = false;
      return;
    }
    
    try {
      // Exchange code for tokens
      const tokens = await handleCallback(code, state);
      
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
  });
  
  function redirectToLogin() {
    window.location.hash = '/login';
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
  <div class="max-w-md w-full px-6">
    <div class="card text-center">
      {#if loading}
        <!-- Loading State -->
        <div class="py-8">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mb-4"></div>
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">Connecting to Tradovate</h2>
          <p class="text-gray-600">Please wait while we complete your authentication...</p>
        </div>
      {:else if error}
        <!-- Error State -->
        <div class="py-8">
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

