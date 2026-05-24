import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, MapPin, ClipboardList,
  BarChart3, Shield, FileText, Settings, LogOut,
  ChevronLeft, ChevronRight, Leaf,
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';
import { showToast } from './ToastContainer';

const NAV_ITEMS = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users',      icon: Users,           label: 'Users' },
  { to: '/admin/customers',  icon: Users,           label: 'Customers' },
  { to: '/admin/lands',      icon: MapPin,          label: 'Lands' },
  { to: '/admin/tasks',      icon: ClipboardList,   label: 'Tasks' },
  { to: '/admin/reports',    icon: BarChart3,       label: 'Reports' },
  { to: '/admin/security',   icon: Shield,          label: 'Security' },
  { to: '/admin/audit',      icon: FileText,        label: 'Audit Logs' },
  { to: '/admin/settings',   icon: Settings,        label: 'Settings' },
];

export default function AdminSidebar() {
  const navigate      = useNavigate();
  const adminUser     = useAdminStore(s => s.adminUser);
  const sidebarOpen   = useAdminStore(s => s.sidebarOpen);
  const setSidebarOpen= useAdminStore(s => s.setSidebarOpen);
  const logout        = useAdminStore(s => s.logout);

  const handleLogout = async () => {
    await logout();
    showToast('Logged out successfully', 'info');
    navigate('/admin/login');
  };

  const roleColor = (role: string) => {
    const map: Record<string,string> = {
      SUPER_ADMIN: '#f59e0b', ADMIN: '#22c55e',
      OWNER: '#38bdf8', AGENT: '#a78bfa', CUSTOMER: '#fb923c',
    };
    return map[role] || '#94a3b8';
  };

  return (
    <aside style={{
      width: sidebarOpen ? 240 : 68,
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f1923 0%, #0b1118 100%)',
      borderRight: '1px solid rgba(34,197,94,0.12)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease',
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
    }}>
      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title={sidebarOpen ? 'Collapse' : 'Expand'}
        style={{
          position:'absolute', top:18, right:-12, zIndex:10,
          width:24, height:24, borderRadius:'50%', border:'1px solid rgba(34,197,94,0.3)',
          background:'#0f1923', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          color:'#22c55e',
        }}
      >
        {sidebarOpen ? <ChevronLeft size={13}/> : <ChevronRight size={13}/>}
      </button>

      {/* Logo */}
      <div style={{ padding: sidebarOpen ? '1.25rem 1rem' : '1.25rem 0.75rem', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:34, height:34, borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Leaf size={16} color="#fff" strokeWidth={2.5}/>
        </div>
        {sidebarOpen && (
          <div>
            <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:'0.85rem', lineHeight:1.2 }}>AgriFlow</div>
            <div style={{ color:'#4ade80', fontSize:'0.65rem', fontWeight:500 }}>Enterprise Admin</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex:1, padding:'0.75rem 0.5rem', overflowY:'auto' }}>
        {NAV_ITEMS.filter(item => {
          if (!adminUser) return false;
          if (adminUser.role === 'AGENT') return ['Dashboard', 'Tasks'].includes(item.label);
          if (adminUser.role === 'OWNER') return ['Dashboard', 'Users', 'Lands', 'Tasks', 'Reports'].includes(item.label);
          return true;
        }).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:10,
              padding: sidebarOpen ? '0.6rem 0.75rem' : '0.6rem',
              borderRadius:8, marginBottom:2,
              textDecoration:'none',
              color: isActive ? '#22c55e' : '#94a3b8',
              background: isActive ? 'rgba(34,197,94,0.1)' : 'transparent',
              fontWeight: isActive ? 600 : 400,
              fontSize:'0.88rem',
              transition:'all 0.15s',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} color={isActive ? '#22c55e' : '#64748b'} strokeWidth={isActive ? 2.5 : 2}/>
                {sidebarOpen && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{ padding: sidebarOpen ? '0.75rem 1rem' : '0.75rem 0.5rem', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
        {sidebarOpen && adminUser && (
          <div style={{ marginBottom:'0.75rem', padding:'0.6rem 0.75rem', background:'rgba(255,255,255,0.03)', borderRadius:8 }}>
            <div style={{ color:'#e2e8f0', fontSize:'0.82rem', fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {adminUser.name}
            </div>
            <div style={{ color: roleColor(adminUser.role), fontSize:'0.7rem', fontWeight:500, marginTop:2 }}>
              {adminUser.role}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          style={{
            width:'100%', display:'flex', alignItems:'center', justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap:8, padding: sidebarOpen ? '0.6rem 0.75rem' : '0.6rem',
            borderRadius:8, border:'none', cursor:'pointer',
            background:'rgba(239,68,68,0.08)', color:'#f87171',
            fontSize:'0.88rem', fontWeight:500, transition:'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background='rgba(239,68,68,0.16)')}
          onMouseLeave={e => (e.currentTarget.style.background='rgba(239,68,68,0.08)')}
        >
          <LogOut size={16}/>
          {sidebarOpen && 'Logout'}
        </button>
      </div>
    </aside>
  );
}
