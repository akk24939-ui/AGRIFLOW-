import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { TrendingUp, CheckCircle2, AlertTriangle, Users, MapPin } from 'lucide-react';

export default function ReportsPage() {
  const { stats, fetchStats } = useAdminStore();

  useEffect(() => { fetchStats(); }, []);

  const completionRate = stats && stats.total_tasks > 0
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100) : 0;

  return (
    <div style={{ padding:'1.5rem', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ marginBottom:'1.5rem' }}>
        <h1 style={{ color:'#f1f5f9', fontSize:'1.4rem', fontWeight:700, margin:0 }}>Reports & Analytics</h1>
        <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:4 }}>Live data from PostgreSQL</p>
      </div>

      {!stats ? (
        <div style={{ color:'#64748b', textAlign:'center', padding:'2rem' }}>Loading reports…</div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
            {[
              { label:'Total Users',     value:stats.total_users,     icon:Users,        color:'#38bdf8' },
              { label:'Total Lands',     value:stats.total_lands,     icon:MapPin,       color:'#fb923c' },
              { label:'Task Completion', value:`${completionRate}%`,  icon:TrendingUp,   color:'#22c55e' },
              { label:'Failed Logins',   value:stats.failed_logins,   icon:AlertTriangle,color:'#f87171' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ background:'rgba(15,25,35,0.9)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <Icon size={16} color={color}/>
                  <span style={{ color:'#94a3b8', fontSize:'0.8rem' }}>{label}</span>
                </div>
                <div style={{ color:'#f1f5f9', fontSize:'2rem', fontWeight:800 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* User role breakdown */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={{ background:'rgba(15,25,35,0.9)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'1.25rem' }}>
              <h3 style={{ color:'#f1f5f9', fontSize:'1rem', fontWeight:600, margin:'0 0 1rem', display:'flex', alignItems:'center', gap:8 }}>
                <Users size={16} color="#38bdf8"/> User Role Breakdown
              </h3>
              {[
                { label:'Super Admin + Admin', value:stats.total_admins,    color:'#22c55e' },
                { label:'Owners',              value:stats.total_owners,    color:'#38bdf8' },
                { label:'Agents',              value:stats.total_agents,    color:'#a78bfa' },
                { label:'Customers',           value:stats.total_customers, color:'#fb923c' },
              ].map(({ label, value, color }) => {
                const pct = stats.total_users > 0 ? (value / stats.total_users) * 100 : 0;
                return (
                  <div key={label} style={{ marginBottom:'0.75rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ color:'#94a3b8', fontSize:'0.82rem' }}>{label}</span>
                      <span style={{ color:'#f1f5f9', fontSize:'0.82rem', fontWeight:600 }}>{value}</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.06)' }}>
                      <div style={{ height:'100%', borderRadius:3, background:color, width:`${pct}%`, transition:'width 0.5s ease' }}/>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ background:'rgba(15,25,35,0.9)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'1.25rem' }}>
              <h3 style={{ color:'#f1f5f9', fontSize:'1rem', fontWeight:600, margin:'0 0 1rem', display:'flex', alignItems:'center', gap:8 }}>
                <CheckCircle2 size={16} color="#22c55e"/> Task Status Breakdown
              </h3>
              {[
                { label:'Pending',     value:stats.pending_tasks,   color:'#fbbf24' },
                { label:'In Progress', value:stats.total_tasks - stats.pending_tasks - stats.completed_tasks, color:'#38bdf8' },
                { label:'Completed',   value:stats.completed_tasks, color:'#22c55e' },
              ].map(({ label, value, color }) => {
                const pct = stats.total_tasks > 0 ? (Math.max(0,value) / stats.total_tasks) * 100 : 0;
                return (
                  <div key={label} style={{ marginBottom:'0.75rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ color:'#94a3b8', fontSize:'0.82rem' }}>{label}</span>
                      <span style={{ color:'#f1f5f9', fontSize:'0.82rem', fontWeight:600 }}>{Math.max(0,value)}</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.06)' }}>
                      <div style={{ height:'100%', borderRadius:3, background:color, width:`${pct}%`, transition:'width 0.5s ease' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
