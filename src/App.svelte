<script>
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { authStore } from './stores/auth';
  
  // Route components
  import Login from './routes/Login.svelte';
  import Dashboard from './routes/Dashboard.svelte';
  import OAuthCallback from './routes/OAuthCallback.svelte';
  
  const routes = {
    '/': Login,
    '/login': Login,
    '/dashboard': wrap({
      component: Dashboard,
      conditions: [
        () => {
          return $authStore.isAuthenticated;
        }
      ]
    }),
    '/callback': OAuthCallback,
  };
  
  function conditionsFailed(event) {
    // Redirect to login if authentication check fails
    if (!$authStore.isAuthenticated) {
      window.location.hash = '/login';
    }
  }
</script>

<main class="min-h-screen">
  <Router {routes} on:conditionsFailed={conditionsFailed} />
</main>

