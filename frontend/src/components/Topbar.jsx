import { useState, useEffect } from 'react';
import { sessionStorage, activityStorage, preferencesStorage } from '../utils/localStorage';
import './Topbar.css';

function Topbar({ currentPage, onNavigate, onLogout }) {
  const session = sessionStorage.get();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const prefs = preferencesStorage.get();
    setIsDarkMode(prefs.theme === 'dark');
    document.body.classList.toggle('dark-mode', prefs.theme === 'dark');
  }, []);

  const handleLogout = () => {
    activityStorage.add({ type: 'logout', description: 'Session ended' });
    sessionStorage.clear();
    onLogout();
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    const prefs = preferencesStorage.get();
    prefs.theme = newTheme ? 'dark' : 'light';
    preferencesStorage.set(prefs);
    document.body.classList.toggle('dark-mode', newTheme);
  };

  const handleNavigation = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'schemes', label: 'Schemes Hub', icon: '📋' },
    { id: 'fir', label: 'Cyber & FIR', icon: '🛡️' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'blogs', label: 'Blogs', icon: '📰' },
    { id: 'copilot', label: 'Sahayak Ai', icon: '🤖' }
  ];

  return (
    <div className="topbar">
      <div className="topbar-header">
        <div className="logo-section">
          <h1>Sahayak</h1>
          <span className="tagline-small">Citizen Safety Platform</span>
        </div>
        
        <div className="header-actions">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          <button 
            className="hamburger-menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-icon ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          <div className="session-info desktop-only">
            <div className="status-badge active">
              <span className="status-dot"></span>
              Online
            </div>
            <span className="username">{session?.username || 'User'}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <nav className={`nav-bar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
        
        <div className="mobile-only mobile-actions">
          <div className="mobile-user-info">
            <span className="username">{session?.username || 'User'}</span>
            <div className="status-badge active">
              <span className="status-dot"></span>
              Online
            </div>
          </div>
          <button onClick={handleLogout} className="logout-button mobile">
            Logout
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Close menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

export default Topbar;
