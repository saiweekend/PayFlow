import { defineStore } from 'pinia';
import { api } from '@/api/client';
import { setAuthToken } from '@/api/client';

interface AuthState {
  accessToken: string | null;
  expiresAt: number | null; // epoch ms
  email: string | null;
}

/**
 * Deliberately NOT persisted to localStorage. Storing a bearer token in
 * localStorage/sessionStorage makes it readable by any script that runs on
 * the page — including an injected XSS payload — which turns a single XSS
 * bug into full account takeover. Keeping the token in memory only means a
 * page refresh logs the user out (a real app would pair this with an
 * httpOnly refresh-token cookie to restore the session silently), but it
 * closes off that entire class of token-theft.
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    expiresAt: null,
    email: null,
  }),

  getters: {
    isAuthenticated: (state): boolean =>
      Boolean(state.accessToken) && (state.expiresAt ?? 0) > Date.now(),
  },

  actions: {
    async login(email: string, password: string): Promise<void> {
      const { accessToken, expiresIn } = await api.login({ email, password });
      this.accessToken = accessToken;
      this.expiresAt = Date.now() + expiresIn * 1000;
      this.email = email;
      setAuthToken(accessToken);
    },

    logout(): void {
      this.accessToken = null;
      this.expiresAt = null;
      this.email = null;
      setAuthToken(null);
    },
  },
});
