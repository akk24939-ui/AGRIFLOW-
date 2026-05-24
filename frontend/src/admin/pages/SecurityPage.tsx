import { useState, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { ShieldAlert, Search, Monitor, Globe, RefreshCw } from 'lucide-react';

export default function SecurityPage() {
  const { loginLogs, fetchLoginLogs } = useAdminStore();
  const [filter, setFilter] = useState<'ALL'|'SUCCESS'|'FAILED'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLoginLogs(); }, []);

  const filtered = loginLogs.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || (l.user_id || '').toLowerCase().includes(q) || (l.ip_address || '').includes(q);
    const matchF  = filter === 'ALL' || l.login_status === filter;
    return matchQ && matchF;
  });

  const failed  = loginLogs.filter(l => l.login_status === 'FAILED').length;
  const success = loginLogs.filter(l => l.login_status === 'SUCCESS').length;

  return (
    <div style={{ padding: '1.5rem', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Login Security Monitor</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Track login attempts, devices, IPs and suspicious activity</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><ShieldAlert size={14}/> {failed} Failed Attempts</span>
          <button onClick={() => fetchLoginLogs()} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Logs',       value: loginLogs.length, color: '#38bdf8' },
          { label: 'Successful Logins',value: success,          color: '#22c55e' },
          { label: 'Failed Logins',    value: failed,           color: '#f87171' },
          { label: 'Unique IPs',       value: new Set(loginLogs.map(l=>l.ip_address).filter(Boolean)).size, color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '1.25rem', flex: '1 1 140px' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 0.75rem', flex: 1, minWidth: 200 }}>
          <Search size={15} color="#64748b" />
          <input placeholder="Search User ID or IP address…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', color: '#f1f5f9', padding: '0.6rem 0.5rem', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
        </div>
        {(['ALL','SUCCESS','FAILED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.6rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: filter === f ? 'linear-gradient(135deg,#38bdf8,#0284c7)' : 'rgba(255,255,255,0.05)', color: filter === f ? '#fff' : '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>{['User ID', 'Login Time', 'IP Address', 'User Agent', 'Status', 'Reason'].map(h => <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No logs found</td></tr>
            ) : filtered.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#f1f5f9', fontFamily: 'monospace' }}>{l.user_id || 'System'}</td>
                <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{l.login_time ? new Date(l.login_time).toLocaleString() : '—'}</td>
                <td style={{ padding: '0.75rem 1rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={12} color="#64748b"/><span style={{ fontFamily: 'monospace', color: '#38bdf8' }}>{l.ip_address || '—'}</span></div></td>
                <td style={{ padding: '0.75rem 1rem', color: '#64748b', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Monitor size={12}/> {l.user_agent || '—'}</div></td>
                <td style={{ padding: '0.75rem 1rem' }}><span style={{ color: l.login_status === 'SUCCESS' ? '#4ade80' : '#f87171', background: l.login_status === 'SUCCESS' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{l.login_status}</span></td>
                <td style={{ padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.8rem' }}>{l.failed_reason || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
