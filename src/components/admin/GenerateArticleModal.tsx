import { useEffect, useState, type FormEvent } from 'react';
import { Sparkles, X, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useGenerateArticleMutation } from '../../features/agent/agentApiSlice';
import type { CategorySlug } from '../../services/api/articles.api';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Callback opcional cuando se genera con éxito (ej: redirigir a editar) */
  onSuccess?: (articleId: string) => void;
}

const CATEGORIES: { slug: CategorySlug; label: string; emoji: string }[] = [
  { slug: 'ia', label: 'Inteligencia Artificial', emoji: '🤖' },
  { slug: 'ciencia', label: 'Ciencia y Avances', emoji: '🔬' },
  { slug: 'seguridad', label: 'Ciberseguridad', emoji: '🛡️' },
  { slug: 'tecnologia', label: 'Tecnología y Sociedad', emoji: '💻' },
];

const TIPS_DURING_LOADING = [
  'Gemini está investigando el tema...',
  'Estructurando el artículo (H2, H3, listas)...',
  'Generando el contenido (1000-1500 palabras)...',
  'Optimizando para SEO y readability...',
  'Generando FAQ y metadata...',
  'Casi listo, escribiendo en base de datos...',
];

const GenerateArticleModal = ({ open, onClose, onSuccess }: Props) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<CategorySlug>('ia');
  const [tipIndex, setTipIndex] = useState(0);

  const [generate, { isLoading, error, data, reset }] = useGenerateArticleMutation();

  // Rota los tips cada 4 segundos mientras carga
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS_DURING_LOADING.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Reset al cerrar
  useEffect(() => {
    if (!open) {
      setTopic('');
      setCategory('ia');
      setTipIndex(0);
      reset();
    }
  }, [open, reset]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (topic.trim().length < 5) return;
    const result = await generate({ topic: topic.trim(), category });
    if ('data' in result && result.data) {
      onSuccess?.(result.data.article.id);
    }
  };

  const apiError = error as { message?: string } | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Generar artículo con IA</h2>
              <p className="text-xs text-text-muted">Se creará como borrador para revisar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* SUCCESS STATE */}
          {data && (
            <div className="flex flex-col items-center text-center py-6">
              <div className="h-14 w-14 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-1">¡Artículo generado!</h3>
              <p className="text-sm text-text-muted mb-1 max-w-xs">
                <span className="text-white font-medium">{data.article.title}</span>
              </p>
              <p className="text-xs text-text-muted mb-5">
                {data.metrics.tokensInput + data.metrics.tokensOutput} tokens · ${data.metrics.costUsd.toFixed(4)} · {(data.metrics.durationMs / 1000).toFixed(1)}s
              </p>
              <div className="flex gap-2 w-full">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    onSuccess?.(data.article.id);
                    onClose();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Ver artículo
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="relative mb-5">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400/20 via-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-indigo-300 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 animate-ping" />
              </div>
              <p className="font-semibold mb-1">Generando artículo</p>
              <p className="text-sm text-text-muted min-h-[20px]">
                {TIPS_DURING_LOADING[tipIndex]}
              </p>
              <p className="text-xs text-text-muted mt-4">
                Tarda 15-30 segundos. No cierres esta ventana.
              </p>
            </div>
          )}

          {/* FORM STATE */}
          {!isLoading && !data && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Topic */}
              <div>
                <label htmlFor="topic" className="block text-xs font-medium text-text-muted mb-1.5">
                  Tema del artículo
                </label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ej: Apple presenta el chip M5 Pro con NPU dedicada de 50 TOPS y mejoras en eficiencia energética"
                  rows={3}
                  required
                  minLength={5}
                  maxLength={500}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Cuanto más específico, mejor el resultado. {topic.length}/500
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Categoría
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setCategory(cat.slug)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                        category === cat.slug
                          ? 'bg-primary/15 border-primary text-white'
                          : 'bg-bg border-border text-text-muted hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {apiError && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{apiError.message ?? 'Error al generar el artículo'}</span>
                </div>
              )}

              {/* Hint */}
              <div className="rounded-lg bg-bg-soft border border-border px-3 py-2.5 text-xs text-text-muted">
                💡 El artículo se creará como <span className="text-white font-medium">borrador</span>.
                Revísalo y cambia su estado a Publicado cuando estés conforme.
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={topic.trim().length < 5}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateArticleModal;
