import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '../baseQuery';
import { articlesApi } from '../articles/articlesApiSlice';
import type { CategorySlug } from '../../services/api/articles.api';

export type ArticleType =
  | 'NEWS'
  | 'TUTORIAL'
  | 'GUIDE'
  | 'COMPARISON'
  | 'TIPS'
  | 'DEEP_DIVE';

export type TopicStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | 'SKIPPED';
export type TopicSource = 'MANUAL' | 'AI_DISCOVERY';

export interface TopicQueueItem {
  id: string;
  topic: string;
  category: CategorySlug;
  articleType: ArticleType;
  priority: number;
  status: TopicStatus;
  source: TopicSource;
  scheduledFor: string | null;
  processedAt: string | null;
  articleId: string | null;
  errorMessage: string | null;
  metadata: { reasoning?: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTopics {
  items: TopicQueueItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListTopicsQuery {
  status?: TopicStatus;
  category?: CategorySlug;
  articleType?: ArticleType;
  source?: TopicSource;
  page?: number;
  pageSize?: number;
}

export interface AddTopicInput {
  topic: string;
  category: CategorySlug;
  articleType?: ArticleType;
  priority?: number;
  scheduledFor?: string | null;
}

export interface UpdateTopicInput {
  topic?: string;
  category?: CategorySlug;
  articleType?: ArticleType;
  priority?: number;
  status?: TopicStatus;
  scheduledFor?: string | null;
}

export interface RunNextResult {
  status: 'NO_TOPICS' | 'DONE' | 'FAILED';
  topic?: TopicQueueItem;
  articleId?: string;
  error?: string;
}

export interface DiscoverResult {
  status: 'SKIPPED_QUEUE_FULL' | 'BUDGET_EXCEEDED' | 'DONE' | 'FAILED';
  inserted?: number;
  skipped?: number;
  error?: string;
}

// ── Slice ────────────────────────────────────────────────────────────
export const topicsApi = createApi({
  reducerPath: 'topicsApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Topic'],
  endpoints: (builder) => ({
    getTopics: builder.query<PaginatedTopics, ListTopicsQuery | void>({
      query: (params) => ({
        url: '/agent/topics',
        method: 'GET',
        query: (params ?? {}) as Record<string, string | number | undefined>,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Topic' as const, id })),
              { type: 'Topic' as const, id: 'LIST' },
            ]
          : [{ type: 'Topic' as const, id: 'LIST' }],
    }),

    addTopic: builder.mutation<{ topic: TopicQueueItem }, AddTopicInput>({
      query: (body) => ({ url: '/agent/topics', method: 'POST', body }),
      invalidatesTags: [{ type: 'Topic', id: 'LIST' }],
    }),

    updateTopic: builder.mutation<
      { topic: TopicQueueItem },
      { id: string; body: UpdateTopicInput }
    >({
      query: ({ id, body }) => ({ url: `/agent/topics/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Topic', id },
        { type: 'Topic', id: 'LIST' },
      ],
    }),

    deleteTopic: builder.mutation<void, string>({
      query: (id) => ({ url: `/agent/topics/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Topic', id: 'LIST' }],
    }),

    runNext: builder.mutation<RunNextResult, void>({
      query: () => ({ url: '/agent/run-next', method: 'POST' }),
      // Tras correr, invalidar topics Y la lista de artículos (porque hay uno nuevo)
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(articlesApi.util.invalidateTags([{ type: 'Article', id: 'LIST' }]));
        } catch {
          /* noop */
        }
      },
      invalidatesTags: [{ type: 'Topic', id: 'LIST' }],
    }),

    discover: builder.mutation<DiscoverResult, void>({
      query: () => ({ url: '/agent/discover', method: 'POST' }),
      invalidatesTags: [{ type: 'Topic', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetTopicsQuery,
  useAddTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useRunNextMutation,
  useDiscoverMutation,
} = topicsApi;
