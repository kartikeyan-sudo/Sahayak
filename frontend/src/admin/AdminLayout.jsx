import React from 'react';
import './admin.css';

function AdminLayout({ currentView, onNavigate, onLogout }) {
  const devInfo = (import.meta.env.MODE || (typeof process !== 'undefined' && process.env.NODE_ENV)) !== 'production';
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleToggle = () => setMobileOpen(v => !v);

  return (
    <div className="admin-root">
      <div className="admin-topbar-mobile">
        <button className="mobile-hamburger" aria-label="Toggle menu" onClick={handleToggle}>
          ☰
        </button>
        <div className="mobile-title">CMS</div>
        {onLogout && (
          <button className="mobile-logout" onClick={onLogout} style={{marginLeft: 'auto', padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer'}}>
            Logout
          </button>
        )}
      </div>
      <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
        <h3>CMS</h3>
        <nav>
          <button onClick={() => { onNavigate('admin-dashboard'); setMobileOpen(false); }}>Dashboard</button>
          <button onClick={() => { onNavigate('admin-blogs'); setMobileOpen(false); }}>Blogs</button>
          <button onClick={() => { onNavigate('admin-alerts'); setMobileOpen(false); }}>Alerts</button>
          <button onClick={() => { onNavigate('admin-schemes'); setMobileOpen(false); }}>Schemes</button>
          <button onClick={() => { onNavigate('admin-users'); setMobileOpen(false); }}>Users</button>
          <button onClick={() => { onNavigate('admin-firs'); setMobileOpen(false); }}>FIRs</button>
        </nav>
        {onLogout && (
          <button onClick={onLogout} style={{marginTop: 'auto', width: '100%', padding: 12, background: '#ef4444', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600}}>
            Logout
          </button>
        )}
      </aside>
      <div className="admin-content">
        {currentView}
        {devInfo && !currentView && (
          <div style={{ marginTop: 12, padding: 12, background: '#fff6f6', border: '1px solid #ffdddd', borderRadius: 8 }}>
            <strong>Dev diagnostic:</strong>
            <div style={{ marginTop: 8 }}>No admin view rendered — possible reasons:</div>
            <ul style={{ marginTop: 8 }}>
              <li>The `currentView` prop is empty.</li>
              <li>There may be a runtime error in the child component — check DevTools Console.</li>
              <li>Backend API requests may be failing (check Network tab).</li>
            </ul>
            <div style={{ marginTop: 8 }}><strong>adminToken:</strong> {token ? 'present' : 'missing'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLayout;
