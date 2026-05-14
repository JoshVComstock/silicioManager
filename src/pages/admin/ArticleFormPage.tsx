import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  useGetArticleByIdQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
} from '../../features/articles/articlesApiSlice';
import { useAuth } from '../../context/AuthContext';
import type {
  CategorySlug,
  ArticleStatus,
  Faq,
  CreateArticleInput,
} from '../../services/api/articles.api';

// ── helpers ────────────────────────────────────────────────────────────────

const toSlug = (title: string) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);

// datetime-local input expects "YYYY-MM-DDTHH:MM"
const toDatetimeLocal = (iso: string | null | undefined): string => {
  if (!iso) return '';
  return iso.slice(0, 16);
};

const toIso = (local: string): string | null => {
  if (!local) return null;
  return new Date(local).toISOString();
};

// ── types ─────────────────────────────────────────────────────────────────

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: CategorySlug;
  tags: string[];
  series: string;
  status: ArticleStatus;
  featured: boolean;
  featuredImage: string;
  featuredImageAlt: string;
  publishedAt: string;
  scheduledAt: string;
  faqs: Faq[];
}

const EMPTY_FORM: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  category: 'ia',
  tags: [],
  series: '',
  status: 'DRAFT',
  featured: false,
  featuredImage: '',
  featuredImageAlt: '',
  publishedAt: '',
  scheduledAt: '',
  faqs: [],
};

const CATEGORIES: { value: CategorySlug; label: string }[] = [
  { value: 'ia', label: 'Inteligencia Artificial' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'ciencia', label: 'Ciencia' },
  { value: 'seguridad', label: 'Seguridad' },
];

const STATUSES: { value: ArticleStatus; label: string; color: string }[] = [
  { value: 'DRAFT', label: 'Borrador', color: 'text-text-muted' },
  { value: 'PUBLISHED', label: 'Publicado', color: 'text-green-400' },
  { value: 'SCHEDULED', label: 'Programado', color: 'text-yellow-400' },
  { value: 'ARCHIVED', label: 'Archivado', color: 'text-text-muted' },
];

// ── shared input styles ────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-surface border border-border text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted';

const labelCls = 'block text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5';

// ── component ─────────────────────────────────────────────────────────────

const ArticleFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [tagInput, setTagInput] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── fetch existing article in edit mode ──────────────────────────────────
  const { data: existing, isLoading: loadingArticle } = useGetArticleByIdQuery(id!, {
    skip: !isEdit,
  });

  useEffect(() => {
    if (!existing?.article) return;
    const a = existing.article;
    setForm({
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt,
      body: a.body,
      category: a.category,
      tags: a.tags,
      series: a.series ?? '',
      status: a.status,
      featured: a.featured,
      featuredImage: a.featuredImage,
      featuredImageAlt: a.featuredImageAlt,
      publishedAt: toDatetimeLocal(a.publishedAt),
      scheduledAt: toDatetimeLocal(a.scheduledAt),
      faqs: a.faqs ?? [],
    });
    setSlugManual(true);
  }, [existing]);

  // ── auto-slug from title ─────────────────────────────────────────────────
  const prevTitle = useRef('');
  useEffect(() => {
    if (slugManual || form.title === prevTitle.current) return;
    prevTitle.current = form.title;
    setForm((f) => ({ ...f, slug: toSlug(f.title) }));
  }, [form.title, slugManual]);

  // ── submit ────────────────────────────────────────────────────────────────
  const [createArticle, { isLoading: creating, error: createError }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: updating, error: updateError }] = useUpdateArticleMutation();

  const saving = creating || updating;
  const saveError = (isEdit ? updateError : createError) as { message?: string } | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateArticleInput = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim(),
      body: form.body.trim(),
      category: form.category,
      tags: form.tags,
      series: form.series.trim() || null,
      status: form.status,
      featured: form.featured,
      featuredImage: form.featuredImage.trim(),
      featuredImageAlt: form.featuredImageAlt.trim(),
      faqs: form.faqs.length > 0 ? form.faqs : null,
      publishedAt: toIso(form.publishedAt),
      scheduledAt: toIso(form.scheduledAt),
    };

    if (payload.status === 'PUBLISHED' && !payload.publishedAt) {
      payload.publishedAt = new Date().toISOString();
    }

    const result = isEdit
      ? await updateArticle({ id: id!, body: payload })
      : await createArticle(payload);

    if (!('error' in result)) {
      setSaved(true);
      setTimeout(() => navigate('/admin/articles'), 1000);
    }
  };

  // ── tag helpers ───────────────────────────────────────────────────────────
  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tag || form.tags.includes(tag) || form.tags.length >= 8) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
    setTagInput('');
  };

  const removeTag = (t: string) =>
    setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
      removeTag(form.tags[form.tags.length - 1]);
    }
  };

  // ── faq helpers ───────────────────────────────────────────────────────────
  const addFaq = () =>
    setForm((f) => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }));

  const updateFaq = (i: number, field: keyof Faq, value: string) =>
    setForm((f) => {
      const faqs = [...f.faqs];
      faqs[i] = { ...faqs[i], [field]: value };
      return { ...f, faqs };
    });

  const removeFaq = (i: number) =>
    setForm((f) => ({ ...f, faqs: f.faqs.filter((_, idx) => idx !== i) }));

  // ── field helper ──────────────────────────────────────────────────────────
  const set = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value =
      e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (field === 'slug') setSlugManual(true);
  };

  // ── render ─────────────────────────────────────────────────────────────────
  if (isEdit && loadingArticle) {
    return (
      <div className="flex items-center justify-center py-32 text-text-muted">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Cargando artículo…
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="pb-16">
      {/* ── page header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-border text-text-muted hover:text-white hover:border-white/30 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold">
              {isEdit ? 'Editar artículo' : 'Nuevo artículo'}
            </h1>
            {isEdit && (
              <p className="text-xs text-text-muted font-mono mt-0.5">/{form.category}/{form.slug}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/articles')}
            className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:text-white hover:border-white/30 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || saved}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {saved ? (
              <><CheckCircle2 className="h-4 w-4" /> Guardado</>
            ) : saving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
            ) : (
              isEdit ? 'Actualizar' : 'Publicar'
            )}
          </button>
        </div>
      </div>

      {/* ── error banner ──────────────────────────────────────────────── */}
      {saveError && (
        <div className="flex items-start gap-2 px-4 py-3 mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">No se pudo guardar</p>
            <p className="text-xs text-red-300/80 mt-0.5">{saveError.message ?? 'Error desconocido'}</p>
          </div>
        </div>
      )}

      {/* ── two-column layout ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

        {/* ── LEFT: main content ──────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Title */}
          <div>
            <label className={labelCls}>Título *</label>
            <input
              required
              value={form.title}
              onChange={set('title')}
              placeholder="El mejor artículo sobre IA…"
              className={`${inputCls} text-base`}
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelCls}>
              Slug *
              {!slugManual && (
                <span className="ml-2 text-primary normal-case font-normal">auto</span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                required
                value={form.slug}
                onChange={set('slug')}
                placeholder="mi-articulo-sobre-ia"
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                title="Solo minúsculas, números y guiones"
                className={`${inputCls} font-mono`}
              />
              {slugManual && (
                <button
                  type="button"
                  onClick={() => { setSlugManual(false); setForm((f) => ({ ...f, slug: toSlug(f.title) })); }}
                  className="px-3 py-2 rounded-lg border border-border text-xs text-text-muted hover:text-white hover:border-white/30 transition-colors whitespace-nowrap"
                >
                  Regenerar
                </button>
              )}
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className={labelCls}>
              Resumen *
              <span className="ml-1 normal-case font-normal text-text-muted">
                ({form.excerpt.length}/500)
              </span>
            </label>
            <textarea
              required
              rows={3}
              value={form.excerpt}
              onChange={set('excerpt')}
              maxLength={500}
              placeholder="Un párrafo que describe el artículo. Aparece en tarjetas y metadatos SEO."
              className={inputCls}
            />
          </div>

          {/* Body */}
          <div>
            <label className={labelCls}>Cuerpo (Markdown) *</label>
            <textarea
              required
              rows={24}
              value={form.body}
              onChange={set('body')}
              placeholder={`## Introducción\n\nEscribe el artículo en Markdown...\n\n## Sección 1\n\nContenido...`}
              className={`${inputCls} font-mono text-xs leading-relaxed resize-y`}
            />
          </div>

          {/* FAQs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`${labelCls} mb-0`}>Preguntas frecuentes</label>
              <button
                type="button"
                onClick={addFaq}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Añadir
              </button>
            </div>
            {form.faqs.length === 0 ? (
              <p className="text-xs text-text-muted py-3">No hay FAQs todavía.</p>
            ) : (
              <div className="space-y-3">
                {form.faqs.map((faq, i) => (
                  <div key={i} className="rounded-lg border border-border bg-surface p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        FAQ {i + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(i)}
                        className="text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      value={faq.question}
                      onChange={(e) => updateFaq(i, 'question', e.target.value)}
                      placeholder="¿Cuál es la pregunta?"
                      className={inputCls}
                    />
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                      placeholder="La respuesta completa…"
                      className={inputCls}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: metadata sidebar ─────────────────────────────────── */}
        <div className="space-y-5">

          {/* Status */}
          <div className="rounded-xl border border-border bg-surface/50 p-4 space-y-4">
            <div>
              <label className={labelCls}>Estado</label>
              <select value={form.status} onChange={set('status')} className={inputCls}>
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Published at */}
            <div>
              <label className={labelCls}>Fecha de publicación</label>
              <input
                type="datetime-local"
                value={form.publishedAt}
                onChange={set('publishedAt')}
                className={inputCls}
              />
              <p className="text-xs text-text-muted mt-1">
                Si está vacío y publicas, se usa la fecha actual.
              </p>
            </div>

            {/* Scheduled at */}
            {form.status === 'SCHEDULED' && (
              <div>
                <label className={labelCls}>Publicar automáticamente el</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={set('scheduledAt')}
                  className={inputCls}
                />
                <p className="text-xs text-text-muted mt-1">
                  El artículo aparecerá en el blog cuando llegue esta fecha.
                </p>
              </div>
            )}

            {/* Featured */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={set('featured')}
                className="h-4 w-4 rounded accent-primary"
              />
              <span className="text-sm text-white">Destacado en portada</span>
            </label>
          </div>

          {/* Category */}
          <div>
            <label className={labelCls}>Categoría *</label>
            <select required value={form.category} onChange={set('category')} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className={labelCls}>
              Tags *
              <span className="ml-1 normal-case font-normal text-text-muted">
                ({form.tags.length}/8) · Enter o coma para añadir
              </span>
            </label>
            <div className="rounded-lg border border-border bg-surface p-2 min-h-[42px] flex flex-wrap gap-1.5">
              {form.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/15 text-primary border border-primary/25"
                >
                  #{t}
                  <button type="button" onClick={() => removeTag(t)} className="hover:text-red-400">
                    ×
                  </button>
                </span>
              ))}
              {form.tags.length < 8 && (
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={() => tagInput && addTag(tagInput)}
                  placeholder={form.tags.length === 0 ? 'ia, openai, llm…' : ''}
                  className="flex-1 min-w-[80px] bg-transparent text-xs text-white outline-none placeholder:text-text-muted"
                />
              )}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className={labelCls}>Imagen principal *</label>
            <input
              required
              type="url"
              value={form.featuredImage}
              onChange={set('featuredImage')}
              placeholder="https://images.unsplash.com/…"
              className={inputCls}
            />
            {form.featuredImage && (
              <img
                src={form.featuredImage}
                alt="preview"
                className="mt-2 w-full aspect-video object-cover rounded-lg border border-border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>

          <div>
            <label className={labelCls}>Alt de imagen *</label>
            <input
              required
              value={form.featuredImageAlt}
              onChange={set('featuredImageAlt')}
              placeholder="Descripción de la imagen para accesibilidad"
              className={inputCls}
            />
          </div>

          {/* Series */}
          <div>
            <label className={labelCls}>Serie <span className="normal-case font-normal">(opcional)</span></label>
            <input
              value={form.series}
              onChange={set('series')}
              placeholder="ej. Guía de LLMs"
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default ArticleFormPage;
