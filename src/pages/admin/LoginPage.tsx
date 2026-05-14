import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Zap, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LocationState {
  from?: { pathname: string };
}

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as LocationState)?.from?.pathname ?? '/admin';

  const [email, setEmail] = useState('admin@silicio.tech');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={from} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok) {
      navigate(from, { replace: true });
    } else {
      setError(result.error ?? 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute top-1/4 -left-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 -right-20 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl animate-blob" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Zap className="h-5 w-5 text-white" fill="currentColor" />
          </div>
          <span className="text-xl font-bold">Silicio</span>
        </div>

        {/* Card */}
        <div className="bg-surface/80 backdrop-blur border border-border rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Panel administrativo</h1>
            <p className="text-sm text-text-muted mt-1.5">
              Inicia sesión para gestionar el contenido y los logs del agente.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-text-muted mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-indigo-500/30"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
