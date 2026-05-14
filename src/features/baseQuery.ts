import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { apiClient } from '../services/api/client';
import { ApiError, type RequestConfig } from '../services/api/types';

// Wraps the existing ApiClient (which already handles JWT auto-refresh)
// so RTK Query can use it as its transport layer.
export const apiBaseQuery: BaseQueryFn<
  Partial<RequestConfig>,
  unknown,
  { status: number; message: string }
> = async (config) => {
  try {
    const data = await apiClient.request(config as RequestConfig);
    return { data };
  } catch (err) {
    if (err instanceof ApiError) {
      return { error: { status: err.status, message: err.message } };
    }
    return { error: { status: 0, message: String(err) } };
  }
};
