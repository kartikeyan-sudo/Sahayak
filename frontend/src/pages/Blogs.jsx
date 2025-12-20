import { useState, useEffect } from 'react';
import getApiBase from '../utils/apiBase';
import './Blogs.css';

function Blogs({ selectedBlog, onNavigate }) {
  const [activeSlug, setActiveSlug] = useState(selectedBlog || null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = getApiBase();

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/blogs`, { credentials: 'include' }).then(r => r.json()).then(data => {
      setBlogs(Array.isArray(data) ? data : (data.blogs || []));
    }).catch(err => {
      console.error('Failed to load blogs:', err);
    }).finally(() => setLoading(false));
  }, [API_BASE]);

  const openBlog = (slug) => setActiveSlug(slug);
  const backToList = () => setActiveSlug(null);

  const blog = blogs.find(b => b.slug === activeSlug);

  return (
    <div className="blogs-page">
      <div className="page-header">
        <h2>Learning Center</h2>
        <p>Practical guides and short explainers</p>
      </div>

      {!activeSlug && (
        <div className="blog-list card">
          {blogs.map((b) => (
            <article key={b.slug} className="blog-card">
              <h3>{b.title}</h3>
              <p className="excerpt">{b.excerpt}</p>
              <div className="meta">{b.author} · {b.date}</div>
              <div className="actions">
                <button className="visit-btn" onClick={() => openBlog(b.slug)}>Read Article →</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeSlug && blog && (
        <article className="blog-detail card">
          <div className="blog-header">
            <button className="back-btn" onClick={backToList}>← Back</button>
            <h2>{blog.title}</h2>
            <div className="meta">{blog.author} · {blog.date}</div>
          </div>

          <div className="blog-content">
            {blog.content.split('\n\n').map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="blog-footer">
            <button className="back-btn" onClick={() => onNavigate('resources')}>Back to Resources</button>
          </div>
        </article>
      )}
    </div>
  );
}

export default Blogs;
