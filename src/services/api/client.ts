import { ApiError, type ApiErrorPayload, type RequestConfig } from './types';
import { tokenStorage } from './tokenStorage';

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:4000/api/v1';

/**
 * Construye la URL final con query string.
 */
const buildUrl = (path: string, query?: RequestConfig['query']): string => {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
};

/**
 * Singleton encargado de:
 * - Adjuntar Authorization header
 * - Hacer auto-refresh en 401 (una sola vez por petición)
 * - Notificar fallo definitivo de auth (para que la UI redirija a /login)
 */
class ApiClient {
  /** Promesa única de refresh en curso para deduplicar requests concurrentes. */
  private refreshing: Promise<string | null> | null = null;

  /** Callback que dispara la UI cuando la sesión es irrecuperable. */
  private onAuthFailure: (() => void) | null = null;

  setOnAuthFailure(cb: (() => void) | null): void {
    this.onAuthFailure = cb;
  }

  async request<T>(config: RequestConfig): Promise<T> {
    return this.executeWithRetry<T>(config, false);
  }

  // ── Atajos de conveniencia ─────────────────────────────────────────────
  get<T>(url: string, query?: RequestConfig['query'], opts?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...opts, url, method: 'GET', query });
  }
  post<T>(url: string, body?: unknown, opts?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...opts, url, method: 'POST', body });
  }
  patch<T>(url: string, body?: unknown, opts?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...opts, url, method: 'PATCH', body });
  }
  delete<T>(url: string, opts?: Partial<RequestConfig>): Promise<T> {
    return this.request<T>({ ...opts, url, method: 'DELETE' });
  }

  // ── Internals ──────────────────────────────────────────────────────────
  private async executeWithRetry<T>(config: RequestConfig, isRetry: boolean): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(config.headers ?? {}),
    };

    if (config.body !== undefined && !(config.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (!config.skipAuth) {
      const token = tokenStorage.getAccess();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const init: RequestInit = {
      method: config.method ?? 'GET',
      headers,
      signal: config.signal,
    };

    if (config.body !== undefined) {
      init.body = config.body instanceof FormData ? config.body : JSON.stringify(config.body);
    }

    const response = await fetch(buildUrl(config.url, config.query), init);

    // 204 No Content → no parseamos body
    if (response.status === 204) return undefined as T;

    // Intento de auto-refresh en 401 (una sola vez)
    if (response.status === 401 && !config.skipAuth && !isRetry) {
      const newAccess = await this.tryRefresh();
      if (newAccess) {
        return this.executeWithRetry<T>(config, true);
      }
      this.notifyAuthFailure();
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
      const error: ApiErrorPayload = payload?.error ?? {
        code: 'UNKNOWN_ERROR',
        message: response.statusText || 'Error desconocido',
      };
      throw new ApiError(response.status, error);
    }

    return payload as T;
  }

  private async tryRefresh(): Promise<string | null> {
    // Si ya hay un refresh en curso, esperamos al mismo (evita N llamadas paralelas)
    if (this.refreshing) return this.refreshing;

    const refreshToken = tokenStorage.getRefresh();
    if (!refreshToken) return null;

    this.refreshing = (async () => {
      try {
        const data = await this.executeWithRetry<{ accessToken: string; refreshToken: string }>(
          {
            url: '/auth/refresh',
            method: 'POST',
            body: { refreshToken },
            skipAuth: true,
          },
          true // marcado como retry para no entrar en loop
        );
        tokenStorage.set(data.accessToken, data.refreshToken);
        return data.accessToken;
      } catch {
        tokenStorage.clear();
        return null;
      } finally {
        this.refreshing = null;
      }
    })();

    return this.refreshing;
  }

  private notifyAuthFailure(): void {
    tokenStorage.clear();
    this.onAuthFailure?.();
  }
}

export const apiClient = new ApiClient();
