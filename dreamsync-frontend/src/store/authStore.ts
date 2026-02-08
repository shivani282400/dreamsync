import { create } from "zustand";
import { loginApi, registerApi } from "../services/auth.api";
import { setAuthToken } from "../lib/authToken";

type AuthState = {
  user: { id: string; username: string } | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
};

function safeGetToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

function safeSetToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  } catch {
    // no-op: storage may be blocked
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: (() => {
    const initial = safeGetToken();
    setAuthToken(initial);
    return initial;
  })(),

  login: async (email, password) => {
    const res = await loginApi(email, password);
    safeSetToken(res.token);
    setAuthToken(res.token);
    set({ user: res.user, token: res.token });
  },

  register: async (email, name, password) => {
    await registerApi(email, name, password);
    const res = await loginApi(email, password);
    safeSetToken(res.token);
    setAuthToken(res.token);
    set({ user: res.user, token: res.token });
  },

  logout: () => {
    safeSetToken(null);
    setAuthToken(null);
    set({ user: null, token: null });
  },
}));
