import { lazy, Suspense, useEffect } from 'react';
import ToastContainer from './admin/components/ToastContainer';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAdminStore } from './admin/store/adminStore';
import './index.css';

// ─── Landing page (existing) ──────────────────────────
const Navbar          = lazy(() => import('./components/Navbar'));
const Hero            = lazy(() => import('./components/Hero'));
const Performance     = lazy(() => import('./components/Performance'));
const RoleSections    = lazy(() => import('./components/RoleSections'));
const LandShowcase    = lazy(() => import('./components/LandShowcase'));
const SecuritySection = lazy(() => import('./components/SecuritySection'));
const ContactSection  = lazy(() => import('./components/ContactSection'));
const Footer          = lazy(() => import('./components/Footer'));

// ─── Admin Panel ──────────────────────────────────────
const AdminLayout    = lazy(() => import('./admin/AdminLayout'));
const AdminLoginPage = lazy(() => import('./admin/pages/AdminLoginPage'));
const DashboardPage  = lazy(() => import('./admin/pages/DashboardPage'));
const UsersPage      = lazy(() => import('./admin/pages/UsersPage'));
const AdminCustomersPage = lazy(() => import('./admin/pages/AdminCustomersPage'));
const LandsPage      = lazy(() => import('./admin/pages/LandsPage'));
const TasksPage      = lazy(() => import('./admin/pages/TasksPage'));
const ReportsPage    = lazy(() => import('./admin/pages/ReportsPage'));
const SecurityPage   = lazy(() => import('./admin/pages/SecurityPage'));
const AuditPage      = lazy(() => import('./admin/pages/AuditPage'));
const SettingsPage   = lazy(() => import('./admin/pages/SettingsPage'));

// ─── Owner Portal ───────────────────────────────────────
const OwnerApp       = lazy(() => import('./owner/OwnerApp'));

// ─── Agent Portal ──────────────────────────────────────
const AgentApp       = lazy(() => import('./agent/AgentApp'));

// ─── Customer Portal ───────────────────────────────────
const CustomerApp    = lazy(() => import('./customer/CustomerApp'));
// Body class switcher (landing vs admin dark mode)
function BodyClassManager() {
  const { pathname } = useLocation();
  const theme = useAdminStore(s => s.theme);
  
  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      document.body.classList.add('admin-body');
      document.documentElement.className = theme;
    } else {
      document.body.classList.remove('admin-body');
      document.documentElement.className = '';
    }
  }, [pathname, theme]);
  return null;
}

const Spinner = () => (
  <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0b1118' }}>
    <div style={{ width:48, height:48, border:'3px solid rgba(34,197,94,0.2)', borderTopColor:'#22c55e', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <BodyClassManager />
      <ToastContainer />
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* ── Landing Page ─────────────────────────── */}
          <Route path="/" element={
            <div className="app-container">
              <Navbar />
              <Hero />
              <Performance />
              <RoleSections />
              <LandShowcase />
              <SecuritySection />
              <ContactSection />
              <Footer />
            </div>
          }/>

          {/* ── Admin Login ───────────────────────────── */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* ── Admin Panel (protected shell) ─────────── */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users"     element={<UsersPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="lands"     element={<LandsPage />} />
            <Route path="tasks"     element={<TasksPage />} />
            <Route path="reports"   element={<ReportsPage />} />
            <Route path="security"  element={<SecurityPage />} />
            <Route path="audit"     element={<AuditPage />} />
            <Route path="settings"  element={<SettingsPage />} />
          </Route>

          {/* ── Agent Portal ───────────────────────────────── */}
          <Route path="/agent" element={<AgentApp />} />
          <Route path="/agent/*" element={<AgentApp />} />

          {/* ── Owner Portal ───────────────────────────────── */}
          <Route path="/owner" element={<OwnerApp />} />
          <Route path="/owner/*" element={<OwnerApp />} />

          {/* ── Customer Portal ────────────────────────────── */}
          <Route path="/customer" element={<CustomerApp />} />
          <Route path="/customer/*" element={<CustomerApp />} />

          {/* ── 404 ──────────────────────────────────── */}
          <Route path="*" element={
            <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0b1118', color:'#64748b', fontFamily:'Inter,sans-serif' }}>
              <div style={{ fontSize:'5rem' }}>🌿</div>
              <h1 style={{ fontSize:'2rem', color:'#22c55e', marginTop:12 }}>404</h1>
              <p style={{ marginTop:8 }}>Page not found</p>
              <a href="/" style={{ marginTop:20, color:'#38bdf8', fontSize:'0.875rem' }}>← Back to Home</a>
            </div>
          }/>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
