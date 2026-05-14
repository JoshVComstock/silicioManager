export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  /** Si es true, no añade el token (login, refresh, etc.) */
  skipAuth?: boolean;
  /** AbortSignal para cancelar la petición */
  signal?: AbortSignal;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Error normalizado de la API. Todos los errores HTTP terminan aquí.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }

  /** True cuando el error fue por sesión expirada/inválida tras intentar refresh. */
  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }
}
