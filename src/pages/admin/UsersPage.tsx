import { Users } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader';

const UsersPage = () => (
  <>
    <PageHeader
      title="Usuarios"
      description="Gestiona los usuarios con acceso al panel administrativo."
    />

    <div className="flex flex-col items-center justify-center py-24 text-center gap-3 text-text-muted">
      <Users className="h-8 w-8 opacity-30" />
      <p className="font-medium">Gestión de usuarios próximamente</p>
      <p className="text-sm max-w-sm">
        El endpoint de usuarios admin está pendiente de implementar en el servidor.
      </p>
    </div>
  </>
);

export default UsersPage;
