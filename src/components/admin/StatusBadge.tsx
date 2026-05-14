import type { ArticleStatus, LogLevel, UserRole } from '../../types/admin';

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
