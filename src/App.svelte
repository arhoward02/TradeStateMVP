<script>
  import { onMount } from 'svelte';
  import Router from 'svelte-spa-router';
  import { wrap } from 'svelte-spa-router/wrap';
  import { authStore } from './stores/auth';
  import { supabase } from './lib/supabase.js';

  import Login from './routes/Login.svelte';
  import Dashboard from './routes/Dashboard.svelte';

  const routes = {
    '/': Login,
    '/login': Login,
    '/dashboard': wrap({
      component: Dashboard,
      conditions: [() => $authStore.isAuthenticated],
    }),
  };

  onMount(async () => {
    if (window.location.search.includes('code=')) {
      await supabase.auth.exchangeCodeForSession(window.location.href);
      window.history.replaceState({}, '', window.location.pathname + '#/dashboard');
    }
  });

  function conditionsFailed() {
    if (!$authStore.isAuthenticated) {
      window.location.hash = '/login';
    }
  }
</script>

<main class="min-h-screen">
  <Router {routes} on:conditionsFailed={conditionsFailed} />
</main>
