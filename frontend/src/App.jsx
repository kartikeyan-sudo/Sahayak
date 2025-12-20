import { useState, useEffect } from 'react';
import Login from './components/Login';
import Topbar from './components/Topbar';
import AlertTicker from './components/AlertTicker';
import Overview from './pages/Overview';
import SchemesHub from './pages/SchemesHub';
import FIRPage from './pages/FIRPage';
import Resources from './pages/Resources';
import Copilot from './pages/Copilot';
import Blogs from './pages/Blogs';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import BlogManager from './admin/BlogManager';
import AlertManager from './admin/AlertManager';
import SchemeEditor from './admin/SchemeEditor';
import UserManager from './admin/UserManager';
import AdminLogin from './admin/AdminLogin';
import AdminLoginPage from './pages/AdminLoginPage';
import { sessionStorage } from './utils/localStorage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const path = window?.location?.pathname || '';
      if (path.toLowerCase().startsWith('/admin')) return 'admin-login';
    } catch (err) {
      // ignore
    }
    return 'overview';
  });
  const [currentBlog, setCurrentBlog] = useState(null);

  useEffect(() => {
    if (sessionStorage.isActive()) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('overview');
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setCurrentPage('admin-login');
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (!isLoggedIn && currentPage !== 'admin-login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />;
      case 'schemes':
        return <SchemesHub />;
      case 'fir':
        return <FIRPage />;
      case 'resources':
        return <Resources onOpenBlog={(slug) => { setCurrentBlog(slug); setCurrentPage('blogs'); }} />;
      case 'blogs':
        return <Blogs selectedBlog={currentBlog} onNavigate={setCurrentPage} />;
      case 'admin-login':
        return (
          <AdminLoginPage onLoginSuccess={(user) => { handleLoginSuccess(); setCurrentPage('admin-dashboard'); }} />
        );
      case 'admin-dashboard':
        return (
          <AdminLayout currentView={<Dashboard />} onNavigate={setCurrentPage} onLogout={handleAdminLogout} />
        );
      case 'admin-blogs':
        return (
          <AdminLayout currentView={<BlogManager />} onNavigate={setCurrentPage} onLogout={handleAdminLogout} />
        );
      case 'admin-alerts':
        return (
          <AdminLayout currentView={<AlertManager />} onNavigate={setCurrentPage} onLogout={handleAdminLogout} />
        );
      case 'admin-schemes':
        return (
          <AdminLayout currentView={<SchemeEditor />} onNavigate={setCurrentPage} onLogout={handleAdminLogout} />
        );
      case 'admin-users':
        return (
          <AdminLayout currentView={<UserManager />} onNavigate={setCurrentPage} onLogout={handleAdminLogout} />
        );
      case 'copilot':
        return <Copilot />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="app">
      {!(typeof currentPage === 'string' && currentPage.startsWith('admin')) && (
        <>
          <Topbar 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
            onLogout={handleLogout}
          />
          <AlertTicker onOpenBlog={(slug) => {
            if (slug) {
              setCurrentBlog(slug);
              setCurrentPage('blogs');
            } else {
              setCurrentPage('resources');
            }
          }} />
        </>
      )}
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
