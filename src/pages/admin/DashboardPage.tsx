import { FileText, Eye, Clock, Archive } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';
import StatCard from '../../components/admin/StatCard';
import { useGetArticlesQuery } from '../../features/articles/articlesApiSlice';

const DashboardPage = () => {
  const { data: published } = useGetArticlesQuery({ status: 'PUBLISHED', pageSize: 1 });
  const { data: drafts } = useGetArticlesQuery({ status: 'DRAFT', pageSize: 1 });
  const { data: scheduled } = useGetArticlesQuery({ status: 'SCHEDULED', pageSize: 1 });
  const { data: archived } = useGetArticlesQuery({ status: 'ARCHIVED', pageSize: 1 });

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen del estado del sitio."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Publicados"
          value={published?.total ?? '—'}
          icon={FileText}
          accent="indigo"
        />
        <StatCard
          label="Borradores"
          value={drafts?.total ?? '—'}
          icon={Eye}
          accent="cyan"
        />
        <StatCard
          label="Programados"
          value={scheduled?.total ?? '—'}
          icon={Clock}
          accent="purple"
        />
        <StatCard
          label="Archivados"
          value={archived?.total ?? '—'}
          icon={Archive}
          accent="green"
        />
      </div>

      <div className="rounded-xl border border-border bg-surface/30 px-6 py-10 text-center text-text-muted">
        <p className="font-medium mb-1">Logs del agente</p>
        <p className="text-sm">Disponibles cuando se implemente el agente generador.</p>
      </div>
    </>
  );
};

export default DashboardPage;
