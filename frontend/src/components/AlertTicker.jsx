import { useState, useEffect } from 'react';
import getApiBase from '../utils/apiBase';
import './AlertTicker.css';

function AlertTicker({ onOpenBlog }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const API_BASE = getApiBase();

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/api/alerts`, { credentials: 'include' }).then(r => r.json()).then(data => {
      if (!mounted) return;
      setAlerts(Array.isArray(data) ? data : (data.alerts || []));
    }).catch(err => console.error('Failed to load alerts:', err));
    return () => { mounted = false; };
  }, [API_BASE]);

  useEffect(() => {
    if (!alerts || alerts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts]);

  if (!isVisible || alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];
  const severityClass = (currentAlert.severity || '').toLowerCase();

  return (
    <div
      className={`alert-ticker ${severityClass}`}
      onClick={() => {
        if (currentAlert.blogSlug && typeof onOpenBlog === 'function') {
          onOpenBlog(currentAlert.blogSlug);
        }
      }}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (currentAlert.blogSlug && typeof onOpenBlog === 'function') {
            onOpenBlog(currentAlert.blogSlug);
          }
        }
      }}
    >
      <div className="ticker-content">
        <span className="alert-badge">ALERT</span>
        <div className="alert-text">
          <strong>{currentAlert.title}</strong>
          <span className="separator">•</span>
          <span>{currentAlert.description}</span>
        </div>
        <span className="alert-category">{currentAlert.category}</span>
      </div>
      <button 
        className="ticker-close"
        onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
        aria-label="Close alert"
      >
        ✕
      </button>
    </div>
  );
}

export default AlertTicker;
