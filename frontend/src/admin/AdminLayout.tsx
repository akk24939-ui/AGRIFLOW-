import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import { useAdminStore } from './store/adminStore';
import './admin.css';

export default function AdminLayout() {
  const sidebarOpen = useAdminStore((s) => s.sidebarOpen);
  return (
    <div className={`admin-shell ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <AdminSidebar />
      <div className="admin-main">
        <AdminTopbar />
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
