import type { ArticleStatus, LogLevel, UserRole } from '../../types/admin';
import type {
  ArticleType,
  TopicSource,
  TopicStatus,
} from '../../features/agent/topicsApiSlice';

const ARTICLE_STYLES: Record<ArticleStatus, { label: string; cls: string }> = {
  published: { label: 'Publicado', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  draft: { label: 'Borrador', cls: 'bg-white/5 text-text-muted border-white/10' },
  scheduled: { label: 'Programado', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  archived: { label: 'Archivado', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' },
};

const LOG_STYLES: Record<LogLevel, { label: string; cls: string }> = {
  info: { label: 'Info', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  success: { label: 'OK', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  warning: { label: 'Warning', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  error: { label: 'Error', cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

const ROLE_STYLES: Record<UserRole, { label: string; cls: string }> = {
  admin: { label: 'Admin', cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  editor: { label: 'Editor', cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  viewer: { label: 'Viewer', cls: 'bg-white/5 text-text-muted border-white/10' },
};

const baseCls = 'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border';

export const ArticleStatusBadge = ({ status }: { status: ArticleStatus }) => {
  const s = ARTICLE_STYLES[status];
  return <span className={`${baseCls} ${s.cls}`}>{s.label}</span>;
};

export const LogLevelBadge = ({ level }: { level: LogLevel }) => {
  const s = LOG_STYLES[level];
  return <span className={`${baseCls} ${s.cls}`}>{s.label}</span>;
};

export const UserRoleBadge = ({ role }: { role: UserRole }) => {
  const s = ROLE_STYLES[role];
  return <span className={`${baseCls} ${s.cls}`}>{s.label}</span>;
};

// ── Topic Queue badges ──────────────────────────────────────────────

const TOPIC_STATUS_STYLES: Record<TopicStatus, { label: string; cls: string }> = {
  PENDING: { label: 'En cola', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  PROCESSING: { label: 'Generando', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse' },
  DONE: { label: 'Generado', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  FAILED: { label: 'Fallido', cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
  SKIPPED: { label: 'Saltado', cls: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' },
};

const ARTICLE_TYPE_STYLES: Record<ArticleType, { label: string; cls: string }> = {
  NEWS: { label: 'Noticia', cls: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
  TUTORIAL: { label: 'Tutorial', cls: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  GUIDE: { label: 'Guía', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  COMPARISON: { label: 'Comparativa', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  TIPS: { label: 'Tips', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  DEEP_DIVE: { label: 'Análisis', cls: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
};

const TOPIC_SOURCE_STYLES: Record<TopicSource, { label: string; cls: string }> = {
  MANUAL: { label: 'Manual', cls: 'bg-white/5 text-text-muted border-white/10' },
  AI_DISCOVERY: { label: 'IA', cls: 'bg-gradient-to-r from-cyan-500/15 to-purple-500/15 text-cyan-300 border-cyan-500/30' },
};

export const TopicStatusBadge = ({ status }: { status: TopicStatus }) => {
  const s = TOPIC_STATUS_STYLES[status];
  return <span className={`${baseCls} ${s.cls}`}>{s.label}</span>;
};

export const ArticleTypeBadge = ({ type }: { type: ArticleType }) => {
  const s = ARTICLE_TYPE_STYLES[type];
  return <span className={`${baseCls} ${s.cls}`}>{s.label}</span>;
};

export const TopicSourceBadge = ({ source }: { source: TopicSource }) => {
  const s = TOPIC_SOURCE_STYLES[source];
  return <span className={`${baseCls} ${s.cls}`}>{s.label}</span>;
};
