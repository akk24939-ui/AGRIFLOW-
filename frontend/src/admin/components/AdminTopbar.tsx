import { Bell, Search, Menu, Moon, Sun } from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

export default function AdminTopbar() {
  const { setSidebarOpen, sidebarOpen, adminUser, theme, toggleTheme } = useAdminStore();
  const now = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return (
    <header className="ag-topbar">
      <button className="ag-topbar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={20}/>
      </button>

      <div className="ag-topbar-search">
        <Search size={16} color="var(--text-muted)"/>
        <input placeholder="Search users, lands, logs…" />
      </div>

      <div className="ag-topbar-right">
        <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{now}</span>

        <button className="ag-topbar-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
          {theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
        </button>

        <button className="ag-topbar-btn">
          <Bell size={16}/>
          <span className="dot"/>
        </button>

        <div className="ag-admin-avatar" title={adminUser?.name}>
          {adminUser?.name?.[0] ?? 'A'}
        </div>
      </div>
    </header>
  );
}
