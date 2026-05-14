import { createApi } from '@reduxjs/toolkit/query/react';
import { apiBaseQuery } from '../baseQuery';
import type {
  Article,
  PaginatedArticles,
  ListArticlesQuery,
  CreateArticleInput,
  UpdateArticleInput,
} from '../../services/api/articles.api';

export const articlesApi = createApi({
  reducerPath: 'articlesApi',
  baseQuery: apiBaseQuery,
  tagTypes: ['Article'],
  endpoints: (builder) => ({
    getArticles: builder.query<PaginatedArticles, ListArticlesQuery | void>({
      query: (params) => ({
        url: '/articles',
        method: 'GET',
        query: (params ?? {}) as Record<string, string | number | undefined>,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'Article' as const, id })),
              { type: 'Article' as const, id: 'LIST' },
            ]
          : [{ type: 'Article' as const, id: 'LIST' }],
    }),

    getArticleById: builder.query<{ article: Article }, string>({
      query: (id) => ({ url: `/articles/${id}`, method: 'GET' }),
      providesTags: (_, __, id) => [{ type: 'Article', id }],
    }),

    createArticle: builder.mutation<{ article: Article }, CreateArticleInput>({
      query: (body) => ({ url: '/articles', method: 'POST', body }),
      invalidatesTags: [{ type: 'Article', id: 'LIST' }],
    }),

    updateArticle: builder.mutation<
      { article: Article },
      { id: string; body: UpdateArticleInput }
    >({
      query: ({ id, body }) => ({ url: `/articles/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Article', id },
        { type: 'Article', id: 'LIST' },
      ],
    }),

    deleteArticle: builder.mutation<void, string>({
      query: (id) => ({ url: `/articles/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Article', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetArticlesQuery,
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useDeleteArticleMutation,
} = articlesApi;
