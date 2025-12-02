<script>
  import { onMount } from 'svelte';
  import { authStore } from '../stores/auth';
  import { shouldRefreshToken, refreshAccessToken } from '../lib/auth/tradovate';
  import Header from '../components/Header.svelte';
  
  let loading = true;
  
  onMount(async () => {
    // Check token expiration
    authStore.checkExpiration();
    
    // Refresh token if needed
    if ($authStore.isAuthenticated && shouldRefreshToken($authStore.expiresAt)) {
      try {
        const newTokens = await refreshAccessToken($authStore.refreshToken);
        authStore.updateToken(newTokens.accessToken, newTokens.expiresAt);
      } catch (error) {
        console.error('Token refresh failed:', error);
        authStore.logout();
        window.location.hash = '/login';
        return;
      }
    }
    
    loading = false;
  });
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if loading}
      <div class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    {:else}
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to TradeState</h1>
        <p class="text-gray-600">Your unified trading dashboard</p>
      </div>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Connected Accounts</p>
              <p class="text-3xl font-bold text-gray-900">1</p>
            </div>
            <div class="p-3 bg-primary-100 rounded-full">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Status</p>
              <p class="text-xl font-semibold text-green-600">Connected</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600 mb-1">Platform</p>
              <p class="text-xl font-semibold text-gray-900">Tradovate</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Connection Info Card -->
      <div class="card mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Connection Details</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="text-gray-600">Brokerage</span>
            <span class="font-medium text-gray-900">Tradovate</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="text-gray-600">Connection Status</span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span class="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Active
            </span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="text-gray-600">Authentication Method</span>
            <span class="font-medium text-gray-900">OAuth 2.0</span>
          </div>
          {#if $authStore.user}
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-600">User ID</span>
              <span class="font-medium text-gray-900">{$authStore.user.id || 'N/A'}</span>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Coming Soon Section -->
      <div class="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
        <div class="text-center py-8">
          <svg class="w-16 h-16 text-primary-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Trading Features Coming Soon</h3>
          <p class="text-gray-600 max-w-2xl mx-auto">
            We're building powerful trading tools and analytics for your connected accounts.
            Stay tuned for real-time market data, position tracking, and advanced analytics.
          </p>
        </div>
      </div>
    {/if}
  </main>
</div>

