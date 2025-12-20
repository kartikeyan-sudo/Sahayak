import React, { useState, useEffect } from 'react';
import getApiBase from '../utils/apiBase';

function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const initialForm = { title: '', slug: '', excerpt: '', content: '', author: '' };
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  
  const API_BASE = getApiBase();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/api/admin/blogs`, { credentials: 'include' });
      if (!resp.ok) throw new Error('Failed to fetch blogs');
      const data = await resp.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/blogs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error('Delete failed');
      fetchBlogs();
    } catch (err) {
      alert('Error deleting blog: ' + err.message);
    }
  };

  const handlePublish = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const resp = await fetch(`${API_BASE}/api/admin/blogs/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'published', publishedAt: new Date() })
      });
      if (!resp.ok) throw new Error('Publish failed');
      fetchBlogs();
    } catch (err) {
      alert('Error publishing: ' + err.message);
    }
  };

  const openEdit = (blog) => {
    setEditing(true);
    setEditingId(blog._id);
    setForm({ title: blog.title || '', slug: blog.slug || '', excerpt: blog.excerpt || '', content: blog.content || '', author: blog.author || '' });
    setShowForm(true);
  };

  const saveBlog = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `${API_BASE}/api/admin/blogs/${editingId}` : `${API_BASE}/api/admin/blogs`;
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
      setForm(initialForm);
      fetchBlogs();
    } catch (err) {
      alert('Error saving blog: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-card">Loading blogs...</div>;
  if (error) return <div className="admin-card">Error: {error}</div>;

  return (
    <div className="admin-card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Blog Management</h2>
        <div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>New Blog</button>
        </div>
      </div>
      <p>Total blogs: {blogs.length}</p>
      
      <table className="blog-list-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Slug</th>
            <th>Status</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {blogs.map(blog => (
            <tr key={blog._id}>
              <td>{blog.title}</td>
              <td><code>{blog.slug}</code></td>
              <td>
                <span className={`status-badge ${blog.status}`}>{blog.status}</span>
              </td>
              <td>{blog.author || '—'}</td>
              <td>
                {blog.status !== 'published' && (
                  <button className="btn btn-primary" onClick={() => handlePublish(blog._id)}>
                    Publish
                  </button>
                )}
                <button className="btn" onClick={() => openEdit(blog)}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(blog._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {blogs.length === 0 && (
        <p style={{ marginTop: 16, color: '#666' }}>
          No blogs found. The frontend currently uses static data from blogsData.js. 
          To test CMS integration, seed blogs into MongoDB.
        </p>
      )}
      {/* Blog create / edit modal */}
      {showForm && (
        <div style={{position: 'fixed', left:0, top:0, right:0, bottom:0, background: 'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 200}}>
          <div style={{width: 700, maxWidth: '95%', background: 'white', padding: 20, borderRadius: 8}}>
            <h3>{editing ? 'Edit Blog' : 'New Blog'}</h3>
            <div style={{display:'grid', gap:8}}>
              <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <input placeholder="Slug" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} />
              <input placeholder="Excerpt" value={form.excerpt} onChange={e => setForm({...form, excerpt: e.target.value})} />
              <input placeholder="Author" value={form.author} onChange={e => setForm({...form, author: e.target.value})} />
              <textarea placeholder="Content" value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={8} />
              <div style={{display:'flex', justifyContent:'flex-end', gap:8}}>
                <button className="btn" onClick={() => { setShowForm(false); setEditing(false); setForm(initialForm); }}>Cancel</button>
                <button className="btn btn-primary" onClick={saveBlog}>{saving ? 'Saving…' : (editing ? 'Save' : 'Create')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogManager;
