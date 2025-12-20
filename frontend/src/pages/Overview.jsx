import { useEffect, useState } from 'react';
import { draftStorage, bookmarkStorage, activityStorage } from '../utils/localStorage';
import { safetyTips } from '../data/mockData';
import './Overview.css';

function Overview() {
  const [stats, setStats] = useState({
    drafts: 0,
    bookmarks: 0,
    activities: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Load stats
    setStats({
      drafts: draftStorage.getAll().length,
      bookmarks: bookmarkStorage.getAll().length,
      activities: activityStorage.getAll().length
    });

    // Load recent activities
    const activities = activityStorage.getAll().slice(0, 5);
    setRecentActivities(activities);
  }, []);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="overview-page">
      <div className="page-header">
        <h2>Welcome to Sahayak</h2>
        <p>Your privacy-first companion for navigating scam prevention and government policies</p>
      </div>

      {/* Citizen Confidence Dashboard */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.drafts}</h3>
            <p>Saved FIR Drafts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.bookmarks}</h3>
            <p>Bookmarked Schemes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>Local</h3>
            <p>Browser-Only Storage</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.activities}</h3>
            <p>Activities Logged</p>
          </div>
        </div>
      </section>

      <div className="two-column-layout">
        {/* Activity Log */}
        <section className="activity-section card">
          <h3>Recent Activity</h3>
          {recentActivities.length > 0 ? (
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-dot"></div>
                  <div className="activity-details">
                    <p className="activity-description">{activity.description}</p>
                    <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent activities</p>
          )}
        </section>

        {/* Safety Tips */}
        <section className="safety-section card">
          <h3>Safety Tips</h3>
          <ul className="safety-tips">
            {safetyTips.slice(0, 6).map((tip, index) => (
              <li key={index}>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* National Snapshot */}
      <section className="national-snapshot card">
        <h3>National Impact Snapshot</h3>
        <div className="snapshot-grid">
          <div className="snapshot-item">
            <div className="snapshot-number">12,453</div>
            <div className="snapshot-label">Total Beneficiaries</div>
          </div>
          <div className="snapshot-item">
            <div className="snapshot-number">₹183 Cr</div>
            <div className="snapshot-label">Relief Disbursed</div>
          </div>
          <div className="snapshot-item">
            <div className="snapshot-number">78%</div>
            <div className="snapshot-label">Success Rate</div>
          </div>
          <div className="snapshot-item">
            <div className="snapshot-number">14 Days</div>
            <div className="snapshot-label">Avg. Processing Time</div>
          </div>
        </div>
        <p className="snapshot-note">
          * Statistics from pilot program across 12 states. Data updated quarterly.
        </p>
      </section>

      {/* Product Roadmap */}
      <section className="roadmap card">
        <h3>What's Next for Sahayak</h3>
        <div className="roadmap-list">
          <div className="roadmap-item">
            <span className="roadmap-status in-progress">In Progress</span>
            <span>FIR PDF Export with Government Format</span>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-status planned">Planned</span>
            <span>API Setu Integration for Live Scheme Updates</span>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-status planned">Planned</span>
            <span>Multi-language Support (Hindi, Tamil, Bengali)</span>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-status planned">Planned</span>
            <span>Voice-based FIR Assistance for Low Literacy Users</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Overview;
