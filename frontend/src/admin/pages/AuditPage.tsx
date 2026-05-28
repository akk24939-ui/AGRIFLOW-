import { useState, useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { FileText, Search, RefreshCw, Trash2 } from 'lucide-react';
import { adminApi } from '../api';
import { showToast } from '../components/ToastContainer';

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED:    '#22c55e',
  USER_DELETED:    '#f87171',
  USER_DISABLED:   '#fbbf24',
  USER_UPDATED:    '#38bdf8',
  PASSWORD_CHANGED:'#38bdf8',
  LAND_CREATED:    '#a78bfa',
  USER_LOGIN:      '#22c55e',
};

export default function AuditPage() {
  const { auditLogs, fetchAuditLogs } = useAdminStore();
  const [search, setSearch]       = useState('');
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => { fetchAuditLogs(); }, []);

  const filtered = auditLogs.filter(l => {
    const q = search.toLowerCase();
    return !q
      || l.action.toLowerCase().includes(q)
      || (l.target_user || '').toLowerCase().includes(q)
      || l.performed_by.toLowerCase().includes(q);
  });

  const deleteOne = async (id: string) => {
    if (!window.confirm('Permanently delete this audit log entry?')) return;
    setDeleting(id);
    try {
      await adminApi.deleteAuditLog(id);
      await fetchAuditLogs();
      showToast('Log entry removed', 'success');
    } catch {
      showToast('Failed to delete entry', 'error');
    } finally { setDeleting(null); }
  };

  const deleteAll = async () => {
    if (!window.confirm(`Permanently delete ALL ${filtered.length} log entries? This cannot be undone.`)) return;
    setDeletingAll(true);
    try {
      await adminApi.deleteAllAuditLogs();
      await fetchAuditLogs();
      showToast('All audit logs cleared', 'success');
    } catch {
      showToast('Failed to clear logs', 'error');
    } finally { setDeletingAll(false); }
  };

  return (
    <div className="ag-page">
      {/* ── Header ── */}
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">Audit Logs</h1>
          <p className="ag-page-subtitle">Complete admin activity trail</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="ag-badge-blue">
            <FileText size={13}/> {filtered.length} entries
          </span>
          <button
            className="ag-btn ag-btn-danger-outline"
            onClick={deleteAll}
            disabled={filtered.length === 0 || deletingAll}
          >
            <Trash2 size={14}/> {deletingAll ? 'Clearing…' : 'Delete All'}
          </button>
          <button className="ag-btn ag-btn-secondary" onClick={() => fetchAuditLogs()}>
            <RefreshCw size={14}/> Refresh
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="ag-search-bar" style={{ maxWidth: 440, marginBottom: '1.5rem' }}>
        <Search size={15} color="var(--text-muted)" />
        <input
          className="ag-search-input"
          placeholder="Search action, user, performed by…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Table ── */}
      <div className="ag-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ag-table" style={{ minWidth: 750 }}>
            <thead>
              <tr>
                <th style={{ width: 48 }}>#</th>
                <th style={{ width: 160 }}>Action</th>
                <th>Performed By</th>
                <th>Target User</th>
                <th style={{ width: 170 }}>Timestamp</th>
                <th style={{ width: 110 }}>IP Address</th>
                <th>Details</th>
                <th style={{ width: 52 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No audit logs found
                  </td>
                </tr>
              ) : filtered.map((l, i) => {
                const color = ACTION_COLORS[l.action] || 'var(--text-muted)';
                return (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {filtered.length - i}
                    </td>
                    <td>
                      <span style={{
                        color,
                        background: `${color === 'var(--text-muted)' ? 'rgba(148,163,184' : color.replace('#','rgba(').replace(/^rgba\(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/, (_,r,g,b)=>`rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)}`)},0.12)`,
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap',
                        letterSpacing: '0.02em',
                      }}>
                        {l.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--ag-green)', fontWeight: 600 }}>{l.performed_by}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{l.target_user || '—'}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {l.created_at ? new Date(l.created_at).toLocaleString('en-IN') : '—'}
                    </td>
                    <td style={{ color: 'var(--ag-blue)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      127.0.0.1
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {l.details || '—'}
                    </td>
                    <td>
                      <button
                        onClick={() => deleteOne(l.id)}
                        disabled={deleting === l.id}
                        title="Delete entry"
                        className="ag-icon-btn ag-icon-btn-danger"
                      >
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
