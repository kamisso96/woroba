'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { api } from './api';

type User = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const token = Cookies.get('accessToken');
        if (token) {
          const storedUser = localStorage.getItem('woroba_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.error('Erreur au chargement du user:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

      async function login(email: string, password: string) {
      const { data } = await api.post('/auth/login', { email, password });
      Cookies.set('accessToken', data.accessToken);
      Cookies.set('refreshToken', data.refreshToken);
      localStorage.setItem('woroba_user', JSON.stringify(data.user));
      setUser(data.user);
    }

  async function register(email: string, password: string, fullName: string) {
    const { data } = await api.post('/auth/register', { email, password, fullName });
    Cookies.set('accessToken', data.accessToken);
    Cookies.set('refreshToken', data.refreshToken);
    localStorage.setItem('woroba_user', JSON.stringify(data.user));
    setUser(data.user);
  }

  async function logout() {
    const refreshToken = Cookies.get('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch {
        // ignore
      }
    }
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('woroba_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
