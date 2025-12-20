import React, { useState, useEffect } from 'react';
import getApiBase from '../utils/apiBase';

function AlertManager() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialAlert = { title: '', description: '', category: '', severity: 'medium', active: true, blogSlug: '' };
  const [form, setForm] = useState(initialAlert);
  const [saving, setSaving] = useState(false);
  const API_BASE = getApiBase();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/api/admin/alerts`, { credentials: 'include' });
      const data = await resp.json();
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/alerts/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ active: !currentStatus })
      });
      if (!resp.ok) throw new Error('Update failed');
      fetchAlerts();
    } catch (err) {
      alert('Error updating alert: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/alerts/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Delete failed');
      fetchAlerts();
    } catch (err) {
      alert('Error deleting alert: ' + err.message);
    }
  };

  const openEdit = (alert) => {
    setEditing(true);
    setEditingId(alert._id);
    setForm({ title: alert.title || '', description: alert.description || '', category: alert.category || '', severity: alert.severity || 'medium', active: alert.active !== false, blogSlug: alert.blogSlug || '' });
    setShowForm(true);
  };

  const saveAlert = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${API_BASE}/api/admin/alerts/${editingId}` : `${API_BASE}/api/admin/alerts`;
      const resp = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.message || 'Save failed');
      }
      setShowForm(false);
      setEditing(false);
      setEditingId(null);
      setForm(initialAlert);
      fetchAlerts();
    } catch (err) {
      alert('Error saving alert: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-card">Loading alerts...</div>;

  return (
    <div className="admin-card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Alert Management</h2>
        <div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>New Alert</button>
        </div>
      </div>
      <p>Manage scam alerts that appear in the ticker on the main site.</p>
      
      <table className="blog-list-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Severity</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => (
            <tr key={alert._id}>
              <td>{alert.title}</td>
              <td>{alert.category}</td>
              <td>
                <span className={`status-badge ${alert.severity?.toLowerCase()}`}>{alert.severity}</span>
              </td>
              <td>{alert.active ? '✅ Active' : '❌ Inactive'}</td>
              <td>
                <button className="btn btn-primary" onClick={() => handleToggleActive(alert._id, alert.active)}>
                  {alert.active ? 'Deactivate' : 'Activate'}
                </button>
                <button className="btn" onClick={() => openEdit(alert)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(alert._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {alerts.length === 0 && (
        <p style={{ marginTop: 16, color: '#666' }}>
          No alerts found. Frontend currently uses static data from mockData.js.
        </p>
      )}
      {showForm && (
        <div style={{position: 'fixed', left:0, top:0, right:0, bottom:0, background: 'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 200}}>
          <div style={{width: 700, maxWidth: '95%', background: 'white', padding: 20, borderRadius: 8, maxHeight: '90vh', overflow: 'auto'}}>
            <h3>{editing ? 'Edit Alert' : 'New Alert'}</h3>
            <div style={{display:'grid', gap:8}}>
              <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} />
              <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
              <select value={form.severity} onChange={e => setForm({...form, severity: e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <input placeholder="Blog Slug (optional)" value={form.blogSlug} onChange={e => setForm({...form, blogSlug: e.target.value})} />
              <label style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} />
                Active
              </label>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:8}}>
                <button className="btn" onClick={() => { setShowForm(false); setEditing(false); setForm(initialAlert); }}>Cancel</button>
                <button className="btn btn-primary" onClick={saveAlert}>{saving ? 'Saving…' : (editing ? 'Save' : 'Create')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlertManager;
