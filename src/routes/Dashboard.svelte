<script>
  import { authStore } from '../stores/auth';
  import Header from '../components/Header.svelte';

  $: user = $authStore.user;
  $: displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Trader';
</script>

<div class="min-h-screen bg-gray-50">
  <Header />

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome, {displayName}</h1>
      <p class="text-gray-600">Your trade journal is saved securely to the cloud.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <a href="/study.html" class="card hover:shadow-md transition-shadow block">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Trade Journal</p>
            <p class="text-xl font-semibold text-gray-900">Study Gallery</p>
            <p class="text-sm text-gray-500 mt-2">Log stock + index chart studies with tags and notes.</p>
          </div>
          <div class="p-3 bg-primary-100 rounded-full">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </a>

      <a href="/leading-groups.html" class="card hover:shadow-md transition-shadow block">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Market Breadth</p>
            <p class="text-xl font-semibold text-gray-900">Leading Groups</p>
            <p class="text-sm text-gray-500 mt-2">Paste Deepvue ranks + themes to find top leaders.</p>
          </div>
          <div class="p-3 bg-primary-100 rounded-full">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </a>

      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600 mb-1">Account</p>
            <p class="text-xl font-semibold text-gray-900">Google</p>
            <p class="text-sm text-gray-500 mt-2">{user?.email || 'Signed in'}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div class="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
      <div class="text-center py-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">More Features Coming Soon</h3>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Portfolio tracking, analytics, and biometric insights are on the way.
        </p>
      </div>
    </div>
  </main>
</div>
