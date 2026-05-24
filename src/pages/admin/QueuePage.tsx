import { useMemo, useState } from 'react';
import {
  Plus,
  Trash2,
  Play,
  Sparkles,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/admin/PageHeader';
import { Table } from '../../components/admin/Table';
import AddTopicModal from '../../components/admin/AddTopicModal';
import {
  ArticleTypeBadge,
  TopicSourceBadge,
  TopicStatusBadge,
} from '../../components/admin/StatusBadge';
import {
  useDeleteTopicMutation,
  useDiscoverMutation,
  useGetTopicsQuery,
  useRunNextMutation,
  type TopicQueueItem,
  type TopicStatus,
} from '../../features/agent/topicsApiSlice';

const STATUSES: { value: TopicStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDING', label: 'En cola' },
  { value: 'PROCESSING', label: 'Generando' },
  { value: 'DONE', label: 'Generados' },
  { value: 'FAILED', label: 'Fallidos' },
];

const CATEGORY_LABEL: Record<string, string> = {
  ia: 'IA',
  ciencia: 'Ciencia',
  seguridad: 'Seguridad',
  tecnologia: 'Tecnología',
};

const QueuePage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all');
  const [addOpen, setAddOpen] = useState(false);

  const { data, isLoading, isFetching, error, refetch } = useGetTopicsQuery(
    { status: statusFilter === 'all' ? undefined : statusFilter, pageSize: 50 },
    { refetchOnMountOrArgChange: true }
  );

  const [deleteTopic] = useDeleteTopicMutation();
  const [runNext, { isLoading: running }] = useRunNextMutation();
  const [discover, { isLoading: discovering }] = useDiscoverMutation();

  const items = useMemo(() => data?.items ?? [], [data]);

  const handleDelete = async (id: string, topic: string) => {
    if (!confirm(`¿Eliminar el tema "${topic.slice(0, 60)}..."?`)) return;
    await deleteTopic(id);
  };

  const handleRunNext = async () => {
    const result = await runNext().unwrap().catch(() => null);
    if (!result) {
      alert('Error al ejecutar el siguiente tema');
      return;
    }
    if (result.status === 'NO_TOPICS') {
      alert('No hay temas pendientes en la cola');
    } else if (result.status === 'DONE') {
      alert(`✅ Artículo generado: ${result.articleId}`);
    } else {
      alert(`❌ Error: ${result.error ?? 'desconocido'}`);
    }
  };

  const handleDiscover = async () => {
    const result = await discover().unwrap().catch(() => null);
    if (!result) {
      alert('Error al ejecutar discovery');
      return;
    }
    if (result.status === 'DONE') {
      alert(`✨ ${result.inserted ?? 0} temas añadidos, ${result.skipped ?? 0} duplicados saltados`);
    } else if (result.status === 'BUDGET_EXCEEDED') {
      alert('Budget diario agotado');
    } else if (result.status === 'SKIPPED_QUEUE_FULL') {
      alert('La cola ya está llena (10+ temas pendientes)');
    } else {
      alert(`Error: ${result.error ?? 'desconocido'}`);
    }
  };

  const apiError = error as { message?: string } | undefined;

  return (
    <>
      <PageHeader
        title="Cola del agente"
        description="Temas pendientes para que el agente IA genere artículos. El cron procesa la cola automáticamente 3 veces al día."
        actions={
          <>
            <button
              onClick={handleDiscover}
              disabled={discovering}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              title="Pide a Gemini que sugiera 10 temas nuevos basados en noticias reales"
            >
              {discovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {discovering ? 'Buscando…' : 'Descubrir temas'}
            </button>
            <button
              onClick={handleRunNext}
              disabled={running}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              title="Genera el siguiente artículo de la cola sin esperar al cron"
            >
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? 'Generando…' : 'Generar siguiente'}
            </button>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <Plus className="h-4 w-4" />
              Añadir tema
            </button>
          </>
        }
      />

      {/* Info banner */}
      <div className="flex items-start gap-2 px-4 py-3 mb-5 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-sm text-text-muted">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-300" />
        <div>
          <p className="text-white font-medium mb-0.5">Cómo funciona</p>
          <p className="text-xs leading-relaxed">
            El cron corre <span className="text-white font-medium">3 veces al día</span> (8:00, 14:00, 20:00 UTC) y saca
            el tema con mayor prioridad. <span className="text-white font-medium">"Descubrir temas"</span> usa
            Google Search para llenar la cola con noticias frescas. Todos los artículos se crean como
            <span className="text-white font-medium"> borrador</span>.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              statusFilter === s.value
                ? 'bg-primary text-white border-primary'
                : 'bg-surface border-border text-text-muted hover:text-white hover:border-white/20'
            }`}
          >
            {s.label}
            {data && statusFilter === s.value && <span className="ml-1.5 opacity-70">({data.total})</span>}
          </button>
        ))}
        <button
          onClick={() => refetch()}
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">No se pudo cargar la cola</p>
            <p className="text-xs text-red-300/80 mt-0.5">{apiError?.message ?? 'Error desconocido'}</p>
          </div>
        </div>
      )}

      {/* Tabla */}
      {isLoading && !data ? (
        <div className="flex items-center justify-center py-20 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Cargando cola…
        </div>
      ) : (
        <Table<TopicQueueItem>
          rowKey={(r) => r.id}
          data={items}
          emptyMessage={
            statusFilter === 'all'
              ? 'La cola está vacía. Añade un tema o usa "Descubrir temas" para llenarla con IA.'
              : `No hay temas con estado "${statusFilter}".`
          }
          columns={[
            {
              key: 'topic',
              header: 'Tema',
              render: (r) => (
                <div className="min-w-0 max-w-2xl">
                  <p className="text-sm leading-snug line-clamp-2">{r.topic}</p>
                  {r.metadata?.reasoning && (
                    <p className="text-[11px] text-text-muted mt-1 line-clamp-1 italic">
                      💡 {r.metadata.reasoning}
                    </p>
                  )}
                  {r.errorMessage && (
                    <p className="text-[11px] text-red-300/80 mt-1 line-clamp-2">
                      ⚠ {r.errorMessage}
                    </p>
                  )}
                </div>
              ),
            },
            {
              key: 'type',
              header: 'Tipo',
              render: (r) => <ArticleTypeBadge type={r.articleType} />,
            },
            {
              key: 'cat',
              header: 'Categoría',
              render: (r) => (
                <span className="text-text-muted text-xs">
                  {CATEGORY_LABEL[r.category] ?? r.category}
                </span>
              ),
            },
            {
              key: 'priority',
              header: 'Prio',
              align: 'center',
              render: (r) => (
                <span
                  className={`font-mono font-bold text-sm ${
                    r.priority >= 8 ? 'text-red-300' : r.priority >= 5 ? 'text-amber-300' : 'text-text-muted'
                  }`}
                >
                  {r.priority}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'Estado',
              render: (r) => <TopicStatusBadge status={r.status} />,
            },
            {
              key: 'source',
              header: 'Origen',
              render: (r) => <TopicSourceBadge source={r.source} />,
            },
            {
              key: 'date',
              header: 'Creado',
              render: (r) => (
                <span className="text-text-muted text-xs">
                  {new Date(r.createdAt).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              align: 'right',
              width: '110px',
              render: (r) => (
                <div className="flex items-center justify-end gap-1">
                  {r.articleId && (
                    <button
                      onClick={() => navigate(`/admin/articles/${r.articleId}/edit`)}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                      title="Ver artículo generado"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(r.id, r.topic)}
                    disabled={r.status === 'PROCESSING'}
                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {data && data.total > 0 && (
        <p className="mt-4 text-xs text-text-muted">
          {data.total} tema{data.total !== 1 ? 's' : ''} en total
        </p>
      )}

      <AddTopicModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
};

export default QueuePage;
