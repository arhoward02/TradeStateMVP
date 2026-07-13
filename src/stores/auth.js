import { writable } from 'svelte/store';
import { supabase } from '../lib/supabase.js';

function createAuthStore() {
  const { subscribe, set } = writable({
    isAuthenticated: false,
    user: null,
    session: null,
    loading: true,
  });

  function applySession(session) {
    set({
      isAuthenticated: !!session,
      user: session?.user ?? null,
      session,
      loading: false,
    });
  }

  supabase.auth.getSession().then(({ data: { session } }) => {
    applySession(session);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    applySession(session);
  });

  return {
    subscribe,
    loginWithGoogle: async () => {
      const redirectTo = `${window.location.origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) throw error;
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };
}

export const authStore = createAuthStore();
