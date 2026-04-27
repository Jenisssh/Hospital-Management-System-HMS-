import { createContext, useContext, useEffect, useState } from 'react';
import { decodeJwt } from '../lib/jwt.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hms_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    const payload = decodeJwt(token);
    if (!payload) {
      localStorage.removeItem('hms_token');
      setToken(null);
      return;
    }
    setUser({
      username: payload.sub,
      role: (payload.role || '').toLowerCase(),
      userId: payload.userId,
      linkedId: payload.linkedId ?? null,
    });
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem('hms_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
