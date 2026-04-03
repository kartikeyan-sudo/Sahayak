import React, { useState, useEffect } from 'react';
import getApiBase from '../utils/apiBase';

function SchemeEditor() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialScheme = { name: '', code: '', governmentTag: '', description: '', url: '' };
  const [form, setForm] = useState(initialScheme);
  const [saving, setSaving] = useState(false);
  const API_BASE = getApiBase();

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/api/admin/schemes`, { credentials: 'include' });
      const data = await resp.json();
      setSchemes(data);
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/schemes/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ archived: !currentStatus })
      });
      if (!resp.ok) throw new Error('Update failed');
      fetchSchemes();
    } catch (err) {
      alert('Error updating scheme: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheme permanently?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/schemes/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Delete failed');
      fetchSchemes();
    } catch (err) {
      alert('Error deleting scheme: ' + err.message);
    }
  };

  const openEdit = (scheme) => {
    setEditing(true);
    setEditingId(scheme._id || scheme.id);
    setForm({ name: scheme.name || '', code: scheme.code || '', governmentTag: scheme.governmentTag || '', description: scheme.description || '', url: scheme.url || '' });
    setShowForm(true);
  };

  const saveScheme = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${API_BASE}/api/admin/schemes/${editingId}` : `${API_BASE}/api/admin/schemes`;
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
      setForm(initialScheme);
      fetchSchemes();
    } catch (err) {
      alert('Error saving scheme: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-card">Loading schemes...</div>;

  return (
    <div className="admin-card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Scheme & Policy Editor</h2>
        <div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>New Scheme</button>
        </div>
      </div>
      <p>Manage government schemes displayed in the Schemes Hub.</p>
      
      <table className="blog-list-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Tag</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {schemes.map(scheme => (
            <tr key={scheme._id || scheme.id}>
              <td>{scheme.name}</td>
              <td><code>{scheme.code}</code></td>
              <td>{scheme.governmentTag}</td>
              <td>{scheme.archived ? '📦 Archived' : '✅ Active'}</td>
              <td>
                <button className="btn btn-primary" onClick={() => handleArchive(scheme._id || scheme.id, scheme.archived)}>
                  {scheme.archived ? 'Unarchive' : 'Archive'}
                </button>
                <button className="btn" onClick={() => openEdit(scheme)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(scheme._id || scheme.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {schemes.length === 0 && (
        <p style={{ marginTop: 16, color: '#666' }}>
          No schemes found. Frontend currently uses static data from mockData.js.
        </p>
      )}
      {showForm && (
        <div style={{position: 'fixed', left:0, top:0, right:0, bottom:0, background: 'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 200}}>
          <div style={{width: 700, maxWidth: '95%', background: 'white', padding: 20, borderRadius: 8}}>
            <h3>{editing ? 'Edit Scheme' : 'New Scheme'}</h3>
            <div style={{display:'grid', gap:8}}>
              <input placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input placeholder="Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
              <input placeholder="Government Tag" value={form.governmentTag} onChange={e => setForm({...form, governmentTag: e.target.value})} />
              <input placeholder="Official URL" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={6} />
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <button className="btn" onClick={() => { setShowForm(false); setEditing(false); setForm(initialScheme); }}>Cancel</button>
                <button className="btn btn-primary" onClick={saveScheme}>{saving ? 'Saving…' : (editing ? 'Save' : 'Create')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SchemeEditor;
