export type ArticleStatus = 'published' | 'draft' | 'scheduled' | 'archived';

export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: ArticleStatus;
  author: string;
  views: number;
  publishedAt: string | null;
  updatedAt: string;
}

export type LogLevel = 'info' | 'success' | 'warning' | 'error';
export type LogAction =
  | 'article.generate'
  | 'article.publish'
  | 'article.update'
  | 'image.fetch'
  | 'newsletter.send'
  | 'auth.login';

export interface AgentLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  action: LogAction;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costUsd: number;
  durationMs: number;
  message: string;
  articleId?: string;
}

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
