import { useState } from 'react';
import { Shield, Bell, Database, Globe, Save } from 'lucide-react';
import { showToast } from '../components/ToastContainer';

interface SettingGroup {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  settings: { key: string; label: string; type: 'toggle'|'text'|'number'|'select'; value: any; options?: string[] }[];
}

export default function SettingsPage() {
  const [groups, setGroups] = useState<SettingGroup[]>([
    {
      id:'security', icon:<Shield size={18}/>, title:'Security Settings', description:'Authentication & access control',
      settings:[
        { key:'mfa', label:'Two-Factor Authentication (2FA)', type:'toggle', value:true },
        { key:'brute', label:'Brute Force Protection', type:'toggle', value:true },
        { key:'maxFail', label:'Max Failed Login Attempts', type:'number', value:5 },
        { key:'sessionTTL', label:'Session Timeout (minutes)', type:'number', value:60 },
        { key:'jwtExpiry', label:'JWT Expiry (hours)', type:'number', value:24 },
      ]
    },
    {
      id:'notifications', icon:<Bell size={18}/>, title:'Notification Settings', description:'Email and alert configuration',
      settings:[
        { key:'emailAlerts', label:'Email Alerts on Failed Login', type:'toggle', value:true },
        { key:'newUser', label:'Notify on New User Creation', type:'toggle', value:true },
        { key:'adminEmail', label:'Admin Email', type:'text', value:'admin@agriflow.in' },
      ]
    },
    {
      id:'platform', icon:<Globe size={18}/>, title:'Platform Settings', description:'General platform configuration',
      settings:[
        { key:'platformName', label:'Platform Name', type:'text', value:'AgriFlow Enterprise' },
        { key:'timezone', label:'Default Timezone', type:'select', value:'Asia/Kolkata', options:['Asia/Kolkata','UTC','Asia/Dubai'] },
        { key:'lang', label:'Default Language', type:'select', value:'English', options:['English','Tamil','Hindi'] },
        { key:'maintenanceMode', label:'Maintenance Mode', type:'toggle', value:false },
      ]
    },
    {
      id:'database', icon:<Database size={18}/>, title:'Database Settings', description:'PostgreSQL & cache configuration',
      settings:[
        { key:'dbHost', label:'Database Host', type:'text', value:'db.agriflow.internal' },
        { key:'redisCache', label:'Redis Cache Enabled', type:'toggle', value:true },
        { key:'cacheTTL', label:'Cache TTL (seconds)', type:'number', value:300 },
        { key:'maxConn', label:'Max DB Connections', type:'number', value:20 },
      ]
    },
  ]);

  const updateSetting = (groupId: string, key: string, value: any) => {
    setGroups(gs => gs.map(g => g.id === groupId
      ? { ...g, settings: g.settings.map(s => s.key === key ? { ...s, value } : s) }
      : g
    ));
  };

  return (
    <div className="ag-fade-in">
      <div className="ag-page-header">
        <div>
          <h1 className="ag-page-title">System Settings</h1>
          <p className="ag-page-sub">Configure security, platform and database preferences</p>
        </div>
        <button className="ag-btn ag-btn-primary" onClick={() => showToast('Settings saved successfully')}>
          <Save size={16}/> Save All Changes
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {groups.map(group => (
          <div className="ag-card" key={group.id}>
            <div className="ag-card-title" style={{ color:'var(--ag-green)' }}>
              {group.icon} {group.title}
              <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:400, marginLeft:'auto' }}>{group.description}</span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {group.settings.map(s => (
                <div key={s.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-elevated)', borderRadius:8, padding:'12px 16px' }}>
                  <div>
                    <div style={{ fontSize:'0.85rem', fontWeight:500, color:'var(--text-primary)' }}>{s.label}</div>
                  </div>
                  <div style={{ flexShrink:0, marginLeft:12 }}>
                    {s.type === 'toggle' && (
                      <div
                        style={{ width:44, height:24, borderRadius:12, background: s.value ? 'var(--ag-green)' : 'var(--bg-card)', border:'1px solid var(--glass-border)', cursor:'pointer', position:'relative', transition:'background 0.2s' }}
                        onClick={() => updateSetting(group.id, s.key, !s.value)}
                      >
                        <div style={{ position:'absolute', top:3, left: s.value ? 22 : 3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }}/>
                      </div>
                    )}
                    {s.type === 'text' && (
                      <input className="ag-input" style={{ width:200, padding:'6px 10px', fontSize:'0.8rem' }}
                        value={s.value} onChange={e => updateSetting(group.id, s.key, e.target.value)}/>
                    )}
                    {s.type === 'number' && (
                      <input className="ag-input" type="number" style={{ width:100, padding:'6px 10px', fontSize:'0.8rem' }}
                        value={s.value} onChange={e => updateSetting(group.id, s.key, Number(e.target.value))}/>
                    )}
                    {s.type === 'select' && (
                      <select className="ag-input ag-select" style={{ width:180, padding:'6px 24px 6px 10px', fontSize:'0.8rem' }}
                        value={s.value} onChange={e => updateSetting(group.id, s.key, e.target.value)}>
                        {s.options?.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
