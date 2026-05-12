import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch, setToken as persistToken, getToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(!!getToken());

  const loadUser = useCallback(async () => {
    const t = getToken();
    setTokenState(t);
    if (!t) {
      setUser(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const me = await apiFetch("/api/users/me");
      setUser(me);
      return me;
    } catch {
      persistToken(null);
      setTokenState(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const login = useCallback(
    async (email, password) => {
      const body = await apiFetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      if (!body?.token) throw new Error("No token returned.");
      persistToken(body.token);
      return loadUser();
    },
    [loadUser]
  );

  const logout = useCallback(() => {
    persistToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(() => loadUser(), [loadUser]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      refreshMe,
      isSuperAdmin: user?.admin_profile?.role === "super_admin",
    }),
    [user, token, loading, login, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
