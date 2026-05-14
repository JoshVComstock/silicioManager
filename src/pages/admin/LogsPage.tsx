import { Sparkles } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';

const LogsPage = () => (
  <>
    <PageHeader
      title="Logs del agente"
      description="Trazabilidad de las ejecuciones del agente generador de contenido."
    />

    <div className="flex flex-col items-center justify-center py-24 text-center gap-3 text-text-muted">
      <Sparkles className="h-8 w-8 opacity-30" />
      <p className="font-medium">Sin logs por el momento</p>
      <p className="text-sm max-w-sm">
        Los logs aparecerán aquí cuando el agente generador de contenido esté activo.
      </p>
    </div>
  </>
);

export default LogsPage;
