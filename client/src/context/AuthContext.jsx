import { createContext, useContext, useState, useEffect } from 'react';
import { setToken, clearToken } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ll_token');
    const saved = localStorage.getItem('ll_user');
    if (token && saved) {
      try { setUser(JSON.parse(saved)); } catch { clearToken(); }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    setToken(token);
    localStorage.setItem('ll_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem('ll_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
