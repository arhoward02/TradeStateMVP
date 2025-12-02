<script>
  import { authStore } from '../stores/auth';
  
  function handleLogout() {
    authStore.logout();
    window.location.hash = '/login';
  }
</script>

<header class="bg-white shadow-sm">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo/Brand -->
      <div class="flex items-center">
        <a href="#/dashboard" class="flex items-center space-x-2">
          <svg class="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-xl font-bold text-gray-900">TradeState</span>
        </a>
      </div>
      
      <!-- Navigation Links -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="#/dashboard" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">
          Dashboard
        </a>
        <span class="text-gray-400 font-medium cursor-not-allowed">
          Portfolio
        </span>
        <span class="text-gray-400 font-medium cursor-not-allowed">
          Analytics
        </span>
      </div>
      
      <!-- User Menu -->
      <div class="flex items-center space-x-4">
        {#if $authStore.isAuthenticated}
          <div class="hidden md:flex items-center space-x-3">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">Connected</p>
              <p class="text-xs text-gray-500">Tradovate</p>
            </div>
            <div class="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <button
            on:click={handleLogout}
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Logout
          </button>
        {/if}
      </div>
    </div>
  </nav>
</header>

