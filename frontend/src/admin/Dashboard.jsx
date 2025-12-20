import React, { useState, useEffect } from 'react';
import getApiBase from '../utils/apiBase';

function Dashboard() {
  const [stats, setStats] = useState({ blogs: 0, alerts: 0, schemes: 0, users: { total: 0, active: 0 } });
  const API_BASE = getApiBase();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [blogsResp, alertsResp, schemesResp, usersResp] = await Promise.all([
        fetch(`${API_BASE}/api/admin/blogs`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/alerts`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/schemes`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/admin/users`, { credentials: 'include' })
      ]);
      const blogs = await blogsResp.json();
      const alerts = await alertsResp.json();
      const schemes = await schemesResp.json();
      const users = await usersResp.json();
      setStats({
        blogs: blogs.length,
        alerts: alerts.filter(a => a.active).length,
        schemes: schemes.length,
        users: { total: users.total, active: users.active }
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  return (
    <div className="admin-card">
      <h2>CMS Dashboard</h2>
      <p style={{marginBottom: 24, color: '#666'}}>Overview of platform content</p>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16}}>
        <div style={{background: '#f0f9ff', padding: 20, borderRadius: 8, border: '2px solid #7FDD7F'}}>
          <h3 style={{margin: 0, fontSize: 32, color: '#1a1a1a'}}>{stats.blogs}</h3>
          <p style={{margin: '8px 0 0 0', color: '#666'}}>Blogs Published</p>
        </div>
        <div style={{background: '#fff3cd', padding: 20, borderRadius: 8, border: '2px solid #ffc107'}}>
          <h3 style={{margin: 0, fontSize: 32, color: '#1a1a1a'}}>{stats.alerts}</h3>
          <p style={{margin: '8px 0 0 0', color: '#666'}}>Active Alerts</p>
        </div>
        <div style={{background: '#e7f5ff', padding: 20, borderRadius: 8, border: '2px solid #74b9ff'}}>
          <h3 style={{margin: 0, fontSize: 32, color: '#1a1a1a'}}>{stats.schemes}</h3>
          <p style={{margin: '8px 0 0 0', color: '#666'}}>Total Schemes</p>
        </div>
        <div style={{background: '#f0f9ff', padding: 20, borderRadius: 8, border: '2px solid #7FDD7F'}}>
          <h3 style={{margin: 0, fontSize: 32, color: '#1a1a1a'}}>{stats.users.total}</h3>
          <p style={{margin: '8px 0 0 0', color: '#666'}}>Total Users</p>
        </div>
        <div style={{background: '#fff3cd', padding: 20, borderRadius: 8, border: '2px solid #ffc107'}}>
          <h3 style={{margin: 0, fontSize: 32, color: '#1a1a1a'}}>{stats.users.active}</h3>
          <p style={{margin: '8px 0 0 0', color: '#666'}}>Active Users</p>
        </div>
      </div>

      <div style={{marginTop: 32, padding: 16, background: '#f5f7fa', borderRadius: 8}}>
        <h3 style={{margin: '0 0 8px 0'}}>Quick Actions</h3>
        <p style={{fontSize: 14, color: '#666'}}>
          Use the sidebar to manage Blogs, Alerts, and Schemes. Changes made here will reflect on the main website immediately.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
