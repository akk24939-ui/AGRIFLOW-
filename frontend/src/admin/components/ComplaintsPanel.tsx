import { useState, useEffect } from 'react';
import { complaintsApi } from '../api';
import { MessageCircle, RefreshCw, ChevronDown, ChevronUp, Send, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { showToast } from './ToastContainer';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  OPEN:       { color: '#f87171', bg: 'rgba(239,68,68,0.12)',    icon: AlertCircle,    label: 'Open'      },
  IN_REVIEW:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',   icon: Clock,          label: 'In Review' },
  RESOLVED:   { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    icon: CheckCircle,    label: 'Resolved'  },
  CLOSED:     { color: '#64748b', bg: 'rgba(100,116,139,0.12)',  icon: XCircle,        label: 'Closed'    },
};

interface ComplaintsPanelProps {
  /** If 'view-only', no status-change controls shown (Agent mode) */
  mode?: 'owner' | 'agent' | 'customer';
  /** Current logged-in user from store */
  currentUser: any;
}

export default function ComplaintsPanel({ mode = 'owner', currentUser }: ComplaintsPanelProps) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reply, setReply]     = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter]   = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const data = await complaintsApi.list();
      setComplaints(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load complaints', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sendReply = async (id: string) => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await complaintsApi.addMessage(id, reply.trim());
      setReply('');
      const updated = await complaintsApi.get(id);
      setComplaints(cs => cs.map(c => c.id === id ? updated : c));
      showToast('Reply sent!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      const updated = await complaintsApi.updateStatus(id, status);
      setComplaints(cs => cs.map(c => c.id === id ? { ...c, status: updated.status } : c));
      showToast(`Status updated to ${status}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filtered = filter === 'ALL' ? complaints : complaints.filter(c => c.status === filter);

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: 8,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#f1f5f9', fontSize: '0.83rem', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>
            {mode === 'customer' ? '🗣️ My Complaints' : '📋 Customer Complaints'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 4 }}>
            {mode === 'customer' ? 'Track your issues and receive replies from the team' : `${filtered.length} complaint(s) • ${mode === 'agent' ? 'View-only access' : 'Manage and respond'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['ALL','OPEN','IN_REVIEW','RESOLVED','CLOSED'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              background: filter === s ? 'rgba(56,189,248,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === s ? '#38bdf8' : '#94a3b8',
            }}>{s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label}</button>
          ))}
          <button onClick={load} style={{ padding: '4px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
            <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* List */}
      {loading && complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading complaints…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: 'rgba(15,25,35,0.8)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <AlertCircle size={40} color="#475569" style={{ marginBottom: 12 }} />
          <p style={{ margin: 0 }}>No complaints {filter !== 'ALL' ? `with status "${STATUS_CONFIG[filter]?.label}"` : 'yet'}.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(c => {
            const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.OPEN;
            const isOpen = expanded === c.id;
            const StatusIcon = sc.icon;
            return (
              <div key={c.id} style={{ background: 'rgba(15,25,35,0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
                {/* Card Header */}
                <div
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer', gap: 12 }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem' }}>{c.title}</span>
                      <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <StatusIcon size={10} /> {sc.label}
                      </span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>🗓️ {new Date(c.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                      <span><MessageCircle size={10} style={{ marginRight: 3 }} />{c.messages?.length || 0} messages</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {/* Status dropdown — Owner/Admin only */}
                    {mode === 'owner' && (
                      <select
                        value={c.status}
                        onChange={e => { e.stopPropagation(); changeStatus(c.id, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        style={{ ...inp, width: 'auto', padding: '4px 8px', fontSize: '0.72rem', cursor: 'pointer' }}
                      >
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    )}
                    {isOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                  </div>
                </div>

                {/* Expanded: messages + reply */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.25rem' }}>
                    {c.description && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '0.6rem 0.8rem', marginBottom: '0.75rem', color: '#cbd5e1', fontSize: '0.83rem', borderLeft: '3px solid rgba(56,189,248,0.4)' }}>
                        {c.description}
                      </div>
                    )}

                    {/* Messages thread */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '0.75rem', maxHeight: 300, overflowY: 'auto' }}>
                      {(c.messages || []).length === 0 ? (
                        <p style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', margin: 0 }}>No replies yet.</p>
                      ) : (c.messages || []).map((m: any) => {
                        const isMine = m.sender_id === currentUser?.id;
                        return (
                          <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '75%', padding: '0.5rem 0.75rem', borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0',
                              background: isMine ? 'rgba(34,197,94,0.15)' : 'rgba(56,189,248,0.1)',
                              border: `1px solid ${isMine ? 'rgba(34,197,94,0.2)' : 'rgba(56,189,248,0.15)'}`,
                              color: '#f1f5f9', fontSize: '0.82rem',
                            }}>
                              <div style={{ fontSize: '0.7rem', color: isMine ? '#86efac' : '#93c5fd', marginBottom: 3, fontWeight: 600 }}>
                                {isMine ? 'You' : (mode === 'customer' ? 'Owner / Support' : 'Customer')}
                              </div>
                              {m.message}
                              <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4, textAlign: 'right' }}>
                                {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply box — not for agent, and not for resolved/closed (unless customer) */}
                    {mode !== 'agent' && (c.status !== 'CLOSED') && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          value={reply}
                          onChange={e => setReply(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply(c.id)}
                          placeholder="Type your reply and press Enter…"
                          style={{ ...inp, flex: 1 }}
                        />
                        <button
                          onClick={() => sendReply(c.id)}
                          disabled={sending || !reply.trim()}
                          style={{ padding: '0 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: sending || !reply.trim() ? 'rgba(34,197,94,0.1)' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600 }}
                        >
                          <Send size={14} /> Send
                        </button>
                      </div>
                    )}
                    {mode === 'agent' && (
                      <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0, textAlign: 'center' }}>👁️ View-only — only owners can respond</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
