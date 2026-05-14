import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => (
  <div className="flex min-h-screen bg-bg">
    <Sidebar />
    <main className="flex-1 min-w-0">
      <div className="px-6 lg:px-10 py-8 max-w-7xl">
        <Outlet />
      </div>
    </main>
  </div>
);

export default AdminLayout;
