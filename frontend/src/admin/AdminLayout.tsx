import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar from './components/AdminTopbar';
import { useAdminStore } from './store/adminStore';
import './admin.css';

export default function AdminLayout() {
  const sidebarOpen = useAdminStore((s) => s.sidebarOpen);
  const adminUser   = useAdminStore((s) => s.adminUser);

  // Guard: only ADMIN and SUPER_ADMIN can access this layout
  if (!adminUser) return <Navigate to="/admin/login" replace />;
  if (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
    // Redirect non-admins back to login
    return <Navigate to="/admin/login" replace />;
  }

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
