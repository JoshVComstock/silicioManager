import { apiClient } from './client';
import type { AuthUser } from '../../types/admin';

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>(
      '/auth/login',
      { email, password },
      { skipAuth: true }
    ),

  refresh: (refreshToken: string) =>
    apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken }, { skipAuth: true }),

  logout: (refreshToken: string | null) =>
    apiClient.post<void>('/auth/logout', { refreshToken: refreshToken ?? undefined }, { skipAuth: true }),

  me: () => apiClient.get<{ user: AuthUser }>('/auth/me'),
};
