import { writable } from 'svelte/store';

// Create a custom store for authentication
function createAuthStore() {
  const storedAuth = localStorage.getItem('authData');
  const initialState = storedAuth ? JSON.parse(storedAuth) : {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
  };

  const { subscribe, set, update } = writable(initialState);

  return {
    subscribe,
    login: (authData) => {
      const newState = {
        isAuthenticated: true,
        user: authData.user,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        expiresAt: authData.expiresAt,
      };
      localStorage.setItem('authData', JSON.stringify(newState));
      set(newState);
    },
    logout: () => {
      const emptyState = {
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      };
      localStorage.removeItem('authData');
      set(emptyState);
    },
    updateToken: (accessToken, expiresAt) => {
      update(state => {
        const newState = { ...state, accessToken, expiresAt };
        localStorage.setItem('authData', JSON.stringify(newState));
        return newState;
      });
    },
    checkExpiration: () => {
      update(state => {
        if (state.expiresAt && Date.now() >= state.expiresAt) {
          // Token expired, logout
          localStorage.removeItem('authData');
          return {
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
          };
        }
        return state;
      });
    },
  };
}

export const authStore = createAuthStore();

