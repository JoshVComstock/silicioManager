import { apiClient } from './client';

export type CategorySlug = 'ia' | 'ciencia' | 'seguridad' | 'tecnologia';
export type ArticleStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export interface Faq {
  question: string;
  answer: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: CategorySlug;
  tags: string[];
  series: string | null;
  status: ArticleStatus;
  featured: boolean;
  featuredImage: string;
  featuredImageAlt: string;
  readingTime: number;
  views: number;
  faqs: Faq[] | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListArticlesQuery {
  category?: CategorySlug;
  status?: ArticleStatus;
  tag?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedArticles {
  items: Article[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateArticleInput {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: CategorySlug;
  tags: string[];
  series?: string | null;
  status?: ArticleStatus;
  featured?: boolean;
  featuredImage: string;
  featuredImageAlt: string;
  readingTime?: number;
  faqs?: Faq[] | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
}

export type UpdateArticleInput = Partial<CreateArticleInput>;

export const articlesApi = {
  list: (query?: ListArticlesQuery) =>
    apiClient.get<PaginatedArticles>(
      '/articles',
      query as Record<string, string | number | undefined>
    ),
  getById: (id: string) => apiClient.get<{ article: Article }>(`/articles/${id}`),
  getBySlug: (slug: string) => apiClient.get<{ article: Article }>(`/articles/slug/${slug}`),
  create: (input: CreateArticleInput) =>
    apiClient.post<{ article: Article }>('/articles', input),
  update: (id: string, input: UpdateArticleInput) =>
    apiClient.patch<{ article: Article }>(`/articles/${id}`, input),
  remove: (id: string) => apiClient.delete<void>(`/articles/${id}`),
};
