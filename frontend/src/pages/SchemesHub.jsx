import { useState, useEffect } from 'react';
import getApiBase from '../utils/apiBase';
import { bookmarkStorage, activityStorage, schemesStorage } from '../utils/localStorage';
import SchemeModal from '../components/SchemeModal';
import './SchemesHub.css';

function SchemesHub() {
  const [schemes, setSchemes] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [filterTag, setFilterTag] = useState('All');
  const API_BASE = getApiBase();

  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/api/schemes`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : (data.schemes || []);
        if (list && list.length > 0) {
          setSchemes(list);
        } else {
          // fallback to local storage seeded data
          setSchemes(schemesStorage.getAll());
        }
      })
      .catch(err => {
        console.error('Failed to load schemes from API, falling back to local:', err);
        if (!mounted) return;
        setSchemes(schemesStorage.getAll());
      });
    return () => { mounted = false; };
  }, [API_BASE]);

  useEffect(() => {
    setBookmarkedIds(bookmarkStorage.getAll());
  }, []);

  const handleBookmark = (schemeId) => {
    if (bookmarkStorage.isBookmarked(schemeId)) {
      bookmarkStorage.remove(schemeId);
      activityStorage.add({ type: 'bookmark-removed', description: 'Scheme unbookmarked' });
    } else {
      bookmarkStorage.add(schemeId);
      activityStorage.add({ type: 'bookmark-added', description: 'Scheme bookmarked' });
    }
    setBookmarkedIds(bookmarkStorage.getAll());
  };

  const filteredSchemes = filterTag === 'All' 
    ? schemes 
    : schemes.filter(s => s.governmentTag === filterTag);

  const getSchemeId = (scheme) => scheme.id || scheme._id;
  const getStatistics = (scheme) => {
    const stats = scheme.statistics || {};
    return {
      beneficiaries: Number(stats.beneficiaries || 0),
      successRate: stats.successRate || 'N/A'
    };
  };

  const tags = ['All', ...new Set(schemes.map(s => s.governmentTag))];

  return (
    <div className="schemes-page">
      <div className="page-header">
        <h2>Schemes Hub</h2>
        <p>Discover government schemes and policies applicable to your situation</p>
      </div>

      <div className="filter-bar">
        {tags.map((tag) => (
          <button
            key={tag}
            className={`filter-btn ${filterTag === tag ? 'active' : ''}`}
            onClick={() => setFilterTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="schemes-grid">
        {filteredSchemes.map((scheme) => (
          <div key={getSchemeId(scheme)} className="scheme-card">
            <div className="scheme-header">
              <span className="scheme-tag">{scheme.governmentTag}</span>
              <button
                className={`bookmark-btn ${bookmarkedIds.includes(getSchemeId(scheme)) ? 'active' : ''}`}
                onClick={() => handleBookmark(getSchemeId(scheme))}
                aria-label="Bookmark scheme"
              >
                {bookmarkedIds.includes(getSchemeId(scheme)) ? '★' : '☆'}
              </button>
            </div>
            
            <h3>{scheme.name}</h3>
            <p className="scheme-description">{scheme.description}</p>
            
            <div className="scheme-stats">
              <div className="stat-mini">
                <strong>{getStatistics(scheme).beneficiaries.toLocaleString()}</strong>
                <span>Beneficiaries</span>
              </div>
              <div className="stat-mini">
                <strong>{getStatistics(scheme).successRate}</strong>
                <span>Success Rate</span>
              </div>
            </div>

            <div className="scheme-actions">
              <button
                className="details-btn"
                onClick={() => setSelectedScheme(scheme)}
              >
                Get Details →
              </button>
              {scheme.link && (
                <a
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="visit-site-btn"
                >
                  Visit Official Site ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedScheme && (
        <SchemeModal
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
        />
      )}
    </div>
  );
}

export default SchemesHub;
