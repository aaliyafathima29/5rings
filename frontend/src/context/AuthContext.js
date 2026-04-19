import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

/**
 * useAuth — consume auth state anywhere in the tree.
 * Returns: { user, loading, login, logout }
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // "loading" stays true until the first /me check completes.
  // All route guards wait on this before making redirect decisions.
  const [loading, setLoading] = useState(true);

  // ── On mount: verify the HttpOnly cookie session with the server ────────────
  useEffect(() => {
    authAPI.getMe()
      .then((res) => {
        const u = res.data.user;
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
        window.dispatchEvent(new Event('5rings:auth'));
      })
      .catch(() => {
        // Cookie absent or expired — treat as logged-out
        setUser(null);
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('5rings:auth'));
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Listen for programmatic force-logout from the api interceptor ───────────
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('5rings:auth'));
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  /**
   * login — call after a successful /login or /verify-otp response.
   * userData must be the user object returned by the backend.
   */
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('5rings:auth'));
  };

  /**
   * logout — clears the HttpOnly cookie via POST /auth/logout,
   * then clears local state.
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // Best-effort; proceed regardless of network error
    }
    setUser(null);
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('5rings:auth'));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
