import { X, User as UserIcon, MapPin, Phone, Mail, Clock, Shield } from 'lucide-react';
import type { User } from '../store/adminStore';

export default function UserDetailModal({ user, onClose }: { user: User; onClose: () => void }) {
  const info = [
    { icon:<Mail size={14}/>,    label:'Email',         value: user.email },
    { icon:<Phone size={14}/>,   label:'Phone',         value: user.phone || '—' },
    { icon:<MapPin size={14}/>,  label:'Land ID',       value: user.land_id || '—' },
    { icon:<Shield size={14}/>,  label:'Role',          value: user.role },
    { icon:<Clock size={14}/>,   label:'Created At',    value: user.created_at ? new Date(user.created_at).toLocaleString('en-IN') : '—' },
    { icon:<Clock size={14}/>,   label:'Last Login',    value: user.last_login ? new Date(user.last_login).toLocaleString('en-IN') : 'Never' },
    { icon:<UserIcon size={14}/>,label:'Created By',    value: user.created_by || 'System' },
    { icon:<Shield size={14}/>,  label:'Failed Logins', value: String(user.failed_login_attempts) },
  ];

  const roleColor: Record<string,string> = { SUPER_ADMIN:'ag-badge-yellow', ADMIN:'ag-badge-green', OWNER:'ag-badge-purple', CUSTOMER:'ag-badge-green', AGENT:'ag-badge-blue' };
  const statusColor: Record<string,string> = { true:'ag-badge-green', false:'ag-badge-red' };

  return (
    <div className="ag-modal-backdrop" onClick={onClose}>
      <div className="ag-modal" onClick={e => e.stopPropagation()}>
        <div className="ag-modal-header">
          <h2 className="ag-modal-title">👤 User Profile</h2>
          <button className="ag-modal-close" onClick={onClose}><X size={18}/></button>
        </div>

        {/* Avatar header */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px', background:'var(--bg-elevated)', borderRadius:10, marginBottom:20 }}>
          <div style={{ width:56, height:56, borderRadius:14, background:'linear-gradient(135deg,var(--ag-green),var(--ag-blue))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', fontWeight:800, color:'#fff' }}>
            {user.full_name[0]}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700, fontSize:'1.05rem', color:'var(--text-primary)' }}>{user.full_name}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>@{user.username}</div>
            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              <span className={`ag-badge ${roleColor[user.role]}`}>{user.role}</span>
              <span className={`ag-badge ${statusColor[String(user.is_active)]}`}>{user.is_active ? 'ACTIVE' : 'DISABLED'}</span>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          {info.map(item => (
            <div key={item.label} style={{ background:'var(--bg-elevated)', borderRadius:8, padding:'10px 14px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)', fontSize:'0.72rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>
                {item.icon} {item.label}
              </div>
              <div style={{ fontSize:'0.85rem', color: item.label==='Land ID'?'var(--ag-blue)':'var(--text-primary)', fontFamily: item.label==='Land ID'?'monospace':'inherit', fontWeight:500 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="ag-modal-footer">
          <button className="ag-btn ag-btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
