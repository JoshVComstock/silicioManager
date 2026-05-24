import { useEffect, useState, type FormEvent } from 'react';
import { Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAddTopicMutation } from '../../features/agent/topicsApiSlice';
import type { ArticleType } from '../../features/agent/topicsApiSlice';
import type { CategorySlug } from '../../services/api/articles.api';

interface Props {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES: { slug: CategorySlug; label: string; emoji: string }[] = [
  { slug: 'ia', label: 'IA', emoji: '🤖' },
  { slug: 'ciencia', label: 'Ciencia', emoji: '🔬' },
  { slug: 'seguridad', label: 'Seguridad', emoji: '🛡️' },
  { slug: 'tecnologia', label: 'Tecnología', emoji: '💻' },
];

const TYPES: { value: ArticleType; label: string; desc: string }[] = [
  { value: 'NEWS', label: 'Noticia', desc: 'Datos frescos con Google Search' },
  { value: 'TUTORIAL', label: 'Tutorial', desc: 'Paso a paso accionable' },
  { value: 'GUIDE', label: 'Guía', desc: 'Para principiantes' },
  { value: 'COMPARISON', label: 'Comparativa', desc: 'X vs Y vs Z' },
  { value: 'TIPS', label: 'Tips', desc: 'Lista de consejos' },
  { value: 'DEEP_DIVE', label: 'Análisis', desc: 'Profundización técnica' },
];

const AddTopicModal = ({ open, onClose }: Props) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<CategorySlug>('ia');
  const [articleType, setArticleType] = useState<ArticleType>('NEWS');
  const [priority, setPriority] = useState(5);

  const [addTopic, { isLoading, error, data, reset }] = useAddTopicMutation();

  useEffect(() => {
    if (!open) {
      setTopic('');
      setCategory('ia');
      setArticleType('NEWS');
      setPriority(5);
      reset();
    }
  }, [open, reset]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (topic.trim().length < 5) return;
    await addTopic({ topic: topic.trim(), category, articleType, priority });
  };

  const apiError = error as { message?: string } | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-indigo-500/10 to-purple-500/10 sticky top-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 flex items-center justify-center">
              <Plus className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Añadir tema a la cola</h2>
              <p className="text-xs text-text-muted">El agente lo procesará automáticamente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer disabled:opacity-30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {data ? (
            <div className="flex flex-col items-center text-center py-6">
              <div className="h-14 w-14 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold mb-1">¡Tema añadido a la cola!</h3>
              <p className="text-sm text-text-muted mb-5">
                Se procesará en el próximo ciclo del cron o cuando lo dispares manualmente.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          ) : (
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
                  placeholder="Ej: Cómo usar Claude para estudiar mejor: 7 técnicas probadas"
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

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Tipo de artículo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setArticleType(t.value)}
                      className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        articleType === t.value
                          ? 'bg-primary/15 border-primary text-white'
                          : 'bg-bg border-border text-text-muted hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-medium">{t.label}</span>
                      <span className="text-[10px] opacity-70">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">
                  Categoría
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => setCategory(cat.slug)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                        category === cat.slug
                          ? 'bg-primary/15 border-primary text-white'
                          : 'bg-bg border-border text-text-muted hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="flex items-center justify-between text-xs font-medium text-text-muted mb-1.5">
                  <span>Prioridad (1-10)</span>
                  <span className="text-white font-bold">{priority}</span>
                </label>
                <input
                  id="priority"
                  type="range"
                  min={1}
                  max={10}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-text-muted mt-1">
                  <span>baja</span>
                  <span>media</span>
                  <span>alta (procesa antes)</span>
                </div>
              </div>

              {apiError && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{apiError.message ?? 'Error al añadir el tema'}</span>
                </div>
              )}

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
                  disabled={topic.trim().length < 5 || isLoading}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isLoading ? 'Añadiendo…' : 'Añadir a la cola'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddTopicModal;
