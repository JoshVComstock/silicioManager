import PageHeader from '../../components/admin/PageHeader';

interface FieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
}

const Field = ({ label, hint, children }: FieldProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5 border-b border-border last:border-0">
    <div className="sm:col-span-1">
      <p className="text-sm font-medium">{label}</p>
      {hint && <p className="text-xs text-text-muted mt-0.5">{hint}</p>}
    </div>
    <div className="sm:col-span-2">{children}</div>
  </div>
);

const inputCls =
  'w-full px-3 py-2 rounded-lg bg-bg border border-border text-sm focus:outline-none focus:border-primary transition-colors';

const SettingsPage = () => (
  <>
    <PageHeader title="Ajustes" description="Configuración general del sitio y del agente IA." />

    {/* Site settings */}
    <section className="bg-surface border border-border rounded-xl px-6 mb-6">
      <div className="py-4 border-b border-border">
        <h2 className="font-semibold">Sitio</h2>
        <p className="text-xs text-text-muted mt-0.5">Información pública del medio.</p>
      </div>

      <Field label="Nombre del sitio">
        <input type="text" className={inputCls} defaultValue="Silicio" />
      </Field>

      <Field label="URL pública">
        <input type="url" className={inputCls} defaultValue="https://silicio.tech" />
      </Field>

      <Field label="Email de contacto">
        <input type="email" className={inputCls} defaultValue="hola@silicio.tech" />
      </Field>
    </section>

    {/* Agent settings */}
    <section className="bg-surface border border-border rounded-xl px-6 mb-6">
      <div className="py-4 border-b border-border">
        <h2 className="font-semibold">Agente IA</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Configuración del agente generador de contenido.
        </p>
      </div>

      <Field label="Modelo" hint="Modelo Claude usado para generación.">
        <select className={inputCls} defaultValue="claude-sonnet-4-6">
          <option value="claude-opus-4-7">Claude Opus 4.7</option>
          <option value="claude-sonnet-4-6">Claude Sonnet 4.6</option>
          <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option>
        </select>
      </Field>

      <Field label="Artículos por día" hint="Cuántos artículos genera el agente al día.">
        <input type="number" min={1} max={20} className={inputCls} defaultValue={4} />
      </Field>

      <Field label="Auto-publicar" hint="Si está activo, los artículos se publican sin revisión.">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="h-4 w-4 accent-indigo-500" defaultChecked={false} />
          <span className="text-sm">Activar publicación automática</span>
        </label>
      </Field>
    </section>

    <div className="flex justify-end gap-2">
      <button className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer">
        Cancelar
      </button>
      <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
        Guardar cambios
      </button>
    </div>
  </>
);

export default SettingsPage;
