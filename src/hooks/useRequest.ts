import { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '../services/api/client';
import { ApiError, type RequestConfig } from '../services/api/types';

export interface UseRequestOptions<T> extends Partial<RequestConfig> {
  /** Si está en true (por defecto cuando hay `url`), corre al montar y al cambiar `deps`. */
  auto?: boolean;
  /** Dependencias para re-ejecutar automáticamente (estilo useEffect deps). */
  deps?: ReadonlyArray<unknown>;
  /** Callback al completar con éxito. */
  onSuccess?: (data: T) => void;
  /** Callback al fallar. */
  onError?: (error: ApiError) => void;
}

export interface UseRequestResult<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  /**
   * Ejecuta la petición. Pasa `overrides` para mutar los args del config base
   * (útil para mutaciones POST/PATCH/DELETE).
   * Devuelve la data en éxito y `null` en error (también setea `error`).
   */
  execute: (overrides?: Partial<RequestConfig>) => Promise<T | null>;
  /** Reinicia el estado a `null` / `false`. */
  reset: () => void;
}

/**
 * Hook único para todas las peticiones HTTP del panel.
 *
 * MODO QUERY (auto-fetch):
 *   const { data, loading, error } = useRequest<Article[]>({ url: '/articles' });
 *   // refetch al cambiar deps:
 *   const { data } = useRequest<Article[]>({
 *     url: '/articles',
 *     query: { search, page },
 *     deps: [search, page],
 *   });
 *
 * MODO MUTACIÓN (imperativo):
 *   const { execute, loading, error } = useRequest<Article>({ auto: false });
 *   const onSubmit = async () => {
 *     const created = await execute({ url: '/articles', method: 'POST', body: form });
 *     if (created) { navigate(...) }
 *   };
 */
export function useRequest<T = unknown>(
  options: UseRequestOptions<T> = {}
): UseRequestResult<T> {
  const { auto = !!options.url, deps = [], onSuccess, onError, ...baseConfig } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(auto);
  const [error, setError] = useState<ApiError | null>(null);

  // Refs para evitar recrear `execute` cuando cambian opciones cosméticas.
  const baseRef = useRef(baseConfig);
  baseRef.current = baseConfig;

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // Para evitar setState en componente desmontado.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (overrides?: Partial<RequestConfig>): Promise<T | null> => {
      const merged: RequestConfig = {
        ...baseRef.current,
        ...overrides,
        // Permite que overrides añadan headers/query sobreescribiendo solo lo necesario
        headers: { ...(baseRef.current.headers ?? {}), ...(overrides?.headers ?? {}) },
        query: { ...(baseRef.current.query ?? {}), ...(overrides?.query ?? {}) },
      } as RequestConfig;

      if (!merged.url) {
        throw new Error('useRequest.execute requiere una `url` (en config base o overrides).');
      }

      setLoading(true);
      setError(null);
      try {
        const result = await apiClient.request<T>(merged);
        if (!mountedRef.current) return result;
        setData(result);
        onSuccessRef.current?.(result);
        return result;
      } catch (err) {
        const apiErr =
          err instanceof ApiError
            ? err
            : new ApiError(0, { code: 'NETWORK_ERROR', message: String(err) });
        if (mountedRef.current) {
          setError(apiErr);
          onErrorRef.current?.(apiErr);
        }
        return null;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Modo auto: dispara al montar y cuando cambian `deps`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!auto || !baseRef.current.url) return;
    const controller = new AbortController();
    execute({ signal: controller.signal });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, ...deps]);

  return { data, loading, error, execute, reset };
}
