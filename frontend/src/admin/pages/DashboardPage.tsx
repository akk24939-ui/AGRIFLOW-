import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Users, MapPin, ClipboardList, AlertTriangle, Activity, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { stats, fetchStats, adminUser, fetchLoginLogs, loginLogs } = useAdminStore();

  useEffect(() => {
    fetchStats();
    fetchLoginLogs('limit=5');
  }, []);

  const cards = stats ? [
    { label: 'Total Users',     value: stats.total_users,     icon: Users,          color: '#38bdf8', sub: `${stats.total_admins} admins` },
    { label: 'Owners',          value: stats.total_owners,    icon: TrendingUp,     color: '#22c55e', sub: `${stats.total_agents} agents` },
    { label: 'Customers',       value: stats.total_customers, icon: Activity,       color: '#a78bfa', sub: 'registered' },
    { label: 'Total Lands',     value: stats.total_lands,     icon: MapPin,         color: '#fb923c', sub: `${stats.active_lands} active` },
    { label: 'Total Tasks',     value: stats.total_tasks,     icon: ClipboardList,  color: '#4ade80', sub: `${stats.pending_tasks} pending` },
    { label: 'Completed Tasks', value: stats.completed_tasks, icon: CheckCircle2,   color: '#22c55e', sub: 'done' },
    { label: 'Failed Logins',   value: stats.failed_logins,   icon: ShieldAlert,    color: '#f87171', sub: 'total attempts' },
    { label: 'Audit Events',    value: stats.total_audit,     icon: AlertTriangle,  color: '#fbbf24', sub: 'tracked' },
  ] : [];

  return (
    <div style={{ padding:'1.5rem', fontFamily:"'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ color:'#f1f5f9', fontSize:'1.5rem', fontWeight:700, margin:0 }}>
          Welcome back, {adminUser?.name?.split(' ')[0] || 'Admin'} 👋
        </h1>
        <p style={{ color:'#64748b', marginTop:4, fontSize:'0.88rem' }}>
          AgriFlow Enterprise Dashboard · Real-time from PostgreSQL
        </p>
      </div>

      {/* Stats Grid */}
      {!stats ? (
        <div style={{ color:'#64748b', fontSize:'0.9rem', padding:'2rem', textAlign:'center' }}>
          Loading dashboard…
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {cards.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} style={{
              background:'rgba(15,25,35,0.9)', border:'1px solid rgba(255,255,255,0.06)',
              borderRadius:12, padding:'1.25rem', position:'relative', overflow:'hidden',
            }}>
              <div style={{ position:'absolute', top:0, right:0, width:60, height:60, borderRadius:'0 12px 0 60px', background:`${color}15` }}/>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${color}20`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={15} color={color} strokeWidth={2.5}/>
                </div>
                <span style={{ color:'#94a3b8', fontSize:'0.78rem', fontWeight:500 }}>{label}</span>
              </div>
              <div style={{ color:'#f1f5f9', fontSize:'2rem', fontWeight:800, lineHeight:1 }}>{value}</div>
              <div style={{ color:'#475569', fontSize:'0.72rem', marginTop:4 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Login Logs */}
      <div style={{ background:'rgba(15,25,35,0.9)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'1.25rem' }}>
        <h2 style={{ color:'#f1f5f9', fontSize:'1rem', fontWeight:600, margin:'0 0 1rem' }}>Recent Login Activity</h2>
        {loginLogs.length === 0 ? (
          <p style={{ color:'#475569', fontSize:'0.85rem' }}>No login logs yet.</p>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.83rem' }}>
            <thead>
              <tr>
                {['Status','IP Address','User Agent','Time'].map(h => (
                  <th key={h} style={{ color:'#64748b', textAlign:'left', padding:'0.4rem 0.75rem', fontWeight:500, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loginLogs.slice(0,5).map(log => (
                <tr key={log.id}>
                  <td style={{ padding:'0.5rem 0.75rem' }}>
                    <span style={{
                      display:'inline-block', padding:'2px 8px', borderRadius:20, fontSize:'0.72rem', fontWeight:600,
                      background: log.login_status==='SUCCESS' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                      color:       log.login_status==='SUCCESS' ? '#4ade80' : '#f87171',
                    }}>
                      {log.login_status}
                    </span>
                  </td>
                  <td style={{ color:'#94a3b8', padding:'0.5rem 0.75rem' }}>{log.ip_address || '—'}</td>
                  <td style={{ color:'#64748b', padding:'0.5rem 0.75rem', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {log.user_agent?.substring(0,40) || '—'}
                  </td>
                  <td style={{ color:'#64748b', padding:'0.5rem 0.75rem', whiteSpace:'nowrap' }}>
                    {log.login_time ? new Date(log.login_time).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
