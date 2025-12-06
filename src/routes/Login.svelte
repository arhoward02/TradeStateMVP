<script>
  import { initiateLogin } from '../lib/auth/tradovate';
  import { authStore } from '../stores/auth';
  import { onMount } from 'svelte';
  
  // Check if already authenticated
  onMount(() => {
    if ($authStore.isAuthenticated) {
      window.location.hash = '/dashboard';
    }
  });
  
  let loading = false;
  let error = null;
  
  async function handleLogin() {
    loading = true;
    error = null;
    try {
      // Clear any old OAuth state before starting new flow
      sessionStorage.removeItem('oauth_state');
      await initiateLogin();
    } catch (err) {
      console.error('Login error:', err);
      error = err.message || 'Failed to initiate login';
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
  <div class="max-w-md w-full px-6">
    <!-- Logo/Brand -->
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">TradeState</h1>
      <p class="text-gray-600">Connect your brokerage accounts</p>
    </div>
    
    <!-- Login Card -->
    <div class="card">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Welcome Back</h2>
        <p class="text-gray-600">Sign in to access your trading dashboard</p>
      </div>
      
      <!-- Login Button -->
      <div class="space-y-4">
        {#if error}
          <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{error}</p>
          </div>
        {/if}
        
        <button
          on:click={handleLogin}
          disabled={loading}
          class="w-full btn-primary flex items-center justify-center space-x-3"
        >
          {#if loading}
            <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Connecting...</span>
          {:else}
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Connect to Tradovate</span>
          {/if}
        </button>
        
        <div class="text-center">
          <p class="text-sm text-gray-500">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
      
      <!-- Info Section -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700 mb-3">Why connect your brokerage?</h3>
        <ul class="space-y-2 text-sm text-gray-600">
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Secure OAuth 2.0 authentication</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Real-time trading data</span>
          </li>
          <li class="flex items-start">
            <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Unified trading dashboard</span>
          </li>
        </ul>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="text-center mt-6">
      <p class="text-sm text-gray-500">
        Need help? <button class="text-primary-600 hover:text-primary-700 font-medium underline">Contact Support</button>
      </p>
    </div>
  </div>
</div>

<style>
  /* Additional custom styles if needed */
</style>

