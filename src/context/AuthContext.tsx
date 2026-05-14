import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types/admin';
import { authApi } from '../services/api/auth.api';
import { apiClient } from '../services/api/client';
import { tokenStorage } from '../services/api/tokenStorage';
import { ApiError } from '../services/api/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Cuando el ApiClient detecta auth irrecuperable, limpiamos el estado de usuario.
  // ProtectedRoute hará el redirect automáticamente al ver `user === null`.
  useEffect(() => {
    apiClient.setOnAuthFailure(() => setUser(null));
    return () => apiClient.setOnAuthFailure(null);
  }, []);

  // Al montar, si hay token guardado, intentamos cargar el usuario actual.
  useEffect(() => {
    const bootstrap = async () => {
      if (!tokenStorage.getAccess()) {
        setLoading(false);
        return;
      }
      try {
        const { user: me } = await authApi.me();
        setUser(me);
      } catch {
        // El client ya intentó refresh; si llegamos aquí es que no se pudo.
        tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authApi.login(email, password);
      tokenStorage.set(data.accessToken, data.refreshToken);
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo conectar con el servidor';
      return { ok: false, error: message };
    }
  };

  const logout = async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      await authApi.logout(refresh);
    } catch {
      // ignoramos errores de red en logout
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
