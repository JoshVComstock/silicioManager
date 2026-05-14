import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ScrollText,
  Users,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/articles', label: 'Artículos', icon: FileText },
  { to: '/admin/logs', label: 'Logs del agente', icon: ScrollText },
  { to: '/admin/users', label: 'Usuarios', icon: Users },
  { to: '/admin/settings', label: 'Ajustes', icon: Settings },
];

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 bg-bg-soft border-r border-border flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">Silicio</p>
            <p className="text-[11px] text-text-muted leading-tight">Panel admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/15 text-white'
                  : 'text-text-muted hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User block */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0) ?? 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => {
            void logout();
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-text-muted hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
