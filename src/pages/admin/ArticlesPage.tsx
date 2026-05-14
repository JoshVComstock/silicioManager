import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';
import { Table } from '../../components/admin/Table';
import { ArticleStatusBadge } from '../../components/admin/StatusBadge';
import {
  useGetArticlesQuery,
  useDeleteArticleMutation,
} from '../../features/articles/articlesApiSlice';
import type { Article } from '../../services/api/articles.api';
import type { AdminArticle, ArticleStatus } from '../../types/admin';

const CATEGORY_NAME: Record<string, string> = {
  ia: 'IA',
  ciencia: 'Ciencia',
  seguridad: 'Seguridad',
  tecnologia: 'Tecnología',
};

const toAdminRow = (a: Article): AdminArticle => ({
  id: a.id,
  title: a.title,
  slug: a.slug,
  category: CATEGORY_NAME[a.category] ?? a.category,
  status: a.status.toLowerCase() as ArticleStatus,
  author: a.authorId,
  views: a.views,
  publishedAt: a.publishedAt,
  updatedAt: a.updatedAt,
});

const BLOG_BASE_URL = import.meta.env.VITE_BLOG_URL ?? 'http://localhost:3000';

const ArticlesPage = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data, isLoading, isFetching, error } = useGetArticlesQuery(
    { search: search || undefined, pageSize: 50 },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteArticle, { isLoading: deleting }] = useDeleteArticleMutation();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return;
    await deleteArticle(id);
    // No manual refetch needed — RTK invalidates 'Article LIST' automatically
  };

  const rows = useMemo(() => (data?.items ?? []).map(toAdminRow), [data]);

  const apiError = error as { message?: string } | undefined;

  return (
    <>
      <PageHeader
        title="Artículos"
        description="Gestiona los artículos publicados, programados y en borrador."
        actions={
          <button
            onClick={() => navigate('/admin/articles/new')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Nuevo artículo
          </button>
        }
      />

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título…"
          className="w-full pl-10 pr-3 py-2 rounded-lg bg-surface border border-border text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 px-4 py-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">No se pudo cargar la lista</p>
            <p className="text-xs text-red-300/80 mt-0.5">{apiError?.message ?? 'Error desconocido'}</p>
          </div>
        </div>
      )}

      {isLoading && !data ? (
        <div className="flex items-center justify-center py-20 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Cargando artículos…
        </div>
      ) : (
        <>
          <Table<AdminArticle>
            rowKey={(r) => r.id}
            data={rows}
            emptyMessage={search ? 'No hay artículos que coincidan.' : 'No hay artículos todavía.'}
            columns={[
              {
                key: 'title',
                header: 'Título',
                render: (r) => (
                  <div className="min-w-0">
                    <p className="font-medium text-sm leading-snug line-clamp-1">{r.title}</p>
                    <p className="text-[11px] text-text-muted font-mono mt-0.5">
                      /{r.category.toLowerCase()}/{r.slug}
                    </p>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Estado',
                render: (r) => <ArticleStatusBadge status={r.status} />,
              },
              {
                key: 'cat',
                header: 'Categoría',
                render: (r) => <span className="text-text-muted">{r.category}</span>,
              },
              {
                key: 'views',
                header: 'Vistas',
                align: 'right',
                render: (r) => (
                  <span className="font-mono">{r.views.toLocaleString('es-ES')}</span>
                ),
              },
              {
                key: 'date',
                header: 'Publicado',
                render: (r) => (
                  <span className="text-text-muted text-xs">
                    {r.publishedAt
                      ? new Date(r.publishedAt).toLocaleDateString('es-ES')
                      : '—'}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: '',
                align: 'right',
                width: '120px',
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <a
                      href={`${BLOG_BASE_URL}/${r.category.toLowerCase()}/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                      title="Ver en blog"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={() => navigate(`/admin/articles/${r.id}/edit`)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id, r.title)}
                      disabled={deleting || isFetching}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
          />

          {data && data.total > 0 && (
            <p className="mt-4 text-xs text-text-muted">
              {data.total} artículo{data.total !== 1 ? 's' : ''} en total
            </p>
          )}
        </>
      )}
    </>
  );
};

export default ArticlesPage;
