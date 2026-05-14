/**
 * Almacenamiento de tokens en localStorage.
 *
 * Trade-off: localStorage es accesible desde JS (vulnerable a XSS).
 * En producción seria, el refreshToken debería ir en cookie httpOnly.
 * Para un panel admin con login obligatorio y CSP estricta es aceptable.
 */
const ACCESS_KEY = 'silicio_access_token';
const REFRESH_KEY = 'silicio_refresh_token';

export const tokenStorage = {
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string): void {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  setAccess(access: string): void {
    localStorage.setItem(ACCESS_KEY, access);
  },
  clear(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
