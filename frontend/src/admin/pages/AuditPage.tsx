import { useState, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { FileText, Search, RefreshCw } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED:    '#22c55e',
  USER_DELETED:    '#f87171',
  USER_DISABLED:   '#fbbf24',
  PASSWORD_CHANGED:'#38bdf8',
  LAND_CREATED:    '#a78bfa',
};

export default function AuditPage() {
  const { auditLogs, fetchAuditLogs } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAuditLogs(); }, []);

  const filtered = auditLogs.filter(l => {
    const q = search.toLowerCase();
    return !q || l.action.toLowerCase().includes(q) || (l.target_user || '').toLowerCase().includes(q) || l.performed_by.toLowerCase().includes(q);
  });

  return (
    <div style={{ padding: '1.5rem', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Audit Logs</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Complete admin activity trail — immutable record</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ color: '#38bdf8', background: 'rgba(56,189,248,0.1)', padding: '4px 12px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14}/> {auditLogs.length} entries</span>
          <button onClick={() => fetchAuditLogs()} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500 }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 0.75rem', maxWidth: 400, marginBottom: '1.5rem' }}>
        <Search size={15} color="#64748b" />
        <input placeholder="Search action, user, performed by…" value={search} onChange={e => setSearch(e.target.value)} style={{ background: 'none', border: 'none', color: '#f1f5f9', padding: '0.6rem 0.5rem', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
      </div>

      <div style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>{['#', 'Action', 'Performed By', 'Target User', 'Timestamp', 'IP Address', 'Details'].map(h => <th key={h} style={{ color: '#64748b', textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No logs found</td></tr>
            ) : filtered.map((l, i) => {
              const color = ACTION_COLORS[l.action] || '#94a3b8';
              return (
                <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>{filtered.length - i}</td>
                  <td style={{ padding: '0.75rem 1rem' }}><span style={{ color, background: `${color}15`, padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{l.action.replace(/_/g, ' ')}</span></td>
                  <td style={{ padding: '0.75rem 1rem', color: '#22c55e', fontWeight: 600 }}>{l.performed_by}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9', fontWeight: 500 }}>{l.target_user || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>{l.created_at ? new Date(l.created_at).toLocaleString() : '—'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#38bdf8', fontFamily: 'monospace' }}>{'127.0.0.1'}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', maxWidth: 260 }}>{l.details || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
