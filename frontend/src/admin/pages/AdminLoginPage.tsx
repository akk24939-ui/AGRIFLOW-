import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, Leaf } from 'lucide-react';
import { authApi } from '../api';
import { useAdminStore } from '../store/adminStore';
import { showToast } from '../components/ToastContainer';
import '../admin.css';

export default function AdminLoginPage() {
  const navigate    = useNavigate();
  const setAdminUser = useAdminStore(s => s.setAdminUser);

  const [username,   setUsername]   = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const user = await authApi.login(username.trim(), password);
      setAdminUser({ id: user.id, name: user.full_name, role: user.role, username: user.username, land_id: user.land_id });
      showToast(`Welcome back, ${user.full_name}!`, 'success');
      const role = user.role;
      if (role === 'AGENT' || role === 'WORKER') {
        navigate('/agent');
      } else if (role === 'CUSTOMER') {
        navigate('/customer');
      } else if (role === 'OWNER') {
        navigate('/owner/dashboard');
      } else {
        // SUPER_ADMIN, ADMIN
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0b1118 0%, #0d1f12 50%, #0b1118 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background orbs */}
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', top:'10%', left:'5%', animation:'float 8s ease-in-out infinite' }}/>
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', bottom:'15%', right:'10%', animation:'float 10s ease-in-out infinite reverse' }}/>
      <style>{`@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}`}</style>

      <div style={{
        width: '100%',
        maxWidth: 420,
        padding: '2.5rem',
        background: 'rgba(17,24,39,0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: 20,
        boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(34,197,94,0.05)',
        zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{
            width:64, height:64, borderRadius:16,
            background:'linear-gradient(135deg,#22c55e,#16a34a)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto 1rem', boxShadow:'0 8px 24px rgba(34,197,94,0.3)',
          }}>
            <Leaf size={28} color="#fff" strokeWidth={2.5}/>
          </div>
          <h1 style={{ color:'#f1f5f9', fontSize:'1.5rem', fontWeight:700, margin:0 }}>AgriFlow Enterprise</h1>
          <p style={{ color:'#64748b', fontSize:'0.85rem', marginTop:6 }}>
            <ShieldCheck size={13} style={{ verticalAlign:'middle', marginRight:4, color:'#22c55e' }}/>
            Admin Control Panel
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email ID */}
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ display:'block', color:'#94a3b8', fontSize:'0.8rem', fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Email ID
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your email ID"
              autoComplete="email"
              disabled={loading}
              style={{
                width:'100%', padding:'0.75rem 1rem', borderRadius:10,
                background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                color:'#f1f5f9', fontSize:'0.95rem', outline:'none', boxSizing:'border-box',
                transition:'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor='#22c55e'}
              onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom:'1.25rem' }}>
            <label style={{ display:'block', color:'#94a3b8', fontSize:'0.8rem', fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Password
            </label>
            <div style={{ position:'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                style={{
                  width:'100%', padding:'0.75rem 2.8rem 0.75rem 1rem', borderRadius:10,
                  background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                  color:'#f1f5f9', fontSize:'0.95rem', outline:'none', boxSizing:'border-box',
                  transition:'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor='#22c55e'}
                onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.1)'}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#64748b', padding:4 }}
              >
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', color:'#fca5a5', fontSize:'0.83rem' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width:'100%', padding:'0.85rem', borderRadius:10, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#22c55e,#16a34a)',
              color:'#fff', fontWeight:700, fontSize:'0.95rem', transition:'all 0.2s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              boxShadow: loading ? 'none' : '0 4px 16px rgba(34,197,94,0.35)',
            }}
          >
            {loading ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/> Signing in…</> : 'Sign In to Admin Panel'}
          </button>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </form>

        <p style={{ textAlign:'center', marginTop:'1.5rem', color:'#475569', fontSize:'0.78rem' }}>
          AgriFlow Enterprise v1.0 · Secured with JWT
        </p>
      </div>
    </div>
  );
}
