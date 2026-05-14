import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  accent?: 'cyan' | 'indigo' | 'purple' | 'green' | 'red';
}

const ACCENT = {
  cyan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-300',
  indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-300',
  purple: 'from-purple-500/20 to-purple-500/5 text-purple-300',
  green: 'from-emerald-500/20 to-emerald-500/5 text-emerald-300',
  red: 'from-red-500/20 to-red-500/5 text-red-300',
};

const StatCard = ({ label, value, icon: Icon, trend, accent = 'indigo' }: StatCardProps) => (
  <div className="bg-surface border border-border rounded-xl p-5">
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</p>
      <div
        className={`h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center ${ACCENT[accent]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className="text-2xl font-bold tracking-tight">{value}</p>
    {trend && (
      <p
        className={`text-xs mt-2 flex items-center gap-1 ${
          trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
        }`}
      >
        {trend.value >= 0 ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {trend.value >= 0 ? '+' : ''}
        {trend.value}% <span className="text-text-muted">{trend.label}</span>
      </p>
    )}
  </div>
);

export default StatCard;
