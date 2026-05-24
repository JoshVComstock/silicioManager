import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '../baseQuery';
import { articlesApi } from '../articles/articlesApiSlice';
import type { Article, CategorySlug } from '../../services/api/articles.api';

export interface GenerateArticleInput {
  topic: string;
  category: CategorySlug;
}

export interface GenerationMetrics {
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  durationMs: number;
  model: string;
}

export interface GenerateArticleResponse {
  article: Article;
  metrics: GenerationMetrics;
}

export const agentApi = createApi({
  reducerPath: 'agentApi',
  baseQuery: apiBaseQuery,
  endpoints: (builder) => ({
    generateArticle: builder.mutation<GenerateArticleResponse, GenerateArticleInput>({
      query: (body) => ({ url: '/agent/generate', method: 'POST', body }),
      // Cuando un artículo se genera, invalidamos la caché de la lista de artículos
      // para que el nuevo DRAFT aparezca sin necesidad de refetch manual.
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(articlesApi.util.invalidateTags([{ type: 'Article', id: 'LIST' }]));
        } catch {
          // Si falla, no hay nada que invalidar
        }
      },
    }),
  }),
});

export const { useGenerateArticleMutation } = agentApi;
