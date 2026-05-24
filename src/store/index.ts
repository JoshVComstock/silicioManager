import { configureStore } from '@reduxjs/toolkit';
import { articlesApi } from '../features/articles/articlesApiSlice';
import { agentApi } from '../features/agent/agentApiSlice';
import { topicsApi } from '../features/agent/topicsApiSlice';

export const store = configureStore({
  reducer: {
    [articlesApi.reducerPath]: articlesApi.reducer,
    [agentApi.reducerPath]: agentApi.reducer,
    [topicsApi.reducerPath]: topicsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      articlesApi.middleware,
      agentApi.middleware,
      topicsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
